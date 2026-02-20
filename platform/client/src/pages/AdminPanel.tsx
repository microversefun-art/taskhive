import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Доступ запрещен
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">У вас нет прав доступа к админ-панели.</p>
            <Button onClick={() => navigate("/")} className="w-full">
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
            <p className="text-gray-600 mt-1">Управление платформой TaskHive</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Настройки
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut className="w-4 h-4" />
              Выход
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Всего пользователей</CardDescription>
              <CardTitle className="text-2xl mt-2">12,450</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 font-semibold">+12.5% от прошлого месяца</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Активные вакансии</CardDescription>
              <CardTitle className="text-2xl mt-2">3,847</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 font-semibold">+8.2% от прошлого месяца</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Заявок на вакансии</CardDescription>
              <CardTitle className="text-2xl mt-2">18,920</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 font-semibold">+23.1% от прошлого месяца</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Доход (месяц)</CardDescription>
              <CardTitle className="text-2xl mt-2">98,000 ₽</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 font-semibold">+15.3% от прошлого месяца</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Статистика платформы</CardTitle>
            <CardDescription>Основные показатели работы платформы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Активных пользователей сегодня</span>
                <span className="text-2xl font-bold">1,245</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Новых вакансий сегодня</span>
                <span className="text-2xl font-bold">45</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Новых заявок сегодня</span>
                <span className="text-2xl font-bold">128</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Доход сегодня</span>
                <span className="text-2xl font-bold text-green-600">3,240 ₽</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
