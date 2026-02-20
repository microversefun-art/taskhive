import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Phone, Video } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp: Date;
  isRead: boolean;
  avatar?: string;
}

interface ChatWindowProps {
  recipientName: string;
  recipientAvatar?: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
}

export function ChatWindow({
  recipientName,
  recipientAvatar,
  messages,
  onSendMessage,
  isLoading = false
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
              {recipientAvatar || recipientName.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-base">{recipientName}</CardTitle>
              <p className="text-xs text-slate-500">Онлайн</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost">
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Начните разговор с {recipientName}</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      {/* Input */}
      <div className="border-t p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Напишите сообщение..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          💡 Совет: Используйте чат для обсуждения деталей проекта
        </p>
      </div>
    </Card>
  );
}
