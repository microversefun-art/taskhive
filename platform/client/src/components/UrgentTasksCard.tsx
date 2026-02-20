import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MapPin, Clock, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

export function UrgentTasksCard() {
  const { data: tasks, isLoading } = trpc.tasks.getUrgent.useQuery({
    radius: 5000,
  });
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});

  // Calculate time remaining for each task
  useEffect(() => {
    const interval = setInterval(() => {
      if (tasks) {
        const newTimeLeft: { [key: string]: string } = {};
        tasks.forEach((task) => {
          const expiresAt = new Date(task.expiresAt).getTime();
          const now = new Date().getTime();
          const diff = expiresAt - now;

          if (diff > 0) {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            newTimeLeft[task.id] = `${minutes}м ${seconds}с`;
          } else {
            newTimeLeft[task.id] = "Истекла";
          }
        });
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  if (isLoading) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="h-6 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const urgentTasks = tasks?.filter((t) => t.type === "offline").slice(0, 3) || [];

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-red-600 animate-pulse" />
          <CardTitle className="text-lg">🔥 Срочные задачи</CardTitle>
        </div>
        <CardDescription>Здесь и сейчас - заработайте сегодня</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {urgentTasks.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Срочных задач нет, но они появляются постоянно
            </p>
          </div>
        ) : (
          urgentTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg p-3 border border-red-100 hover:border-red-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{task.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {task.description}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 whitespace-nowrap">
                  {task.reward}₽
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                {task.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Рядом</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-red-600 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{timeLeft[task.id] || "..."}</span>
                </div>
              </div>

              <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                Взять задачу
              </Button>
            </div>
          ))
        )}

        {/* View All Button */}
        <Button variant="outline" className="w-full mt-2">
          Смотреть все задачи →
        </Button>
      </CardContent>
    </Card>
  );
}
