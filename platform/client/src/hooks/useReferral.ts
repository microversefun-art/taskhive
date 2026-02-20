import { useState, useCallback } from "react";

export interface ReferralCode {
  code: string;
  status: "pending" | "active" | "inactive";
  totalEarned: number;
  bonusPercentage: number;
  activatedAt?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalBonusEarned: number;
  totalBonusPaid: number;
  totalBonusPending: number;
  averageBonusPerReferral: number;
  lastPayoutDate?: string;
}

export interface ReferralBonus {
  id: number;
  referredName: string;
  commissionAmount: number;
  bonusAmount: number;
  bonusPercentage: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
}

export function useReferral() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Получить реферальный код пользователя
   */
  const getReferralCode = useCallback(async (): Promise<ReferralCode | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/referrals/my-code");
      const data = await response.json();

      if (data.success) {
        return data.code;
      } else {
        setError(data.error || "Ошибка при получении кода");
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Получить статистику реферала
   */
  const getStats = useCallback(async (): Promise<ReferralStats | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/referrals/stats");
      const data = await response.json();

      if (data.success) {
        return data.stats;
      } else {
        setError(data.error || "Ошибка при получении статистики");
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Получить список бонусов
   */
  const getBonuses = useCallback(async (): Promise<ReferralBonus[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/referrals/bonuses");
      const data = await response.json();

      if (data.success) {
        return data.bonuses || [];
      } else {
        setError(data.error || "Ошибка при получении бонусов");
        return [];
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Активировать реферальный код
   */
  const activateReferralCode = useCallback(
    async (referralCode: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/referrals/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode }),
        });

        const data = await response.json();

        if (data.success) {
          return true;
        } else {
          setError(data.error || "Ошибка при активации кода");
          return false;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Неизвестная ошибка";
        setError(errorMsg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Запросить выплату бонусов
   */
  const requestPayout = useCallback(
    async (paymentMethod: string = "robokassa"): Promise<number | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/referrals/payout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethod }),
        });

        const data = await response.json();

        if (data.success) {
          return data.payoutId;
        } else {
          setError(data.error || "Ошибка при запросе выплаты");
          return null;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Неизвестная ошибка";
        setError(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Получить историю выплат
   */
  const getPayoutHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/referrals/payouts");
      const data = await response.json();

      if (data.success) {
        return data.payouts || [];
      } else {
        setError(data.error || "Ошибка при получении истории выплат");
        return [];
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getReferralCode,
    getStats,
    getBonuses,
    activateReferralCode,
    requestPayout,
    getPayoutHistory,
  };
}
