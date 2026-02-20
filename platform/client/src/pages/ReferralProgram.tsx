import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Share2, Copy, CheckCircle } from "lucide-react";
import { ReferralCard } from "@/components/ReferralCard";
import { ReferralStats } from "@/components/ReferralStats";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReferralData {
  code: string;
  status: "pending" | "active" | "inactive";
  totalEarned: number;
  bonusPercentage: number;
  activatedAt?: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalBonusEarned: number;
  totalBonusPaid: number;
  totalBonusPending: number;
  averageBonusPerReferral: number;
}

interface ReferralBonus {
  id: number;
  referredName: string;
  commissionAmount: number;
  bonusAmount: number;
  bonusPercentage: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
}

export default function ReferralProgram() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [bonuses, setBonuses] = useState<ReferralBonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);

      // Загрузить реферальные данные
      const [dataRes, statsRes, bonusesRes] = await Promise.all([
        fetch("/api/referrals/my-code"),
        fetch("/api/referrals/stats"),
        fetch("/api/referrals/bonuses"),
      ]);

      const data = await dataRes.json();
      const statsData = await statsRes.json();
      const bonusesData = await bonusesRes.json();

      setReferralData(data);
      setStats(statsData);
      setBonuses(bonusesData.bonuses || []);
    } catch (error) {
      console.error("Error loading referral data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (referralData?.code) {
      navigator.clipboard.writeText(referralData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!referralData?.code) return;

    const shareUrl = `${window.location.origin}?ref=${referralData.code}`;
    const shareText = `Присоединяйся к TaskHive и зарабатывай на подработках! Используй мой код приглашения: ${referralData.code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "TaskHive - Реферальная программа",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: скопировать в буфер обмена
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">🎁 Реферальная программа</h1>
        <p className="text-muted-foreground mt-2">
          Приглашайте друзей в TaskHive и получайте бонусы от их комиссий
        </p>
      </div>

      {/* Referral Card */}
      {referralData && (
        <div className="flex gap-4">
          <div className="flex-1">
            <ReferralCard
              referralCode={referralData.code}
              status={referralData.status}
              totalEarned={referralData.totalEarned}
              bonusPercentage={referralData.bonusPercentage}
              activatedAt={referralData.activatedAt}
              onCopyCode={handleCopyCode}
            />
          </div>

          {/* Share Button */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleShare}
              size="lg"
              className="h-full"
            >
              <Share2 size={18} className="mr-2" />
              Поделиться
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <ReferralStats
          totalReferrals={stats.totalReferrals}
          activeReferrals={stats.activeReferrals}
          totalBonusEarned={stats.totalBonusEarned}
          totalBonusPaid={stats.totalBonusPaid}
          totalBonusPending={stats.totalBonusPending}
          averageBonusPerReferral={stats.averageBonusPerReferral}
        />
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>Как это работает?</CardTitle>
          <CardDescription>Простые шаги для заработка</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: 1,
                title: "Поделитесь кодом",
                description: "Отправьте ваш реферальный код друзьям",
              },
              {
                step: 2,
                title: "Они присоединяются",
                description: "Друзья регистрируются с вашим кодом",
              },
              {
                step: 3,
                title: "Они зарабатывают",
                description: "Друзья начинают выполнять заказы",
              },
              {
                step: 4,
                title: "Вы получаете бонус",
                description: "Вы получаете 10-20% от их комиссий",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bonuses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ваши бонусы</CardTitle>
          <CardDescription>Список всех заработанных бонусов</CardDescription>
        </CardHeader>
        <CardContent>
          {bonuses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Бонусы ещё не начислены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Реферал</TableHead>
                    <TableHead>Комиссия</TableHead>
                    <TableHead>Бонус</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell className="font-medium">{bonus.referredName}</TableCell>
                      <TableCell>₽ {(bonus.commissionAmount / 100).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₽ {(bonus.bonusAmount / 100).toLocaleString()}
                      </TableCell>
                      <TableCell>{bonus.bonusPercentage}%</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            bonus.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : bonus.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {bonus.status === "paid" && "✓ Выплачено"}
                          {bonus.status === "pending" && "⏳ Ожидание"}
                          {bonus.status === "cancelled" && "✗ Отменено"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(bonus.createdAt).toLocaleDateString("ru-RU")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Часто задаваемые вопросы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              q: "Как часто выплачиваются бонусы?",
              a: "Бонусы выплачиваются каждую неделю. Вы можете запросить выплату в любой момент, если накопилось минимум 100 рублей.",
            },
            {
              q: "Какой максимальный процент бонуса?",
              a: "Максимальный процент составляет 20%. Он зависит от количества активных рефералов и их активности.",
            },
            {
              q: "Можно ли отменить реферальный код?",
              a: "Нет, реферальный код постоянен. Но вы можете создать новый, если потребуется.",
            },
            {
              q: "Что если реферал удалит аккаунт?",
              a: "Если реферал удалит аккаунт, его статус изменится на неактивный, но вы сохраните заработанные бонусы.",
            },
          ].map((item, idx) => (
            <div key={idx} className="border-b pb-4 last:border-b-0">
              <h3 className="font-semibold mb-2">{item.q}</h3>
              <p className="text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
