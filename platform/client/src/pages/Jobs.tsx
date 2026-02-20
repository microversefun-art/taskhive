import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Briefcase, Clock, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";

const CATEGORIES = [
  "Все",
  "Курьер",
  "Склад",
  "Доставка",
  "Ритейл",
  "Промышленность",
  "Услуги",
];

const REGIONS = [
  "Все регионы",
  "Москва",
  "Санкт-Петербург",
  "Екатеринбург",
  "Новосибирск",
  "Казань",
];

export default function Jobs() {
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [selectedRegion, setSelectedRegion] = useState("Все регионы");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const { data: jobs, isLoading } = trpc.jobs.list.useQuery({
    limit: 20,
    offset: 0,
  });

  const filteredJobs =
    jobs?.filter((job) => {
      const matchesCategory = selectedCategory === "Все" || job.category === selectedCategory;
      const matchesRegion = selectedRegion === "Все регионы" || job.region === selectedRegion;
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesRegion && matchesSearch;
    }) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Вакансии</h1>
          <p className="text-slate-600">Найди подходящую работу из {jobs?.length || 0} вакансий</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Фильтры</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск вакансий..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Категория</label>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Регион</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Сортировка</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Новые</SelectItem>
                    <SelectItem value="salary-high">Зарплата: выше</SelectItem>
                    <SelectItem value="salary-low">Зарплата: ниже</SelectItem>
                    <SelectItem value="popular">Популярные</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Main Content - Jobs List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Загрузка вакансий...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Вакансии не найдены</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition cursor-pointer hover:border-blue-300"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {job.isHot && <Badge className="bg-red-500">🔥 HOT</Badge>}
                            <Badge variant="outline">{job.category}</Badge>
                          </div>
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}, {job.region}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4 line-clamp-2">{job.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-t border-b border-slate-200">
                        <div>
                          <div className="flex items-center gap-1 text-green-600 font-bold">
                            <DollarSign className="w-4 h-4" />
                            {job.salary
                              ? `${job.salary} ₽`
                              : `${job.salaryMin}-${job.salaryMax} ₽`}
                          </div>
                          <p className="text-xs text-slate-500">Зарплата</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-blue-600 font-bold">
                            <Clock className="w-4 h-4" />
                            {job.duration || "Не указано"}
                          </div>
                          <p className="text-xs text-slate-500">Тип</p>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{job.applicationsCount}</div>
                          <p className="text-xs text-slate-500">Откликов</p>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{job.viewCount}</div>
                          <p className="text-xs text-slate-500">Просмотров</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1">Откликнуться</Button>
                        <Button variant="outline" className="flex-1">
                          Подробнее
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
