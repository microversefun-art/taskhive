import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, TrendingUp, Eye, Users } from 'lucide-react';

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const premiumPlans: PremiumPlan[] = [
  {
    id: 'basic',
    name: 'Базовый',
    price: 99,
    period: 'month',
    description: 'Выделение в поиске',
    features: [
      '✓ Выделение в результатах поиска',
      '✓ Цветной баннер на вакансии',
      '✓ +50% видимости',
      '✓ Статистика просмотров',
      '✗ Рекомендации',
      '✗ Топ-позиция'
    ],
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'standard',
    name: 'Стандартный',
    price: 299,
    period: 'month',
    description: 'Выделение + рекомендации',
    features: [
      '✓ Выделение в результатах поиска',
      '✓ Цветной баннер на вакансии',
      '✓ +100% видимости',
      '✓ Рекомендации в ленте',
      '✓ Статистика просмотров',
      '✗ Топ-позиция'
    ],
    popular: true,
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 999,
    period: 'month',
    description: 'Полный пакет',
    features: [
      '✓ Выделение в результатах поиска',
      '✓ Цветной баннер на вакансии',
      '✓ +200% видимости',
      '✓ Рекомендации в ленте',
      '✓ Топ-позиция в категории',
      '✓ Статистика просмотров',
      '✓ A/B тестирование заголовков'
    ],
    color: 'from-yellow-400 to-orange-500'
  }
];

interface ListingStats {
  views: number;
  clicks: number;
  conversions: number;
  trend: number;
}

const mockStats: ListingStats = {
  views: 1250,
  clicks: 87,
  conversions: 12,
  trend: 35
};

export default function PremiumListings() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState('basic');

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    // Здесь должна быть интеграция с платежной системой
    alert(`Переход к оплате плана ${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">💎 Премиум-листинги</h1>
          <p className="text-lg text-slate-600">
            Выделите вашу вакансию и привлеките больше исполнителей
          </p>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Просмотры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{mockStats.views}</div>
              <p className="text-sm text-green-600 mt-1">+{mockStats.trend}% за неделю</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Клики</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{mockStats.clicks}</div>
              <p className="text-sm text-slate-500 mt-1">CTR: 6.9%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Конверсии</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{mockStats.conversions}</div>
              <p className="text-sm text-slate-500 mt-1">Коэффициент: 13.8%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Текущий план</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Базовый</div>
              <p className="text-sm text-slate-500 mt-1">Активен до 15.03</p>
            </CardContent>
          </Card>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {premiumPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all ${
                plan.popular ? 'ring-2 ring-purple-500 md:scale-105' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                  Популярный
                </Badge>
              )}

              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} mb-3`} />
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <div className="text-4xl font-bold text-slate-900">
                    {plan.price}₽
                    <span className="text-lg text-slate-500 font-normal">/месяц</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className={feature.includes('✓') ? 'text-green-600' : 'text-slate-300'}>
                        {feature.includes('✓') ? '✓' : '✗'}
                      </span>
                      <span className={feature.includes('✓') ? 'text-slate-900' : 'text-slate-400'}>
                        {feature.replace('✓ ', '').replace('✗ ', '')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full ${
                    currentPlan === plan.id
                      ? 'bg-slate-200 text-slate-600 cursor-default'
                      : plan.popular
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : ''
                  }`}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? 'Текущий план' : 'Выбрать'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl">🚀 Преимущества премиума</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900">Больше видимости</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Ваша вакансия будет видна в топе поиска и в рекомендациях
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Users className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900">Больше кандидатов</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Привлеките лучших исполнителей благодаря выделению
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <TrendingUp className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900">Лучше результаты</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Увеличьте конверсию на 50-200% в зависимости от плана
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">❓ Часто задаваемые вопросы</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Могу ли я отменить подписку?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Да, вы можете отменить подписку в любой момент. Оплата прекратится в конце текущего месяца.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Как работает A/B тестирование?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Премиум план позволяет создавать несколько вариантов заголовка и описания для анализа какой вариант привлекает больше кандидатов.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Есть ли скидка за годовую подписку?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Да! При оплате за год вы получаете скидку 20%. Свяжитесь с поддержкой для получения предложения.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
