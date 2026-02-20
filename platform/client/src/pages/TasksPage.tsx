import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function TasksPage() {
  const { data: urgentTasks } = trpc.tasks.getUrgent.useQuery({ radius: 5000 });
  const { data: userTasks } = trpc.tasks.getUserTasks.useQuery();
  const { data: categories } = trpc.tasks.getPopularCategories.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = urgentTasks?.filter((task) => {
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case "online":
        return "💻 Онлайн";
      case "offline":
        return "🏢 Офлайн";
      case "hybrid":
        return "🔄 Гибрид";
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Легко";
      case "medium":
        return "Средне";
      case "hard":
        return "Сложно";
      default:
        return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📋 Доступные задачи</h1>
          <p className="text-muted-foreground">
            Найдите и выполните задачу, которая вам подходит
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <Input
            placeholder="Поиск по названию или описанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              size="sm"
            >
              Все
            </Button>
            {categories?.map((cat) => (
              <Button
                key={cat.category}
                variant={selectedCategory === cat.category ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.category)}
                size="sm"
              >
                {cat.icon} {cat.category} ({cat.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Доступные</TabsTrigger>
            <TabsTrigger value="active">В работе</TabsTrigger>
            <TabsTrigger value="completed">Завершенные</TabsTrigger>
          </TabsList>

          {/* Available Tasks */}
          <TabsContent value="available" className="space-y-4">
            {filteredTasks && filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      {/* Task Info */}
                      <div className="md:col-span-2">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">{task.type === "online" ? "💻" : "🏢"}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{getTaskTypeLabel(task.type)}</Badge>
                          <Badge className={getDifficultyColor(task.difficulty)}>
                            {getDifficultyLabel(task.difficulty)}
                          </Badge>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2">
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-green-600">{task.reward}₽</div>
                          <div className="text-xs text-muted-foreground">Награда</div>
                        </div>
                        {task.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>Рядом</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{task.timeLimit} мин</span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-end">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Взять задачу
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Задачи не найдены</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Active Tasks */}
          <TabsContent value="active" className="space-y-4">
            {userTasks?.filter((ut) => ut.status === "in_progress").length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Нет активных задач</p>
                </CardContent>
              </Card>
            ) : (
              userTasks
                ?.filter((ut) => ut.status === "in_progress")
                .map((userTask) => (
                  <Card key={userTask.taskId}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Задача в работе</h3>
                          <p className="text-sm text-muted-foreground">
                            Начата: {userTask.startedAt && new Date(userTask.startedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button variant="outline">Завершить</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          {/* Completed Tasks */}
          <TabsContent value="completed" className="space-y-4">
            {userTasks?.filter((ut) => ut.status === "completed").length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Нет завершенных задач</p>
                </CardContent>
              </Card>
            ) : (
              userTasks
                ?.filter((ut) => ut.status === "completed")
                .map((userTask) => (
                  <Card key={userTask.taskId} className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <h3 className="font-semibold">Задача завершена</h3>
                            <p className="text-sm text-muted-foreground">
                              Заработано: {userTask.reward}₽
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">+{userTask.reward}₽</div>
                          <div className="text-xs text-muted-foreground">
                            {userTask.completedAt && new Date(userTask.completedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">💡 Как выполнять задачи?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>1. Выберите задачу</strong> - Найдите подходящую вам задачу по типу и награде
            </p>
            <p>
              <strong>2. Нажмите "Взять задачу"</strong> - Задача перейдет в статус "В работе"
            </p>
            <p>
              <strong>3. Выполните задачу</strong> - Следуйте инструкциям и выполните все требования
            </p>
            <p>
              <strong>4. Загрузите доказательство</strong> - Отправьте фото, видео или текст
            </p>
            <p>
              <strong>5. Получите награду</strong> - Деньги поступят в течение 5 минут
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
