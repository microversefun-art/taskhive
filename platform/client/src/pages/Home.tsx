import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, Users, TrendingUp, MapPin, DollarSign, Star, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { BusinessBoxesGrid } from "@/components/BusinessBoxesGrid";
import { UrgentTasksCard } from "@/components/UrgentTasksCard";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: hotJobs } = trpc.jobs.hotJobs.useQuery();
  const { data: partners } = trpc.partners.list.useQuery();

  const categories = [
    { name: "Курьер", icon: "🚚", count: 1240 },
    { name: "Склад", icon: "📦", count: 856 },
    { name: "Доставка", icon: "🚗", count: 923 },
    { name: "Ритейл", icon: "🛍️", count: 567 },
    { name: "Промышленность", icon: "🏭", count: 432 },
    { name: "Услуги", icon: "🔧", count: 678 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">TaskHive</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="/jobs" className="text-slate-600 hover:text-slate-900 transition">
              Вакансии
            </a>
            <a href="/boxes" className="text-slate-600 hover:text-slate-900 transition">
              Карьерные пути
            </a>
            <a href="/tasks" className="text-slate-600 hover:text-slate-900 transition">
              Задачи
            </a>
            <a href="#partners" className="text-slate-600 hover:text-slate-900 transition">
              Партнёры
            </a>
            <a href="#about" className="text-slate-600 hover:text-slate-900 transition">
              О нас
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{user?.name}</span>
                <Button variant="outline" size="sm">
                  Личный кабинет
                </Button>
              </div>
            ) : (
              <Button asChild size="sm">
                <a href={getLoginUrl()}>Войти</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Найди работу своей мечты
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              TaskHive — платформа для поиска подработок и краткосрочных вакансий. Подключайся к тысячам работодателей и начни зарабатывать уже сегодня.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-2xl mx-auto mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Поиск вакансий..."
                  className="pl-10 py-6 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" className="px-8">
                Поиск
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="secondary">💡 Быстрые деньги</Badge>
              <Badge variant="secondary">🔒 Безопасно</Badge>
              <Badge variant="secondary">⭐ Проверенные работодатели</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Jobs Popup */}
      {hotJobs && hotJobs.length > 0 && (
        <section className="py-12 px-4 bg-white border-t border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-bold text-slate-900">🔥 Горячие вакансии</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition cursor-pointer border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </CardDescription>
                      </div>
                      <Badge className="bg-red-500">HOT</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-green-600">
                          {job.salary ? `${job.salary} ₽` : `${job.salaryMin}-${job.salaryMax} ₽`}
                        </span>
                      </div>
                      <Badge variant="outline">{job.category}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">{job.description}</p>
                    <Button className="w-full" size="sm">
                      Откликнуться
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Urgent Tasks */}
      <section className="py-12 px-4 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <UrgentTasksCard />
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Популярные категории</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Card key={cat.name} className="hover:shadow-lg transition cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <h3 className="font-semibold text-slate-900 mb-1">{cat.name}</h3>
                  <p className="text-sm text-slate-500">{cat.count} вакансий</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Boxes */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-6xl mx-auto">
          <BusinessBoxesGrid />
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-16 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Наши партнёры и спонсоры</h2>

          {/* Platinum */}
          {partners && partners.some((p) => p.sponsorLevel === "platinum") && (
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6 text-yellow-400">💎 Платинум партнёры</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {partners
                  .filter((p) => p.sponsorLevel === "platinum")
                  .map((partner) => (
                    <Card key={partner.id} className="bg-slate-800 border-yellow-500">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">{partner.name}</CardTitle>
                        <CardDescription className="text-slate-300">{partner.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Gold */}
          {partners && partners.some((p) => p.sponsorLevel === "gold") && (
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6 text-yellow-600">🥇 Голд партнёры</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {partners
                  .filter((p) => p.sponsorLevel === "gold")
                  .map((partner) => (
                    <Card key={partner.id} className="bg-slate-800 border-yellow-600">
                      <CardHeader>
                        <CardTitle className="text-yellow-600">{partner.name}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Silver */}
          {partners && partners.some((p) => p.sponsorLevel === "silver") && (
            <div>
              <h3 className="text-xl font-bold mb-6 text-gray-400">🥈 Сильвер партнёры</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {partners
                  .filter((p) => p.sponsorLevel === "silver")
                  .map((partner) => (
                    <Card key={partner.id} className="bg-slate-800 border-gray-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">{partner.name}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Special Offer - Yandex Courier */}
      <section className="py-16 px-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">🚴 Специальное предложение для курьеров</h2>
          <p className="text-lg text-slate-600 mb-6">
            Выполни 100 заказов через Яндекс Курьер и получи электровелосипед в аренду на месяц за наш счёт!
          </p>
          <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
            Узнать подробнее <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <p className="text-slate-600">Активных вакансий</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">100K+</div>
              <p className="text-slate-600">Работников</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">10K+</div>
              <p className="text-slate-600">Работодателей</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">4.8★</div>
              <p className="text-slate-600">Средняя оценка</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">TaskHive</h3>
              <p className="text-sm">Платформа для поиска работы в России и СНГ</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Компания</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#about" className="hover:text-white transition">
                    О нас
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Блог
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Контакты
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Документы</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy" className="hover:text-white transition">
                    Политика конфиденциальности
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="hover:text-white transition">
                    Использование cookies
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-white transition">
                    Условия использования
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Социальные сети</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                    VK
                  </a>
                </li>
                <li>
                  <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                    Telegram
                  </a>
                </li>
                <li>
                  <a href="https://mail.ru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                    Mail.ru
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2026 TaskHive. Все права защищены. Данные хранятся на серверах в России.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
