import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function BusinessBoxesPage() {
  const { data: boxes, isLoading } = trpc.boxes.getAll.useQuery();
  const { data: userBoxes } = trpc.boxes.getUserBoxes.useQuery();
  const { data: status } = trpc.boxes.getSelfEmploymentStatus.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "Все", icon: "📦" },
    { id: "delivery", name: "Доставка", icon: "🚚" },
    { id: "retail", name: "Розница", icon: "🏪" },
    { id: "freelance", name: "Фриланс", icon: "💻" },
    { id: "sales", name: "Продажи", icon: "📱" },
    { id: "services", name: "Услуги", icon: "🔧" },
  ];

  const filteredBoxes = boxes?.filter(
    (box) => selectedCategory === "all" || box.category === selectedCategory
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Начинающий";
      case "intermediate":
        return "Средний";
      case "advanced":
        return "Продвинутый";
      case "expert":
        return "Эксперт";
      default:
        return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 Карьерные пути</h1>
          <p className="text-muted-foreground">
            Выберите направление развития и начните зарабатывать уже сегодня
          </p>
        </div>

        {/* Current Status */}
        {status && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Текущий уровень</div>
                  <div className="text-2xl font-bold">{status.status}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Месячный доход</div>
                  <div className="text-2xl font-bold text-green-600">{status.monthlyEarnings}₽</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Завершено боксов</div>
                  <div className="text-2xl font-bold">{status.completedBoxes}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Рейтинг</div>
                  <div className="text-2xl font-bold text-yellow-600">{status.clientRating}⭐</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Доступные боксы</TabsTrigger>
            <TabsTrigger value="progress">Мой прогресс</TabsTrigger>
          </TabsList>

          {/* Available Boxes */}
          <TabsContent value="available" className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  size="sm"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </div>

            {/* Boxes Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 bg-muted" />
                    <CardContent className="h-32 bg-muted mt-2" />
                  </Card>
                ))}
              </div>
            ) : filteredBoxes && filteredBoxes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBoxes.map((box) => {
                  const userBox = userBoxes?.find((ub) => ub.boxId === box.id);
                  const isStarted = !!userBox;

                  return (
                    <Card
                      key={box.id}
                      className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-4xl">{box.icon}</span>
                          <Badge className={getDifficultyColor(box.difficulty)}>
                            {getDifficultyLabel(box.difficulty)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{box.name}</CardTitle>
                        <CardDescription className="text-sm">{box.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4 flex-1">
                        {/* Progress Bar */}
                        {isStarted && userBox && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium">Прогресс</span>
                              <span className="text-muted-foreground">
                                {userBox.tasksCompleted}/{userBox.totalTasks}
                              </span>
                            </div>
                            <Progress value={userBox.progress} className="h-2" />
                          </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-bold text-base text-green-600">
                              {box.rewards.totalEarnings}₽
                            </div>
                            <div className="text-muted-foreground">Заработок</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 font-bold">
                              <Star className="w-3 h-3" />
                              {box.rating}
                            </div>
                            <div className="text-muted-foreground">Рейтинг</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{box.successRate}%</div>
                            <div className="text-muted-foreground">Успех</div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {box.estimatedTime}ч
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {box.reviews} отзывов
                          </div>
                        </div>

                        {/* Price */}
                        {box.price > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Доступ: {box.price}₽
                          </div>
                        )}

                        {/* Button */}
                        <Button
                          className="w-full mt-4"
                          variant={isStarted ? "outline" : "default"}
                          size="sm"
                        >
                          {isStarted ? "Продолжить" : "Начать"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Боксы не найдены</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress */}
          <TabsContent value="progress" className="space-y-4">
            {userBoxes && userBoxes.length > 0 ? (
              userBoxes.map((userBox) => {
                const box = boxes?.find((b) => b.id === userBox.boxId);
                return (
                  <Card key={userBox.boxId}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{box?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Начато: {new Date(userBox.startedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            userBox.status === "completed"
                              ? "default"
                              : userBox.status === "in_progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {userBox.status === "completed"
                            ? "✓ Завершено"
                            : userBox.status === "in_progress"
                            ? "В работе"
                            : "Отменено"}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Прогресс</span>
                          <span className="font-medium">
                            {userBox.tasksCompleted}/{userBox.totalTasks} задач
                          </span>
                        </div>
                        <Progress value={userBox.progress} className="h-3" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-600">+{userBox.earnings}₽</div>
                          <div className="text-xs text-muted-foreground">Заработано</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{userBox.progress}%</div>
                          <div className="text-xs text-muted-foreground">Выполнено</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{box?.rewards.totalEarnings}₽</div>
                          <div className="text-xs text-muted-foreground">Макс. награда</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Вы еще не начали ни один бокс</p>
                  <Button className="mt-4">Выбрать бокс</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">💡 Как работают карьерные пути?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>1. Выберите путь</strong> - Найдите направление, которое вам интересно
            </p>
            <p>
              <strong>2. Выполняйте задачи</strong> - Пошагово выполняйте задания и зарабатывайте
            </p>
            <p>
              <strong>3. Получайте награды</strong> - Заработки, сертификаты, бейджи и статус
            </p>
            <p>
              <strong>4. Развивайтесь</strong> - Повышайте уровень и работайте на себя
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
