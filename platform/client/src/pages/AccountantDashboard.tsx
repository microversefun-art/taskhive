import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AccountantDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Mock data для графиков
  const incomeData = [
    { month: "Янв", income: 15000, expenses: 5000 },
    { month: "Фев", income: 22000, expenses: 7000 },
    { month: "Мар", income: 28000, expenses: 8000 },
    { month: "Апр", income: 35000, expenses: 10000 },
    { month: "Май", income: 42000, expenses: 12000 },
    { month: "Июн", income: 48000, expenses: 14000 },
  ];

  const taxData = [
    { name: "НДФЛ", amount: 48000, percentage: 13 },
    { name: "УСН", amount: 72000, percentage: 6 },
    { name: "НДС", amount: 36000, percentage: 18 },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">💰 AI Бухгалтер</h1>
          <p className="text-muted-foreground">Управление финансами, налогами и документами</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Общий доход</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₽ 190,000</div>
              <p className="text-xs text-green-600">+12% за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Расходы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₽ 56,000</div>
              <p className="text-xs text-red-600">+8% за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Чистая прибыль</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₽ 134,000</div>
              <p className="text-xs text-green-600">+14% за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Налоги к оплате</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₽ 24,700</div>
              <p className="text-xs text-orange-600">Срок: 15 февраля</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">📊 Аналитика</TabsTrigger>
            <TabsTrigger value="taxes">🏛️ Налоги</TabsTrigger>
            <TabsTrigger value="documents">📄 Документы</TabsTrigger>
            <TabsTrigger value="export">💾 Экспорт</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Доход и расходы</CardTitle>
                <CardDescription>Динамика за последние 6 месяцев</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={incomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₽ ${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" name="Доход" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Расходы" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Топ категории доходов</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Подработки</span>
                    <span className="font-semibold">₽ 95,000 (50%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "50%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Фриланс</span>
                    <span className="font-semibold">₽ 57,000 (30%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Консультации</span>
                    <span className="font-semibold">₽ 38,000 (20%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Топ категории расходов</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Комиссии платформ</span>
                    <span className="font-semibold">₽ 28,000 (50%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: "50%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Оборудование</span>
                    <span className="font-semibold">₽ 16,800 (30%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Обучение</span>
                    <span className="font-semibold">₽ 11,200 (20%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Taxes Tab */}
          <TabsContent value="taxes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Налоговая ситуация</CardTitle>
                <CardDescription>Рекомендуемая система налогообложения</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-blue-900 mb-2">✅ УСН 6% (Рекомендуется)</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Упрощённая система налогообложения для вашего дохода оптимальна
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Годовой доход:</span>
                      <span className="font-semibold">₽ 190,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Налог (6%):</span>
                      <span className="font-semibold">₽ 11,400</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Взносы:</span>
                      <span className="font-semibold">₽ 8,000</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold">Итого к оплате:</span>
                      <span className="font-semibold text-blue-900">₽ 19,400</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Сравнение систем</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={taxData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₽ ${value.toLocaleString()}`} />
                      <Bar dataKey="amount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Важно</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Налоги нужно платить ежеквартально</li>
                    <li>• Следующий платёж: 15 февраля 2026</li>
                    <li>• Рекомендуем вести учёт доходов и расходов</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Документы</CardTitle>
                <CardDescription>Счёта-фактуры, УПД, акты выполненных работ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">УПД (Универсальный передаточный документ)</h3>
                    <p className="text-sm text-muted-foreground">Для клиентов с НДС</p>
                  </div>
                  <Button>Создать</Button>
                </div>

                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Счёт-фактура</h3>
                    <p className="text-sm text-muted-foreground">Для налоговых целей</p>
                  </div>
                  <Button>Создать</Button>
                </div>

                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Акт выполненных работ</h3>
                    <p className="text-sm text-muted-foreground">Подтверждение завершения работы</p>
                  </div>
                  <Button>Создать</Button>
                </div>

                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Квитанция об оплате</h3>
                    <p className="text-sm text-muted-foreground">Подтверждение получения платежа</p>
                  </div>
                  <Button>Создать</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Экспорт данных</CardTitle>
                <CardDescription>Выгрузка в различные форматы и системы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">📊 Экспорт в 1С</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Автоматическая выгрузка всех операций в 1С Предприятие
                  </p>
                  <Button className="w-full">Экспортировать в 1С</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">📈 Экспорт в Excel</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Выгрузка всех доходов, расходов и налогов в Excel
                  </p>
                  <Button className="w-full" variant="outline">
                    Скачать Excel
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">📄 Экспорт в PDF</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Полный отчёт о финансовой деятельности в PDF
                  </p>
                  <Button className="w-full" variant="outline">
                    Скачать PDF
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">🔗 API интеграция</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Подключить автоматическую синхронизацию с вашей системой
                  </p>
                  <Button className="w-full" variant="outline">
                    Настроить API
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
