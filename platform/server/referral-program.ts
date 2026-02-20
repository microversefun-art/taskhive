/**
 * Multi-Level Referral Program
 * Многоуровневая реферальная программа
 */

export interface ReferralUser {
  userId: number;
  referralCode: string;
  referredBy?: number;
  referralChain: number[]; // цепочка рефералов
  totalEarnings: number;
  level: number; // уровень в программе
}

export interface ReferralReward {
  level: number;
  directBonus: number; // бонус за прямого реферала
  indirectBonus: number; // бонус за реферала второго уровня
  requirements: {
    minReferrals: number;
    minEarnings: number;
  };
  badge: string;
}

export interface ReferralTransaction {
  id: number;
  fromUserId: number;
  toUserId: number;
  level: number; // на каком уровне произошел заработок
  amount: number;
  reason: string;
  createdAt: Date;
}

/**
 * Получение структуры реферальной программы
 */
export async function getReferralStructure(): Promise<ReferralReward[]> {
  return [
    {
      level: 1,
      directBonus: 500, // 500₽ за прямого реферала
      indirectBonus: 0,
      requirements: { minReferrals: 0, minEarnings: 0 },
      badge: '🌱'
    },
    {
      level: 2,
      directBonus: 500,
      indirectBonus: 250, // 250₽ за реферала второго уровня
      requirements: { minReferrals: 3, minEarnings: 5000 },
      badge: '🌿'
    },
    {
      level: 3,
      directBonus: 500,
      indirectBonus: 250,
      requirements: { minReferrals: 10, minEarnings: 25000 },
      badge: '🌳'
    },
    {
      level: 4,
      directBonus: 750,
      indirectBonus: 375, // 375₽ за реферала второго уровня
      requirements: { minReferrals: 25, minEarnings: 100000 },
      badge: '🏆'
    },
    {
      level: 5,
      directBonus: 1000, // 1000₽ за прямого реферала
      indirectBonus: 500,
      requirements: { minReferrals: 50, minEarnings: 500000 },
      badge: '👑'
    }
  ];
}

/**
 * Создание реферального кода для пользователя
 */
export async function generateReferralCode(userId: number): Promise<string> {
  // Генерируем уникальный код на основе userId
  const code = `TH${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  console.log(`[Referral] Generated code for user ${userId}: ${code}`);
  return code;
}

/**
 * Регистрация реферала
 */
export async function registerReferral(
  referralCode: string,
  newUserId: number
): Promise<{ success: boolean; referrerId?: number; bonus?: number }> {
  // Здесь должна быть логика поиска пользователя по коду
  console.log(`[Referral] New user ${newUserId} registered with code: ${referralCode}`);
  
  // Имитация успешной регистрации
  const referrerId = 100; // ID того, кто пригласил
  const bonus = 500; // Бонус за первого реферала
  
  // Создание транзакции
  await createReferralTransaction(referrerId, newUserId, 1, bonus, 'Direct referral bonus');
  
  return { success: true, referrerId, bonus };
}

/**
 * Создание транзакции реферала
 */
async function createReferralTransaction(
  fromUserId: number,
  toUserId: number,
  level: number,
  amount: number,
  reason: string
): Promise<ReferralTransaction> {
  const transaction: ReferralTransaction = {
    id: Math.random(),
    fromUserId,
    toUserId,
    level,
    amount,
    reason,
    createdAt: new Date()
  };
  
  console.log(`[Referral] Transaction: ${fromUserId} -> ${toUserId} (Level ${level}): ${amount}₽`);
  return transaction;
}

/**
 * Получение информации о рефералах пользователя
 */
export async function getUserReferralInfo(userId: number): Promise<{
  referralCode: string;
  level: number;
  directReferrals: number;
  totalReferrals: number;
  totalEarnings: number;
  nextLevelRequirements: ReferralReward;
}> {
  const structure = await getReferralStructure();
  
  return {
    referralCode: `TH${userId}ABC123`,
    level: 2,
    directReferrals: 5,
    totalReferrals: 12,
    totalEarnings: 3500,
    nextLevelRequirements: structure[2]
  };
}

/**
 * Получение дерева рефералов пользователя
 */
export async function getReferralTree(userId: number, depth: number = 2): Promise<{
  userId: number;
  username: string;
  level: number;
  earnings: number;
  referrals: any[];
}> {
  return {
    userId,
    username: 'User ' + userId,
    level: 1,
    earnings: 5000,
    referrals: [
      {
        userId: 101,
        username: 'Referral 1',
        level: 2,
        earnings: 2500,
        referrals: depth > 1 ? [
          {
            userId: 201,
            username: 'Sub-referral 1',
            level: 3,
            earnings: 1000,
            referrals: []
          }
        ] : []
      },
      {
        userId: 102,
        username: 'Referral 2',
        level: 2,
        earnings: 1500,
        referrals: []
      }
    ]
  };
}

/**
 * Получение истории заработков от рефералов
 */
export async function getReferralEarningsHistory(userId: number, limit: number = 20): Promise<ReferralTransaction[]> {
  return [
    {
      id: 1,
      fromUserId: userId,
      toUserId: 101,
      level: 1,
      amount: 500,
      reason: 'Direct referral bonus',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      fromUserId: userId,
      toUserId: 201,
      level: 2,
      amount: 250,
      reason: 'Second level referral bonus',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];
}

/**
 * Проверка возможности повышения уровня
 */
export async function checkLevelUp(userId: number): Promise<{
  canLevelUp: boolean;
  currentLevel: number;
  nextLevel: number;
  missingReferrals?: number;
  missingEarnings?: number;
}> {
  const info = await getUserReferralInfo(userId);
  const structure = await getReferralStructure();
  const nextLevelReq = structure[info.level];
  
  const canLevelUp = 
    info.directReferrals >= nextLevelReq.requirements.minReferrals &&
    info.totalEarnings >= nextLevelReq.requirements.minEarnings;
  
  return {
    canLevelUp,
    currentLevel: info.level,
    nextLevel: info.level + 1,
    missingReferrals: canLevelUp ? 0 : nextLevelReq.requirements.minReferrals - info.directReferrals,
    missingEarnings: canLevelUp ? 0 : nextLevelReq.requirements.minEarnings - info.totalEarnings
  };
}

/**
 * Повышение уровня реферала
 */
export async function levelUpReferral(userId: number): Promise<{ success: boolean; newLevel?: number }> {
  const levelUp = await checkLevelUp(userId);
  
  if (!levelUp.canLevelUp) {
    return { success: false };
  }
  
  console.log(`[Referral] User ${userId} leveled up to level ${levelUp.nextLevel}`);
  return { success: true, newLevel: levelUp.nextLevel };
}

export const referralProgramRouter = {
  getReferralStructure,
  generateReferralCode,
  registerReferral,
  getUserReferralInfo,
  getReferralTree,
  getReferralEarningsHistory,
  checkLevelUp,
  levelUpReferral
};
