/**
 * Boosts & Micro-transactions System
 * Система бустов и микротранзакций
 */

export interface Boost {
  id: number;
  name: string;
  description: string;
  price: number; // в рублях
  duration: number; // в часах
  benefits: string[];
  icon: string;
  popular: boolean;
}

export interface UserBoost {
  id: number;
  userId: number;
  boostId: number;
  activatedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface Transaction {
  id: number;
  userId: number;
  type: 'boost_purchase' | 'refund' | 'bonus';
  amount: number;
  boostId?: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  paymentMethod: string;
}

/**
 * Получение доступных бустов
 */
export async function getAvailableBoosts(): Promise<Boost[]> {
  const boosts: Boost[] = [
    {
      id: 1,
      name: 'Выделение профиля',
      description: 'Ваш профиль будет выделен в списке кандидатов',
      price: 99,
      duration: 24,
      benefits: [
        '⭐ Выделение в списке',
        '📈 Увеличение видимости',
        '🎯 Больше откликов'
      ],
      icon: '⭐',
      popular: false
    },
    {
      id: 2,
      name: 'Приоритет в очереди',
      description: 'Получайте предложения работы первым',
      price: 199,
      duration: 48,
      benefits: [
        '🚀 Приоритет в очереди',
        '⏱️ Первым видите новые вакансии',
        '💰 Лучше оплачиваемые работы'
      ],
      icon: '🚀',
      popular: true
    },
    {
      id: 3,
      name: 'VIP пакет',
      description: 'Полный набор преимуществ для максимального заработка',
      price: 499,
      duration: 168, // 7 дней
      benefits: [
        '👑 VIP статус',
        '⭐ Выделение профиля',
        '🚀 Приоритет в очереди',
        '💎 Эксклюзивные вакансии',
        '📞 Приоритетная поддержка',
        '🎁 Бонусные баллы'
      ],
      icon: '👑',
      popular: true
    }
  ];
  
  return boosts;
}

/**
 * Активация буста
 */
export async function activateBoost(
  userId: number,
  boostId: number,
  paymentMethod: string
): Promise<{ success: boolean; transaction: Transaction; boost?: UserBoost }> {
  const boosts = await getAvailableBoosts();
  const boost = boosts.find(b => b.id === boostId);
  
  if (!boost) {
    return { success: false, transaction: {} as Transaction };
  }
  
  // Создание транзакции
  const transaction: Transaction = {
    id: Math.random(),
    userId,
    type: 'boost_purchase',
    amount: boost.price,
    boostId,
    status: 'pending',
    createdAt: new Date(),
    paymentMethod
  };
  
  console.log(`[Boost] User ${userId} purchasing boost "${boost.name}" for ${boost.price}₽`);
  
  // Обработка платежа
  const paymentSuccess = await processBoostPayment(transaction);
  
  if (paymentSuccess) {
    transaction.status = 'completed';
    
    // Активация буста
    const userBoost: UserBoost = {
      id: Math.random(),
      userId,
      boostId,
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + boost.duration * 60 * 60 * 1000),
      isActive: true
    };
    
    console.log(`[Boost] Activated for user ${userId} until ${userBoost.expiresAt}`);
    
    return { success: true, transaction, boost: userBoost };
  } else {
    transaction.status = 'failed';
    return { success: false, transaction };
  }
}

/**
 * Обработка платежа за буст
 */
async function processBoostPayment(transaction: Transaction): Promise<boolean> {
  // Интеграция с Яндекс.Касса или другой платежной системой
  console.log(`[Payment] Processing ${transaction.amount}₽ via ${transaction.paymentMethod}`);
  
  // Имитация успешного платежа (в реальности нужна интеграция с API)
  return Math.random() > 0.1; // 90% успешных платежей
}

/**
 * Получение активных бустов пользователя
 */
export async function getUserActiveBoosts(userId: number): Promise<UserBoost[]> {
  // Здесь должна быть логика получения из БД
  return [
    {
      id: 1,
      userId,
      boostId: 2,
      activatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isActive: true
    }
  ];
}

/**
 * Получение истории транзакций пользователя
 */
export async function getUserTransactions(userId: number, limit: number = 20): Promise<Transaction[]> {
  // Здесь должна быть логика получения из БД
  return [
    {
      id: 1,
      userId,
      type: 'boost_purchase',
      amount: 199,
      boostId: 2,
      status: 'completed',
      createdAt: new Date(),
      paymentMethod: 'yandex_kassa'
    }
  ];
}

/**
 * Возврат средств
 */
export async function refundBoost(userId: number, boostId: number): Promise<boolean> {
  const transaction: Transaction = {
    id: Math.random(),
    userId,
    type: 'refund',
    amount: 0, // будет заполнено из оригинальной транзакции
    boostId,
    status: 'pending',
    createdAt: new Date(),
    paymentMethod: 'refund'
  };
  
  console.log(`[Boost] Refund initiated for user ${userId}, boost ${boostId}`);
  
  // Обработка возврата
  transaction.status = 'completed';
  return true;
}

/**
 * Проверка активности буста
 */
export async function isBoostActive(userId: number, boostId: number): Promise<boolean> {
  const activeBoosts = await getUserActiveBoosts(userId);
  return activeBoosts.some(b => b.boostId === boostId && b.isActive);
}

/**
 * Получение статистики по бустам
 */
export async function getBoostStats(userId: number): Promise<{
  totalSpent: number;
  activeBoosts: number;
  totalBoosts: number;
  nextBoostExpiry?: Date;
}> {
  const transactions = await getUserTransactions(userId);
  const activeBoosts = await getUserActiveBoosts(userId);
  
  const totalSpent = transactions
    .filter(t => t.type === 'boost_purchase' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const nextBoostExpiry = activeBoosts.length > 0
    ? new Date(Math.min(...activeBoosts.map(b => b.expiresAt.getTime())))
    : undefined;
  
  return {
    totalSpent,
    activeBoosts: activeBoosts.length,
    totalBoosts: transactions.filter(t => t.type === 'boost_purchase').length,
    nextBoostExpiry
  };
}

export const boostsRouter = {
  getAvailableBoosts,
  activateBoost,
  getUserActiveBoosts,
  getUserTransactions,
  refundBoost,
  isBoostActive,
  getBoostStats
};
