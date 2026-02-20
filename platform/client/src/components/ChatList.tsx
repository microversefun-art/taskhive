import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Archive, Trash2 } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const [searchText, setSearchText] = useState('');

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes}м назад`;
    if (hours < 24) return `${hours}ч назад`;
    if (days < 7) return `${days}д назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-lg">💬 Сообщения</CardTitle>
      </CardHeader>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Поиск чатов..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <CardContent className="flex-1 overflow-y-auto p-0">
        {filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 p-4">
            <p>Чатов не найдено</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-3 cursor-pointer transition-colors border-l-4 ${
                  selectedChatId === chat.id
                    ? 'bg-blue-50 border-l-blue-500'
                    : 'hover:bg-slate-50 border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {chat.avatar || chat.name.charAt(0)}
                    </div>
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 truncate">{chat.name}</h3>
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{chat.lastMessage}</p>
                  </div>

                  {/* Unread Badge */}
                  {chat.unreadCount > 0 && (
                    <Badge className="flex-shrink-0 bg-blue-500">
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Footer Actions */}
      <div className="border-t p-3 flex gap-2">
        <button className="flex-1 py-2 px-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Archive className="w-4 h-4" />
          Архив
        </button>
        <button className="flex-1 py-2 px-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Trash2 className="w-4 h-4" />
          Удалить
        </button>
      </div>
    </Card>
  );
}
