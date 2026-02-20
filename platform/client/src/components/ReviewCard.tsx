import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Star, MessageSquare } from "lucide-react";

interface ReviewCardProps {
  id: number;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  categories: {
    professionalism: number;
    communication: number;
    reliability: number;
    quality: number;
  };
  date: Date;
  helpful: number;
  unhelpful: number;
  isVerified: boolean;
  isAnonymous?: boolean;
  onHelpful?: (reviewId: number) => void;
  onUnhelpful?: (reviewId: number) => void;
}

export default function ReviewCard({
  id,
  authorName,
  authorAvatar,
  rating,
  title,
  comment,
  categories,
  date,
  helpful,
  unhelpful,
  isVerified,
  isAnonymous,
  onHelpful,
  onUnhelpful,
}: ReviewCardProps) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [isUnhelpful, setIsUnhelpful] = useState(false);

  const handleHelpful = () => {
    setIsHelpful(!isHelpful);
    setIsUnhelpful(false);
    onHelpful?.(id);
  };

  const handleUnhelpful = () => {
    setIsUnhelpful(!isUnhelpful);
    setIsHelpful(false);
    onUnhelpful?.(id);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-blue-600";
    if (rating >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Сегодня";
    if (diffDays === 1) return "Вчера";
    if (diffDays < 7) return `${diffDays} дней назад`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "неделю" : "недель"} назад`;
    }

    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  {isAnonymous ? "Анонимный пользователь" : authorName}
                </p>
                {isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Проверено
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">{formatDate(date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className={`ml-2 font-bold ${getRatingColor(rating)}`}>{rating}</span>
          </div>
        </div>
        <CardTitle className="text-lg mt-4">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Основной комментарий */}
        <p className="text-gray-700">{comment}</p>

        {/* Категории оценок */}
        <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Профессионализм</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < categories.professionalism
                      ? "fill-blue-400 text-blue-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Коммуникация</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < categories.communication
                      ? "fill-blue-400 text-blue-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Надежность</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < categories.reliability
                      ? "fill-blue-400 text-blue-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Качество</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < categories.quality ? "fill-blue-400 text-blue-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <Button
            variant={isHelpful ? "default" : "outline"}
            size="sm"
            onClick={handleHelpful}
            className="gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            Полезно ({helpful})
          </Button>

          <Button
            variant={isUnhelpful ? "default" : "outline"}
            size="sm"
            onClick={handleUnhelpful}
            className="gap-2"
          >
            <ThumbsDown className="w-4 h-4" />
            Не полезно ({unhelpful})
          </Button>

          <Button variant="outline" size="sm" className="gap-2 ml-auto">
            <MessageSquare className="w-4 h-4" />
            Ответить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
