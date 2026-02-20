import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingStars } from './RatingStars';

interface ReviewFormProps {
  executorName: string;
  onSubmit: (rating: number, text: string) => void;
  isLoading?: boolean;
}

export function ReviewForm({ executorName, onSubmit, isLoading = false }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Пожалуйста, выберите оценку');
      return;
    }
    if (text.trim().length < 10) {
      alert('Отзыв должен содержать минимум 10 символов');
      return;
    }
    onSubmit(rating, text);
    setRating(0);
    setText('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Оставить отзыв</CardTitle>
        <CardDescription>
          Ваш отзыв поможет другим пользователям выбрать лучшего исполнителя
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-3">
            Оцените работу {executorName}
          </label>
          <RatingStars rating={rating} onRate={setRating} size="lg" />
        </div>

        {/* Rating Description */}
        {rating > 0 && (
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
            {rating === 5 && '⭐⭐⭐⭐⭐ Отличная работа!'}
            {rating === 4 && '⭐⭐⭐⭐ Хорошая работа'}
            {rating === 3 && '⭐⭐⭐ Нормально'}
            {rating === 2 && '⭐⭐ Есть замечания'}
            {rating === 1 && '⭐ Не рекомендую'}
          </div>
        )}

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Ваш отзыв ({text.length}/500)
          </label>
          <Textarea
            placeholder="Расскажите о качестве работы, скорости выполнения, общении с исполнителем..."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            Минимум 10 символов. Отзывы проходят модерацию перед публикацией.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || rating === 0 || text.length < 10}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Отправка...' : 'Опубликовать отзыв'}
        </Button>
      </CardContent>
    </Card>
  );
}
