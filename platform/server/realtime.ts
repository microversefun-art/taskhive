import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { z } from "zod";

/**
 * Real-time Chat System with WebSocket
 * Система real-time чатов для мгновенного обмена сообщениями
 */

export interface RealtimeMessage {
  id: string;
  chatId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: "text" | "image" | "file" | "system";
}

export interface RealtimeUser {
  userId: number;
  socketId: string;
  username: string;
  status: "online" | "away" | "offline";
  lastSeen: Date;
}

// Store active users and their socket connections
const activeUsers: Map<number, RealtimeUser> = new Map();
const chatRooms: Map<number, Set<string>> = new Map();
const userSockets: Map<number, string> = new Map();

export function initializeRealtime(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Middleware для аутентификации
  io.use((socket, next) => {
    const userId = socket.handshake.query.userId as string;
    const username = socket.handshake.query.username as string;

    if (!userId || !username) {
      return next(new Error("Invalid credentials"));
    }

    socket.data.userId = parseInt(userId);
    socket.data.username = username;
    next();
  });

  // Connection handler
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as number;
    const username = socket.data.username as string;

    console.log(`[Realtime] User ${username} (${userId}) connected: ${socket.id}`);

    // Добавить пользователя в активные
    activeUsers.set(userId, {
      userId,
      socketId: socket.id,
      username,
      status: "online",
      lastSeen: new Date(),
    });

    userSockets.set(userId, socket.id);

    // Broadcast user online status
    io.emit("user:online", {
      userId,
      username,
      status: "online",
      timestamp: new Date(),
    });

    // ============= Chat Events =============

    // Присоединиться к чату
    socket.on("chat:join", (data: { chatId: number }) => {
      const { chatId } = data;
      const roomName = `chat:${chatId}`;

      socket.join(roomName);

      if (!chatRooms.has(chatId)) {
        chatRooms.set(chatId, new Set());
      }
      chatRooms.get(chatId)!.add(socket.id);

      // Notify others in the chat
      io.to(roomName).emit("chat:user-joined", {
        userId,
        username,
        timestamp: new Date(),
      });

      console.log(`[Realtime] User ${username} joined chat ${chatId}`);
    });

    // Отправить сообщение
    socket.on("chat:message", (data: { chatId: number; content: string; type?: string }) => {
      const { chatId, content, type = "text" } = data;
      const roomName = `chat:${chatId}`;
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const message: RealtimeMessage = {
        id: messageId,
        chatId,
        senderId: userId,
        senderName: username,
        content,
        timestamp: new Date(),
        isRead: false,
        type: (type as any) || "text",
      };

      // Broadcast message to chat room
      io.to(roomName).emit("chat:message", message);

      // Emit to sender for confirmation
      socket.emit("chat:message-sent", {
        messageId,
        timestamp: new Date(),
      });

      console.log(`[Realtime] Message in chat ${chatId}: ${content.substring(0, 50)}`);
    });

    // Отметить сообщение как прочитанное
    socket.on("chat:mark-read", (data: { chatId: number; messageId: string }) => {
      const { chatId, messageId } = data;
      const roomName = `chat:${chatId}`;

      io.to(roomName).emit("chat:message-read", {
        messageId,
        userId,
        timestamp: new Date(),
      });
    });

    // Печатает сообщение
    socket.on("chat:typing", (data: { chatId: number; isTyping: boolean }) => {
      const { chatId, isTyping } = data;
      const roomName = `chat:${chatId}`;

      io.to(roomName).emit("chat:user-typing", {
        userId,
        username,
        isTyping,
        timestamp: new Date(),
      });
    });

    // Покинуть чат
    socket.on("chat:leave", (data: { chatId: number }) => {
      const { chatId } = data;
      const roomName = `chat:${chatId}`;

      socket.leave(roomName);

      const room = chatRooms.get(chatId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
          chatRooms.delete(chatId);
        }
      }

      io.to(roomName).emit("chat:user-left", {
        userId,
        username,
        timestamp: new Date(),
      });

      console.log(`[Realtime] User ${username} left chat ${chatId}`);
    });

    // ============= Notification Events =============

    // Отправить уведомление пользователю
    socket.on("notification:send", (data: { recipientId: number; title: string; content: string }) => {
      const { recipientId, title, content } = data;
      const recipientSocket = userSockets.get(recipientId);

      if (recipientSocket) {
        io.to(recipientSocket).emit("notification:received", {
          from: userId,
          fromName: username,
          title,
          content,
          timestamp: new Date(),
        });
      }
    });

    // ============= Presence Events =============

    // Получить список активных пользователей
    socket.on("presence:get-online", () => {
      const onlineUsers = Array.from(activeUsers.values()).map((user) => ({
        userId: user.userId,
        username: user.username,
        status: user.status,
      }));

      socket.emit("presence:online-users", onlineUsers);
    });

    // Обновить статус пользователя
    socket.on("presence:update-status", (data: { status: "online" | "away" | "offline" }) => {
      const { status } = data;
      const user = activeUsers.get(userId);

      if (user) {
        user.status = status;
        user.lastSeen = new Date();

        io.emit("presence:status-changed", {
          userId,
          username,
          status,
          timestamp: new Date(),
        });
      }
    });

    // ============= Disconnect Handler =============

    socket.on("disconnect", () => {
      console.log(`[Realtime] User ${username} (${userId}) disconnected`);

      activeUsers.delete(userId);
      userSockets.delete(userId);

      // Broadcast user offline status
      io.emit("user:offline", {
        userId,
        username,
        status: "offline",
        timestamp: new Date(),
      });

      // Leave all chat rooms
      chatRooms.forEach((room, chatId) => {
        if (room.has(socket.id)) {
          room.delete(socket.id);
          io.to(`chat:${chatId}`).emit("chat:user-left", {
            userId,
            username,
            timestamp: new Date(),
          });
        }
      });
    });

    // ============= Error Handler =============

    socket.on("error", (error) => {
      console.error(`[Realtime] Socket error for user ${userId}:`, error);
    });
  });

  return io;
}

// Helper functions for server-side operations

export function getActiveUsers(): RealtimeUser[] {
  return Array.from(activeUsers.values());
}

export function getUserStatus(userId: number): RealtimeUser | undefined {
  return activeUsers.get(userId);
}

export function getChatParticipants(chatId: number): RealtimeUser[] {
  const room = chatRooms.get(chatId);
  if (!room) return [];

  const participants: RealtimeUser[] = [];
  room.forEach((socketId) => {
    activeUsers.forEach((user) => {
      if (user.socketId === socketId) {
        participants.push(user);
      }
    });
  });

  return participants;
}

export function broadcastToChat(io: SocketIOServer, chatId: number, event: string, data: any) {
  const roomName = `chat:${chatId}`;
  io.to(roomName).emit(event, data);
}

export function notifyUser(io: SocketIOServer, userId: number, event: string, data: any) {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
}

// Message validation schema
export const messageSchema = z.object({
  chatId: z.number().positive(),
  content: z.string().min(1).max(5000),
  type: z.enum(["text", "image", "file", "system"]).default("text"),
});

// Chat join validation schema
export const chatJoinSchema = z.object({
  chatId: z.number().positive(),
});

// Typing validation schema
export const typingSchema = z.object({
  chatId: z.number().positive(),
  isTyping: z.boolean(),
});
