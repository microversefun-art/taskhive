import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Briefcase, Star, TrendingUp, Settings, LogOut, Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile } = trpc.profile.get.useQuery();
  const { data: applications } = trpc.applications.getByWorker.useQuery();
  const { data: scoring } = trpc.scoring.get.useQuery();
  const { data: chats } = trpc.chats.list.useQuery();
  const { data: notifications } = trpc.notifications.list.useQuery({ limit: 10 });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getScoreLevelColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "text-green-600";
      case "high":
        return "text-blue-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Личный кабинет</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile?.avatar || undefined} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                  <p className="text-slate-600">{user?.email}</p>
                  {profile?.isVerified && <Badge className="mt-2">✓ Верифицирован</Badge>}
                </div>
              </div>
              <Button>Редактировать профиль</Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Откликов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{applications?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Всего откликов</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Рейтинг</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-slate-900">
                  {profile?.averageRating ?? "0"}
                </div>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xs text-slate-500 mt-1">{profile?.totalReviews || 0} отзывов</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Завершено работ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{profile?.completedJobs || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Успешно завершено</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Скоринг</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getScoreLevelColor(scoring?.scoreLevel || "low")}`}>
                {scoring?.overallScore || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1 capitalize">{scoring?.scoreLevel || "low"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Мои отклики
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Чаты
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Скоринг
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Уведомления
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Мои отклики</CardTitle>
                <CardDescription>Список всех ваших откликов на вакансии</CardDescription>
              </CardHeader>
              <CardContent>
                {applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-900">Вакансия #{app.jobId}</p>
                          <p className="text-sm text-slate-600">
                            Отклик: {new Date(app.appliedAt).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              app.status === "accepted"
                                ? "default"
                                : app.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {app.status === "pending"
                              ? "Ожидание"
                              : app.status === "accepted"
                                ? "Принят"
                                : app.status === "rejected"
                                  ? "Отклонен"
                                  : "Завершен"}
                          </Badge>
                          {app.status === "accepted" && (
                            <Button size="sm">Написать сообщение</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-600 py-8">Вы еще не подали откликов</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chats Tab */}
          <TabsContent value="chats">
            <Card>
              <CardHeader>
                <CardTitle>Чаты</CardTitle>
                <CardDescription>Ваши диалоги с работодателями</CardDescription>
              </CardHeader>
              <CardContent>
                {chats && chats.length > 0 ? (
                  <div className="space-y-3">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">Чат #{chat.id}</p>
                          <p className="text-sm text-slate-600 line-clamp-1">
                            {chat.lastMessage || "Нет сообщений"}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Открыть
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-600 py-8">У вас нет активных чатов</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scoring Tab */}
          <TabsContent value="scoring">
            <Card>
              <CardHeader>
                <CardTitle>Система скоринга</CardTitle>
                <CardDescription>Ваши показатели и оценки</CardDescription>
              </CardHeader>
              <CardContent>
                {scoring ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-slate-600 mb-1">IQ Оценка</p>
                        <p className="text-3xl font-bold text-blue-600">{scoring.iqScore}</p>
                        <p className="text-xs text-slate-500 mt-2">из 200</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-slate-600 mb-1">Профессиональный рейтинг</p>
                        <p className="text-3xl font-bold text-green-600">{scoring.professionalScore}</p>
                        <p className="text-xs text-slate-500 mt-2">из 100</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-slate-600 mb-1">Надежность</p>
                        <p className="text-3xl font-bold text-purple-600">{scoring.reliabilityScore}</p>
                        <p className="text-xs text-slate-500 mt-2">из 100</p>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-slate-600 mb-2">Итоговый скор</p>
                      <div className="flex items-center gap-4">
                        <div className="text-5xl font-bold text-blue-600">{scoring.overallScore}</div>
                        <div>
                          <Badge className="mb-2 capitalize">{scoring.scoreLevel}</Badge>
                          <p className="text-sm text-slate-600">
                            Уровень: {
                              scoring.scoreLevel === "excellent"
                                ? "Отличный"
                                : scoring.scoreLevel === "high"
                                  ? "Высокий"
                                  : scoring.scoreLevel === "medium"
                                    ? "Средний"
                                    : "Низкий"
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-600 py-8">Скоринг еще не рассчитан</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>Ваши последние уведомления</CardDescription>
              </CardHeader>
              <CardContent>
                {notifications && notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border rounded-lg ${
                          notif.isRead
                            ? "bg-slate-50 border-slate-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <p className="font-semibold text-slate-900">{notif.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{notif.content}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notif.createdAt).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-600 py-8">Нет уведомлений</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
