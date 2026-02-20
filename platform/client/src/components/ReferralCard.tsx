import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Clock } from "lucide-react";

interface ReferralCardProps {
  referralCode: string;
  status: "pending" | "active" | "inactive";
  totalEarned: number;
  bonusPercentage: number;
  activatedAt?: string;
  onCopyCode?: () => void;
}

export function ReferralCard({
  referralCode,
  status,
  totalEarned,
  bonusPercentage,
  activatedAt,
  onCopyCode,
}: ReferralCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            Активен
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock size={14} className="mr-1" />
            Ожидание активации
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <Clock size={14} className="mr-1" />
            Неактивен
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Реферальная ссылка</CardTitle>
            <CardDescription>Приглашайте друзей и зарабатывайте</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Referral Code */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Ваш код приглашения:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-lg font-semibold bg-background px-3 py-2 rounded border">
              {referralCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyCode}
              title="Скопировать код"
            >
              <Copy size={16} />
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Реферальная ссылка:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm bg-background px-3 py-2 rounded border break-all">
              {`${window.location.origin}?ref=${referralCode}`}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}?ref=${referralCode}`);
              }}
              title="Скопировать ссылку"
            >
              <Copy size={16} />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900 font-medium">Заработано</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ₽ {(totalEarned / 100).toLocaleString()}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">Бонус</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{bonusPercentage}%</p>
          </div>
        </div>

        {/* Info */}
        {activatedAt && (
          <div className="text-sm text-muted-foreground">
            <p>
              Активирован:{" "}
              <span className="font-semibold">
                {new Date(activatedAt).toLocaleDateString("ru-RU")}
              </span>
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 Поделитесь кодом с друзьями и получайте {bonusPercentage}% от их комиссий!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
