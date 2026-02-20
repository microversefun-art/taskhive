import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Wallet, Award } from "lucide-react";

interface ReferralStatsProps {
  totalReferrals: number;
  activeReferrals: number;
  totalBonusEarned: number;
  totalBonusPaid: number;
  totalBonusPending: number;
  averageBonusPerReferral: number;
}

export function ReferralStats({
  totalReferrals,
  activeReferrals,
  totalBonusEarned,
  totalBonusPaid,
  totalBonusPending,
  averageBonusPerReferral,
}: ReferralStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Referrals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users size={16} />
            Всего приглашено
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReferrals}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Активных: <span className="font-semibold text-green-600">{activeReferrals}</span>
          </p>
        </CardContent>
      </Card>

      {/* Total Earned */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp size={16} />
            Всего заработано
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ₽ {(totalBonusEarned / 100).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Средний: ₽ {(averageBonusPerReferral / 100).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Paid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet size={16} />
            Выплачено
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            ₽ {(totalBonusPaid / 100).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ожидание: ₽ {(totalBonusPending / 100).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Award size={16} />
            Ожидающих выплаты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            ₽ {(totalBonusPending / 100).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Будут выплачены в течение 7 дней
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
