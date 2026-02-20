/**
 * Chat Service
 * Real-time чат между исполнителем и заказчиком
 */

import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments?: string[]; // URLs к файлам
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  editedAt?: Date;
  isEdited: boolean;
}

export interface Chat {
  id: string;
  taskId: string;
  executorId: string;
  clientId: string;
  executorName: string;
  clientName: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatParticipant {
  userId: string;
  userName: string;
  isOnline: boolean;
  lastSeen?: Date;
  typingIndicator: boolean;
}

// ============================================================================
// CHAT SERVICE
// ============================================================================

export class ChatService {
  private activeChats: Map<string, Set<any>> = new Map(); // chatId -> Set of WebSocket connections
  private typingUsers: Map<string, Set<string>> = new Map(); // chatId -> Set of typing userIds

  /**
   * Подписать пользователя на чат
   */
  subscribeToChat(chatId: string, userId: string, ws: any): void {
    if (!this.activeChats.has(chatId)) {
      this.activeChats.set(chatId, new Set());
    }
    this.activeChats.get(chatId)!.add(ws);

    // Отправить приветствие
    ws.send(
      JSON.stringify({
        type: "chat_subscribed",
        chatId,
        userId,
        timestamp: new Date().toISOString(),
      })
    );

    // Обработчик отключения
    ws.on("close", () => {
      const clients = this.activeChats.get(chatId);
      if (clients) {
        clients.delete(ws);
        if (clients.size === 0) {
          this.activeChats.delete(chatId);
        }
      }
      this.removeTypingIndicator(chatId, userId);
    });
  }

  /**
   * Отправить сообщение в чат
   */
  async sendMessage(message: ChatMessage): Promise<void> {
    const clients = this.activeChats.get(message.chatId);

    if (clients && clients.size > 0) {
      const payload = JSON.stringify({
        type: "message",
        message,
        timestamp: new Date().toISOString(),
      });

      clients.forEach((ws) => {
        try {
          ws.send(payload);
        } catch (error) {
          console.error("Failed to send message via WebSocket:", error);
        }
      });
    }
  }

  /**
   * Отправить typing indicator
   */
  async sendTypingIndicator(chatId: string, userId: string, isTyping: boolean): Promise<void> {
    if (isTyping) {
      if (!this.typingUsers.has(chatId)) {
        this.typingUsers.set(chatId, new Set());
      }
      this.typingUsers.get(chatId)!.add(userId);
    } else {
      this.removeTypingIndicator(chatId, userId);
    }

    const clients = this.activeChats.get(chatId);
    if (clients && clients.size > 0) {
      const payload = JSON.stringify({
        type: "typing",
        chatId,
        userId,
        isTyping,
        typingUsers: Array.from(this.typingUsers.get(chatId) || []),
        timestamp: new Date().toISOString(),
      });

      clients.forEach((ws) => {
        try {
          ws.send(payload);
        } catch (error) {
          console.error("Failed to send typing indicator:", error);
        }
      });
    }
  }

  /**
   * Отметить сообщения как прочитанные
   */
  async markAsRead(chatId: string, userId: string, messageIds: string[]): Promise<void> {
    const clients = this.activeChats.get(chatId);

    if (clients && clients.size > 0) {
      const payload = JSON.stringify({
        type: "messages_read",
        chatId,
        userId,
        messageIds,
        timestamp: new Date().toISOString(),
      });

      clients.forEach((ws) => {
        try {
          ws.send(payload);
        } catch (error) {
          console.error("Failed to send read receipt:", error);
        }
      });
    }
  }

  /**
   * Получить активные чаты пользователя
   */
  getActiveChatsForUser(userId: string): string[] {
    const activeChats: string[] = [];
    this.activeChats.forEach((clients, chatId) => {
      if (clients.size > 0) {
        activeChats.push(chatId);
      }
    });
    return activeChats;
  }

  /**
   * Получить количество активных соединений в чате
   */
  getActiveConnections(chatId: string): number {
    return this.activeChats.get(chatId)?.size || 0;
  }

  /**
   * Удалить typing indicator
   */
  private removeTypingIndicator(chatId: string, userId: string): void {
    const typingUsers = this.typingUsers.get(chatId);
    if (typingUsers) {
      typingUsers.delete(userId);
      if (typingUsers.size === 0) {
        this.typingUsers.delete(chatId);
      }
    }
  }

  /**
   * Заблокировать пользователя в чате
   */
  async blockUser(chatId: string, blockedUserId: string): Promise<void> {
    const clients = this.activeChats.get(chatId);

    if (clients && clients.size > 0) {
      const payload = JSON.stringify({
        type: "user_blocked",
        chatId,
        blockedUserId,
        timestamp: new Date().toISOString(),
      });

      clients.forEach((ws) => {
        try {
          ws.send(payload);
        } catch (error) {
          console.error("Failed to send block notification:", error);
        }
      });
    }
  }

  /**
   * Получить список активных пользователей в чате
   */
  getActiveUsers(chatId: string): Set<string> {
    // Это нужно реализовать с отслеживанием userId для каждого WebSocket
    return new Set();
  }
}

// ============================================================================
// CHAT BUILDER
// ============================================================================

export class ChatBuilder {
  /**
   * Создать новый чат
   */
  static createChat(
    taskId: string,
    executorId: string,
    clientId: string,
    executorName: string,
    clientName: string
  ): Chat {
    const chatId = `chat-${taskId}-${executorId}-${clientId}`;
    return {
      id: chatId,
      taskId,
      executorId,
      clientId,
      executorName,
      clientName,
      unreadCount: 0,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Создать сообщение
   */
  static createMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    content: string,
    attachments?: string[]
  ): ChatMessage {
    return {
      id: `msg-${Date.now()}-${Math.random()}`,
      chatId,
      senderId,
      senderName,
      content,
      attachments,
      read: false,
      createdAt: new Date(),
      isEdited: false,
    };
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const ChatMessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  content: z.string().min(1).max(5000),
  attachments: z.string().url().array().optional(),
  read: z.boolean(),
  readAt: z.date().optional(),
  createdAt: z.date(),
  editedAt: z.date().optional(),
  isEdited: z.boolean(),
});

export const ChatSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  executorId: z.string(),
  clientId: z.string(),
  executorName: z.string(),
  clientName: z.string(),
  lastMessage: z.string().optional(),
  lastMessageTime: z.date().optional(),
  unreadCount: z.number(),
  isBlocked: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SendMessageSchema = z.object({
  chatId: z.string(),
  senderId: z.string(),
  content: z.string().min(1).max(5000),
  attachments: z.string().url().array().optional(),
});

export const TypingIndicatorSchema = z.object({
  chatId: z.string(),
  userId: z.string(),
  isTyping: z.boolean(),
});

export const MarkAsReadSchema = z.object({
  chatId: z.string(),
  userId: z.string(),
  messageIds: z.string().array(),
});

export const BlockUserSchema = z.object({
  chatId: z.string(),
  blockedUserId: z.string(),
});
