import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function SelfEmploymentPath() {
  const { data: status, isLoading } = trpc.boxes.getSelfEmploymentStatus.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="h-20 bg-muted animate-pulse" />
        <CardContent className="h-40 bg-muted mt-2 animate-pulse" />
      </Card>
    );
  }

  const statuses = [
    {
      level: 1,
      name: "👨‍💼 Сотрудник",
      description: "Начните работать и получайте опыт",
      requirements: "Выполните 1 задачу",
      benefits: ["Доступ к вакансиям", "Система рейтинга"],
    },
    {
      level: 2,
      name: "🎯 Фрилансер",
      description: "Работайте независимо и выбирайте задачи",
      requirements: "Завершите 5 боксов, заработайте 10000₽",
      benefits: ["Выбор задач", "Повышенный рейтинг", "Бонусы"],
    },
    {
      level: 3,
      name: "🚀 Предприниматель",
      description: "Развивайте свой бизнес и нанимайте людей",
      requirements: "Завершите 10 боксов, заработайте 50000₽",
      benefits: ["Создание команды", "Управление проектами", "Премиум поддержка"],
    },
    {
      level: 4,
      name: "👑 Владелец бизнеса",
      description: "Масштабируйте и управляйте сетью",
      requirements: "Завершите 20 боксов, заработайте 200000₽",
      benefits: ["Полный контроль", "Аналитика", "VIP поддержка"],
    },
  ];

  const getStatusColor = (level: number) => {
    if (level < status?.level!) return "text-green-600";
    if (level === status?.level) return "text-blue-600";
    return "text-gray-400";
  };

  const getStatusIcon = (level: number) => {
    if (level < status?.level!) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (level === status?.level) return <Circle className="w-6 h-6 text-blue-600 fill-blue-100" />;
    return <Lock className="w-6 h-6 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>📈 Путь к самозанятости</CardTitle>
            <CardDescription>Развивайтесь и работайте на себя</CardDescription>
          </div>
          <Badge className="bg-blue-100 text-blue-800 text-base px-3 py-1">
            Уровень {status?.level}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{statuses[status?.level! - 1]?.name}</h3>
            <span className="text-2xl">{status?.clientRating}⭐</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {statuses[status?.level! - 1]?.description}
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="font-bold text-green-600">{status?.monthlyEarnings}₽</div>
              <div className="text-muted-foreground">Месячный доход</div>
            </div>
            <div>
              <div className="font-bold">{status?.completedBoxes}</div>
              <div className="text-muted-foreground">Завершено боксов</div>
            </div>
            <div>
              <div className="font-bold text-blue-600">{status?.clientRating}</div>
              <div className="text-muted-foreground">Рейтинг</div>
            </div>
          </div>
        </div>

        {/* Milestone */}
        {status?.nextMilestone && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h4 className="font-semibold text-sm mb-2">🎯 Следующая цель</h4>
            <p className="text-sm text-muted-foreground mb-2">{status.nextMilestone.name}</p>
            <p className="text-xs text-muted-foreground mb-2">{status.nextMilestone.requirement}</p>
            <Progress value={status.nextMilestone.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Прогресс: {status.nextMilestone.progress}%
            </p>
          </div>
        )}

        {/* Status Timeline */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Карьерная лестница</h4>
          {statuses.map((s) => (
            <div key={s.level} className="flex gap-3">
              <div className="flex flex-col items-center">
                {getStatusIcon(s.level)}
                {s.level < statuses.length && (
                  <div
                    className={`w-1 h-8 ${
                      s.level < status?.level! ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-3">
                <p className={`font-semibold text-sm ${getStatusColor(s.level)}`}>{s.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{s.description}</p>
                <p className="text-xs font-medium text-amber-600 mb-2">📋 {s.requirements}</p>
                <div className="flex flex-wrap gap-1">
                  {s.benefits.map((benefit) => (
                    <Badge key={benefit} variant="outline" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-sm mb-2">💡 Советы для развития</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>✓ Выполняйте задачи из боксов для получения опыта</li>
            <li>✓ Поддерживайте высокий рейтинг и отзывы</li>
            <li>✓ Увеличивайте месячный доход через дополнительные проекты</li>
            <li>✓ Инвестируйте в развитие навыков</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
