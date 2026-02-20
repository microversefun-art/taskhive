import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/_core/hooks/useAuth";
import { Send, Phone, Video, MoreVertical, Paperclip } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: "text" | "image" | "file" | "system";
}

interface RealtimeChatProps {
  chatId: number;
  participantName: string;
  participantAvatar?: string;
  onClose?: () => void;
}

export default function RealtimeChat({
  chatId,
  participantName,
  participantAvatar,
  onClose,
}: RealtimeChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [participantTyping, setParticipantTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    const socket = io(window.location.origin, {
      query: {
        userId: user.id,
        username: user.name || "Anonymous",
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("[Chat] Connected to WebSocket");
      setIsConnecting(false);
      setIsOnline(true);

      // Join the chat room
      socket.emit("chat:join", { chatId });
    });

    socket.on("disconnect", () => {
      console.log("[Chat] Disconnected from WebSocket");
      setIsOnline(false);
    });

    socket.on("connect_error", (error: any) => {
      console.error("[Chat] Connection error:", error);
      setIsConnecting(false);
    });

    // Chat events
    socket.on("chat:message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      // Mark as read if from other user
      if (message.senderId !== user.id) {
        socket.emit("chat:mark-read", {
          chatId,
          messageId: message.id,
        });
      }
    });

    socket.on("chat:message-sent", (data: { messageId: string; timestamp: Date }) => {
      console.log("[Chat] Message sent:", data.messageId);
    });

    socket.on("chat:user-typing", (data: { userId: number; isTyping: boolean }) => {
      if (data.userId !== user.id) {
        setParticipantTyping(data.isTyping);
      }
    });

    socket.on("chat:user-joined", (data: { userId: number; username: string }) => {
      if (data.userId !== user.id) {
        setIsOnline(true);
      }
    });

    socket.on("chat:user-left", (data: { userId: number; username: string }) => {
      if (data.userId !== user.id) {
        setIsOnline(false);
      }
    });

    return () => {
      socket.emit("chat:leave", { chatId });
      socket.disconnect();
    };
  }, [user, chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !socketRef.current || !user) return;

    socketRef.current.emit("chat:message", {
      chatId,
      content: inputValue,
      type: "text",
    });

    setInputValue("");
    setIsTyping(false);
  };

  const handleTyping = (value: string) => {
    setInputValue(value);

    if (!socketRef.current) return;

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      socketRef.current.emit("chat:typing", {
        chatId,
        isTyping: true,
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current?.emit("chat:typing", {
        chatId,
        isTyping: false,
      });
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col bg-white">
      {/* Header */}
      <CardHeader className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={participantAvatar} />
              <AvatarFallback>{participantName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-base">{participantName}</CardTitle>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-500" : "bg-slate-400"
                  }`}
                />
                <p className="text-xs text-slate-600">
                  {isConnecting
                    ? "Подключение..."
                    : isOnline
                      ? "В сети"
                      : "Не в сети"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                <p>Начните разговор</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.senderId === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.senderId !== user?.id && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.senderId === user?.id
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-100 text-slate-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === user?.id
                          ? "text-blue-100"
                          : "text-slate-600"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}

            {participantTyping && (
              <div className="flex gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>{participantName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-slate-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="border-t border-slate-200 p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Введите сообщение..."
            value={inputValue}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isOnline || isConnecting}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            disabled={!isOnline || isConnecting}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isOnline || isConnecting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {!isOnline && !isConnecting && (
          <p className="text-xs text-red-600">
            ⚠️ Соединение потеряно. Попытка переподключения...
          </p>
        )}
      </div>
    </Card>
  );
}
