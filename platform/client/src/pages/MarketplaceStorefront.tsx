import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Search, Filter, ShoppingCart } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  seller: string;
  category: string;
  image?: string;
  deliveryTime: string;
  tags: string[];
}

export default function MarketplaceStorefront() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState([0, 100000]);

  // Mock services data
  const services: Service[] = [
    {
      id: "1",
      title: "Написание статей для блога",
      description: "Профессиональное написание статей SEO-оптимизированных статей для вашего блога",
      price: 5000,
      rating: 4.9,
      reviews: 127,
      seller: "Иван Петров",
      category: "writing",
      deliveryTime: "3-5 дней",
      tags: ["SEO", "Блог", "Статьи"],
    },
    {
      id: "2",
      title: "Дизайн логотипа",
      description: "Создание уникального логотипа для вашего бренда с неограниченными правками",
      price: 8000,
      rating: 4.8,
      reviews: 89,
      seller: "Мария Сидорова",
      category: "design",
      deliveryTime: "5-7 дней",
      tags: ["Логотип", "Брендинг", "Дизайн"],
    },
    {
      id: "3",
      title: "Разработка мобильного приложения",
      description: "Разработка iOS/Android приложения с использованием React Native",
      price: 50000,
      rating: 4.7,
      reviews: 45,
      seller: "Алексей Иванов",
      category: "development",
      deliveryTime: "30-45 дней",
      tags: ["React Native", "iOS", "Android"],
    },
    {
      id: "4",
      title: "Видеомонтаж и обработка",
      description: "Профессиональный видеомонтаж с эффектами, цветокоррекцией и звуком",
      price: 12000,
      rating: 4.9,
      reviews: 156,
      seller: "Елена Козлова",
      category: "video",
      deliveryTime: "7-10 дней",
      tags: ["Видео", "Монтаж", "Эффекты"],
    },
    {
      id: "5",
      title: "SMM управление",
      description: "Полное управление социальными сетями: контент, посты, аналитика",
      price: 15000,
      rating: 4.8,
      reviews: 92,
      seller: "Ольга Волкова",
      category: "marketing",
      deliveryTime: "Ежемесячно",
      tags: ["SMM", "Маркетинг", "Соцсети"],
    },
    {
      id: "6",
      title: "Консультация по бизнесу",
      description: "Стратегическая консультация по развитию вашего бизнеса",
      price: 3000,
      rating: 4.9,
      reviews: 203,
      seller: "Дмитрий Смирнов",
      category: "consulting",
      deliveryTime: "1-2 часа",
      tags: ["Консультация", "Бизнес", "Стратегия"],
    },
  ];

  const categories = [
    { id: "all", name: "Все услуги", icon: "🎯" },
    { id: "writing", name: "Написание", icon: "✍️" },
    { id: "design", name: "Дизайн", icon: "🎨" },
    { id: "development", name: "Разработка", icon: "💻" },
    { id: "video", name: "Видео", icon: "🎬" },
    { id: "marketing", name: "Маркетинг", icon: "📊" },
    { id: "consulting", name: "Консультации", icon: "💼" },
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">🛍️ Marketplace</h1>
          <p className="text-lg text-blue-100 mb-8">Найди лучших исполнителей для своих проектов</p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <Input
              placeholder="Поиск услуг..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
                className="whitespace-nowrap"
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={20} />
              <span className="font-semibold">Сортировка:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="popular">Популярные</option>
              <option value="price-low">Цена: по возрастанию</option>
              <option value="price-high">Цена: по убыванию</option>
              <option value="rating">Рейтинг</option>
              <option value="newest">Новые</option>
            </select>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              {/* Service Image */}
              <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl">
                {service.category === "writing" && "✍️"}
                {service.category === "design" && "🎨"}
                {service.category === "development" && "💻"}
                {service.category === "video" && "🎬"}
                {service.category === "marketing" && "📊"}
                {service.category === "consulting" && "💼"}
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-2">{service.title}</CardTitle>
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Seller Info */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">👤 {service.seller}</span>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.rating}</span>
                    <span className="text-sm text-muted-foreground">({service.reviews})</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Delivery Time */}
                <div className="text-sm text-muted-foreground">
                  ⏱️ Доставка: {service.deliveryTime}
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      ₽ {service.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">за услугу</div>
                  </div>
                  <Button className="gap-2">
                    <ShoppingCart size={18} />
                    Купить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Услуги не найдены</h3>
            <p className="text-muted-foreground">
              Попробуйте изменить фильтры или поисковый запрос
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredServices.length > 0 && (
          <div className="flex justify-center gap-2 mt-12">
            <Button variant="outline">← Предыдущая</Button>
            <Button>1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Следующая →</Button>
          </div>
        )}
      </div>
    </div>
  );
}
