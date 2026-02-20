import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  DollarSign,
  Clock,
  Users,
  Star,
  Share2,
  Heart,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Calendar,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function JobDetail() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Получаем ID вакансии из URL
  const jobId = new URLSearchParams(window.location.search).get("id");

  const { data: job, isLoading } = trpc.jobs.getById.useQuery(
    { id: parseInt(jobId || "0") },
    { enabled: !!jobId }
  );

  const { data: applications } = trpc.applications.getByWorker.useQuery();
  const { mutate: submitApplication, isPending } = trpc.applications.submit.useMutation({
    onSuccess: () => {
      setIsApplied(true);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Загрузка вакансии...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Button variant="ghost" onClick={() => setLocation("/jobs")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к вакансиям
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-600">Вакансия не найдена</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasApplied = applications?.some((app) => app.jobId === job.id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/jobs")}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к вакансиям
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {job.isHot && <Badge className="bg-red-500">🔥 HOT</Badge>}
                <Badge variant="outline">{job.category}</Badge>
                <Badge className="bg-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Верифицирован
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-slate-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}, {job.region}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Опубликовано {new Date(job.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSaved(!isSaved)}
                className={isSaved ? "bg-red-50 border-red-300" : ""}
              >
                <Heart className={`w-5 h-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Info */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {job.salary ? `${job.salary}` : `${job.salaryMin}-${job.salaryMax}`}
                    </div>
                    <p className="text-sm text-slate-600">₽ в день</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{job.duration}</div>
                    <p className="text-sm text-slate-600">Тип работы</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{job.applicationsCount}</div>
                    <p className="text-sm text-slate-600">Откликов</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-3xl font-bold text-yellow-600">4.8</span>
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    </div>
                    <p className="text-sm text-slate-600">Рейтинг</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="description" className="space-y-4">
              <TabsList>
                <TabsTrigger value="description">Описание</TabsTrigger>
                <TabsTrigger value="requirements">Требования</TabsTrigger>
                <TabsTrigger value="benefits">Преимущества</TabsTrigger>
                <TabsTrigger value="reviews">Отзывы</TabsTrigger>
              </TabsList>

              {/* Description Tab */}
              <TabsContent value="description">
                <Card>
                  <CardHeader>
                    <CardTitle>Описание вакансии</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap">{job.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Requirements Tab */}
              <TabsContent value="requirements">
                <Card>
                  <CardHeader>
                    <CardTitle>Требования</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Обязательные требования:</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          <li>Возраст от 18 лет</li>
                          <li>Наличие документов (паспорт, ИНН)</li>
                          <li>Физическая выносливость</li>
                          <li>Пунктуальность и ответственность</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Желательные требования:</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          <li>Опыт работы в похожей должности</li>
                          <li>Наличие своего транспорта</li>
                          <li>Знание города</li>
                          <li>Коммуникативные навыки</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Benefits Tab */}
              <TabsContent value="benefits">
                <Card>
                  <CardHeader>
                    <CardTitle>Преимущества</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">Гибкий график</p>
                          <p className="text-sm text-slate-600">Работайте когда удобно</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">Быстрая оплата</p>
                          <p className="text-sm text-slate-600">Выплата в день выполнения</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">Бонусы</p>
                          <p className="text-sm text-slate-600">Дополнительные выплаты за результаты</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">Поддержка</p>
                          <p className="text-sm text-slate-600">24/7 техническая поддержка</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Отзывы работников</CardTitle>
                    <CardDescription>12 отзывов</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b border-slate-200 pb-4 last:border-0">
                          <div className="flex items-start gap-3 mb-2">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>РП</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">Работник #{i}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className="w-4 h-4 text-yellow-500 fill-yellow-500"
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-slate-600">Отличная работа</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-700 text-sm">
                            Хорошая вакансия, быстрая оплата, вежливый работодатель. Рекомендую!
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Employer Card */}
            <Card className="mb-6 sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">О работодателе</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>РА</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900">Работодатель</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm text-slate-600">4.9</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    1000+ сотрудников
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="w-4 h-4" />
                    Активных вакансий: 25
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Посмотреть профиль
                </Button>
              </CardContent>
            </Card>

            {/* Apply Card */}
            <Card className="sticky top-96">
              <CardHeader>
                <CardTitle className="text-lg">Откликнуться</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasApplied || isApplied ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-900">Вы уже откликнулись</p>
                    <p className="text-sm text-green-700 mt-1">
                      Работодатель скоро с вами свяжется
                    </p>
                  </div>
                ) : !user ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-blue-900 mb-3">Требуется вход</p>
                    <Button className="w-full">Войти в аккаунт</Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-slate-600">
                      Вы откликнетесь на эту вакансию и работодатель сможет связаться с вами
                    </p>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() =>
                        submitApplication({
                          jobId: job.id,
                        })
                      }
                      disabled={isPending}
                    >
                      {isPending ? "Отправка..." : "Откликнуться"}
                    </Button>
                  </>
                )}

                <div className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-200">
                  <p>✓ Ваш номер телефона будет виден работодателю</p>
                  <p>✓ Вы сможете общаться в чате</p>
                  <p>✓ Работодатель оценит вас после выполнения работы</p>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Похожие вакансии</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3 border border-slate-200 rounded-lg hover:border-blue-300 cursor-pointer transition"
                  >
                    <p className="font-semibold text-slate-900 text-sm">Вакансия #{i}</p>
                    <p className="text-xs text-slate-600 mt-1">1500 ₽/день</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
