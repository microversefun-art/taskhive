import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Clock, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function TaskStatsCard() {
  const { data: userTasks, isLoading } = trpc.tasks.getUserTasks.useQuery();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="h-20 bg-muted" />
        <CardContent className="h-24 bg-muted mt-2" />
      </Card>
    );
  }

  const stats = {
    total: userTasks?.length || 0,
    completed: userTasks?.filter((t) => t.status === "completed").length || 0,
    inProgress: userTasks?.filter((t) => t.status === "in_progress").length || 0,
    totalEarnings: userTasks?.reduce((sum, t) => sum + (t.reward || 0), 0) || 0,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Статистика задач
        </CardTitle>
        <CardDescription>Ваш прогресс на платформе</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Всего задач</div>
          </div>

          <div className="bg-white rounded-lg p-3 text-center border border-green-100">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Завершено</div>
          </div>

          <div className="bg-white rounded-lg p-3 text-center border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-xs text-muted-foreground">В работе</div>
          </div>

          <div className="bg-white rounded-lg p-3 text-center border border-green-100">
            <div className="text-2xl font-bold text-green-600">+{stats.totalEarnings}₽</div>
            <div className="text-xs text-muted-foreground">Заработано</div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">Процент завершения</span>
            <Badge className="bg-blue-100 text-blue-800">{completionRate}%</Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Recent Activity */}
        {userTasks && userTasks.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-sm mb-3">Последняя активность</h4>
            <div className="space-y-2">
              {userTasks.slice(0, 3).map((task) => (
                <div key={task.taskId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {task.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="text-muted-foreground">
                      {task.status === "completed" ? "Завершена" : "В работе"}
                    </span>
                  </div>
                  <span className="font-semibold text-green-600">+{task.reward}₽</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="flex gap-2">
            <Award className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-amber-900 mb-1">💡 Совет</p>
              <p className="text-amber-800">
                Выполняйте больше задач для повышения уровня и получения бонусов!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
