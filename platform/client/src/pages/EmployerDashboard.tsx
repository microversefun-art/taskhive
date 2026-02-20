import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

const CATEGORIES = ["Курьер", "Склад", "Доставка", "Ритейл", "Промышленность", "Услуги"];

export default function EmployerDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    salary: "",
    salaryMin: "",
    salaryMax: "",
    location: "",
    region: "",
    duration: "Одноразовая",
  });

  const { data: jobs } = trpc.jobs.list.useQuery({ limit: 100, offset: 0 });
  const { mutate: createJob, isPending } = trpc.jobs.create.useMutation({
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        salary: "",
        salaryMin: "",
        salaryMax: "",
        location: "",
        region: "",
        duration: "Одноразовая",
      });
    },
  });

  const handleCreateJob = () => {
    createJob({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      salary: formData.salary ? parseInt(formData.salary) : undefined,
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
      location: formData.location,
      region: formData.region,
      duration: formData.duration,
    });
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const stats = {
    totalJobs: jobs?.length || 0,
    activeJobs: jobs?.filter((j) => j.status === "active").length || 0,
    totalApplications: jobs?.reduce((sum, j) => sum + (j.applicationsCount || 0), 0) || 0,
    totalViews: jobs?.reduce((sum, j) => sum + (j.viewCount || 0), 0) || 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Панель работодателя</h1>
            <p className="text-slate-600 mt-1">Управляйте вакансиями и откликами</p>
          </div>
          <div className="flex items-center gap-4">
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Активных вакансий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.activeJobs}</div>
              <p className="text-xs text-slate-500 mt-1">из {stats.totalJobs}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Откликов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalApplications}</div>
              <p className="text-xs text-slate-500 mt-1">Всего откликов</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Просмотров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalViews}</div>
              <p className="text-xs text-slate-500 mt-1">Всего просмотров</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Рейтинг</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">4.9</div>
              <p className="text-xs text-slate-500 mt-1">из 5.0</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="jobs">Мои вакансии</TabsTrigger>
              <TabsTrigger value="applications">Отклики</TabsTrigger>
              <TabsTrigger value="analytics">Аналитика</TabsTrigger>
            </TabsList>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Создать вакансию
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Создать новую вакансию</DialogTitle>
                  <DialogDescription>Заполните информацию о вакансии</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Название должности
                    </label>
                    <Input
                      placeholder="Курьер, Кладовщик, и т.д."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Описание
                    </label>
                    <Textarea
                      placeholder="Подробное описание вакансии..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Категория
                      </label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Тип работы
                      </label>
                      <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Одноразовая">Одноразовая</SelectItem>
                          <SelectItem value="Постоянная">Постоянная</SelectItem>
                          <SelectItem value="Проектная">Проектная</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Зарплата
                      </label>
                      <Input
                        type="number"
                        placeholder="1500"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        От
                      </label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={formData.salaryMin}
                        onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        До
                      </label>
                      <Input
                        type="number"
                        placeholder="2000"
                        value={formData.salaryMax}
                        onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Город
                      </label>
                      <Input
                        placeholder="Москва"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Регион
                      </label>
                      <Input
                        placeholder="Московская область"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={handleCreateJob}
                      disabled={isPending}
                    >
                      {isPending ? "Создание..." : "Создать вакансию"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Мои вакансии</CardTitle>
                <CardDescription>Управляйте вашими вакансиями</CardDescription>
              </CardHeader>
              <CardContent>
                {jobs && jobs.length > 0 ? (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900">{job.title}</p>
                            <Badge variant={job.status === "active" ? "default" : "secondary"}>
                              {job.status === "active" ? "Активна" : "Закрыта"}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.applicationsCount} откликов
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {job.viewCount} просмотров
                            </span>
                            <span>{job.category}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-600 py-8">У вас нет вакансий</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Отклики на вакансии</CardTitle>
                <CardDescription>Управляйте откликами работников</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">Работник #{i}</p>
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          <span>Вакансия: Курьер</span>
                          <span>Статус: Ожидание</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Принять
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Аналитика</CardTitle>
                <CardDescription>Статистика по вакансиям</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-slate-900 mb-4">Просмотры по дням</h3>
                    <div className="h-40 bg-white rounded flex items-center justify-center text-slate-400">
                      График загружается...
                    </div>
                  </div>
                  <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-slate-900 mb-4">Отклики по дням</h3>
                    <div className="h-40 bg-white rounded flex items-center justify-center text-slate-400">
                      График загружается...
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
