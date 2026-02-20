import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Users, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export function BusinessBoxesGrid() {
  const { data: boxes, isLoading } = trpc.boxes.getAll.useQuery();
  const { data: userBoxes } = trpc.boxes.getUserBoxes.useQuery();
  const [selectedBox, setSelectedBox] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted" />
            <CardContent className="h-32 bg-muted mt-2" />
          </Card>
        ))}
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">🚀 Карьерные пути</h2>
        <p className="text-muted-foreground">
          Выберите направление развития и начните зарабатывать уже сегодня
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boxes?.map((box) => {
          const userBox = userBoxes?.find((ub) => ub.boxId === box.id);
          const isStarted = !!userBox;

          return (
            <Card
              key={box.id}
              className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              onClick={() => setSelectedBox(box.id)}
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

              <CardContent className="space-y-4">
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

      {/* Info Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">💡 Как это работает?</CardTitle>
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
            <strong>4. Станьте предпринимателем</strong> - Развивайтесь и работайте на себя
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
