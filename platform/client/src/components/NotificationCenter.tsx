import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  Trash2,
  Check,
  CheckCheck,
  MessageSquare,
  DollarSign,
  Star,
  Briefcase,
  Settings,
} from "lucide-react";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, refetch } = trpc.notifications.list.useQuery({ limit: 50 });
  const { data: stats } = trpc.notifications.stats.useQuery();
  const { mutate: markAsRead } = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  const { mutate: markAllAsRead } = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  const { mutate: deleteNotification } = trpc.notifications.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application":
        return <Briefcase className="w-4 h-4" />;
      case "message":
        return <MessageSquare className="w-4 h-4" />;
      case "payment":
        return <DollarSign className="w-4 h-4" />;
      case "rating":
        return <Star className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "application":
        return "bg-blue-50 border-blue-200";
      case "message":
        return "bg-purple-50 border-purple-200";
      case "payment":
        return "bg-green-50 border-green-200";
      case "rating":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const unreadCount = stats?.unread || 0;

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Центр уведомлений</DialogTitle>
            <DialogDescription>
              {unreadCount > 0 ? `${unreadCount} непрочитанных уведомлений` : "Нет новых уведомлений"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead()}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Отметить все как прочитанные
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Настройки
              </Button>
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-96 w-full rounded-md border border-slate-200">
              {notifications && notifications.length > 0 ? (
                <div className="space-y-2 p-4">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`${getNotificationColor(notification.type)} cursor-pointer transition hover:shadow-md ${
                        !notification.isRead ? "border-l-4" : ""
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="text-slate-600 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">
                                  {notification.title}
                                </p>
                                {notification.content && (
                                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                    {notification.content}
                                  </p>
                                )}
                              </div>
                              {!notification.isRead && (
                                <Badge className="bg-blue-600 flex-shrink-0">Новое</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              {new Date(notification.createdAt).toLocaleString("ru-RU")}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead({ notificationId: notification.id })}
                              className="text-xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Прочитано
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification({ notificationId: notification.id })}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Удалить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-600">Нет уведомлений</p>
                </div>
              )}
            </ScrollArea>

            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-xs text-slate-600">Всего</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.byType.application || 0}</p>
                  <p className="text-xs text-slate-600">Отклики</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.byType.message || 0}</p>
                  <p className="text-xs text-slate-600">Сообщения</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.byType.payment || 0}</p>
                  <p className="text-xs text-slate-600">Платежи</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
