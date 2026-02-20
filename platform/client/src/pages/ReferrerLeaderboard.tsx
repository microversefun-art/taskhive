import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ReferrerEntry {
  rank: number;
  userId: number;
  username: string;
  totalEarnings: number;
  activeReferrals: number;
  totalReferrals: number;
  conversionRate: number;
  badge?: string;
  trend?: 'up' | 'down' | 'stable';
}

const mockLeaderboardData: ReferrerEntry[] = [
  {
    rank: 1,
    userId: 101,
    username: 'Иван К.',
    totalEarnings: 125000,
    activeReferrals: 45,
    totalReferrals: 120,
    conversionRate: 37,
    badge: '👑',
    trend: 'up'
  },
  {
    rank: 2,
    userId: 102,
    username: 'Мария П.',
    totalEarnings: 98500,
    activeReferrals: 38,
    totalReferrals: 105,
    conversionRate: 36,
    badge: '🥈',
    trend: 'stable'
  },
  {
    rank: 3,
    userId: 103,
    username: 'Алексей С.',
    totalEarnings: 87300,
    activeReferrals: 32,
    totalReferrals: 95,
    conversionRate: 33,
    badge: '🥉',
    trend: 'down'
  },
  {
    rank: 4,
    userId: 104,
    username: 'Елена М.',
    totalEarnings: 76200,
    activeReferrals: 28,
    totalReferrals: 85,
    conversionRate: 32,
    trend: 'up'
  },
  {
    rank: 5,
    userId: 105,
    username: 'Дмитрий В.',
    totalEarnings: 65400,
    activeReferrals: 24,
    totalReferrals: 75,
    conversionRate: 32,
    trend: 'stable'
  }
];

export default function ReferrerLeaderboard() {
  const [activeTab, setActiveTab] = useState('earnings');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('all_time');

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🏆 Лидерборд рефереров</h1>
          <p className="text-lg text-slate-600">
            Топ рефереры по заработкам и активности. Присоединяйся к лучшим!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Твоя позиция</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">#42</div>
              <p className="text-sm text-slate-500 mt-1">+5 мест за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Твой заработок</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">45,000₽</div>
              <p className="text-sm text-slate-500 mt-1">+12,500₽ этот месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Активные рефералы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">18</div>
              <p className="text-sm text-slate-500 mt-1">+3 новых этот месяц</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Топ рефереры</CardTitle>
                <CardDescription>Лучшие рефереры платформы</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={period === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('weekly')}
                >
                  Неделя
                </Button>
                <Button
                  variant={period === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('monthly')}
                >
                  Месяц
                </Button>
                <Button
                  variant={period === 'all_time' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('all_time')}
                >
                  Всё время
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="earnings">💰 По заработкам</TabsTrigger>
                <TabsTrigger value="activity">🔥 По активности</TabsTrigger>
              </TabsList>

              <TabsContent value="earnings" className="mt-6">
                <div className="space-y-3">
                  {mockLeaderboardData.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-slate-400 w-8 text-center">
                          {entry.badge || `#${entry.rank}`}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">{entry.username}</div>
                          <div className="text-sm text-slate-500">
                            {entry.totalReferrals} приглашено • {entry.activeReferrals} активных
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(entry.totalEarnings)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Конверсия: {entry.conversionRate}%
                          </div>
                        </div>
                        <div className="text-2xl">{getTrendIcon(entry.trend)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <div className="space-y-3">
                  {[...mockLeaderboardData]
                    .sort((a, b) => b.activeReferrals - a.activeReferrals)
                    .map((entry, index) => (
                      <div
                        key={entry.rank}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-2xl font-bold text-slate-400 w-8 text-center">
                            {index === 0 ? '🔥' : index === 1 ? '⚡' : `#${index + 1}`}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">{entry.username}</div>
                            <div className="text-sm text-slate-500">
                              Конверсия: {entry.conversionRate}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <div className="text-lg font-bold text-blue-600">
                              {entry.activeReferrals}
                            </div>
                            <div className="text-xs text-slate-500">активных рефералов</div>
                          </div>
                          <div className="text-2xl">{getTrendIcon(entry.trend)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 Как попасть в лидерборд?</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2">
              <li>✅ Приглашай друзей по реферальной ссылке</li>
              <li>✅ Получай 10-20% от комиссии их заказов</li>
              <li>✅ Поднимайся в рейтинге и получай бейджи</li>
              <li>✅ Топ рефереры получают дополнительные бонусы</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
