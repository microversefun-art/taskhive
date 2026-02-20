export interface Shift {
  id: number;
  jobId: number;
  employerId: number;
  startTime: Date;
  endTime: Date;
  position: string;
  salary: number;
  maxWorkers: number;
  assignedWorkers: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  location: string;
  requirements?: string;
  createdAt: Date;
}

export interface ShiftAssignment {
  id: number;
  shiftId: number;
  workerId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  checkInTime?: Date;
  checkOutTime?: Date;
  hoursWorked?: number;
  rating?: number;
  feedback?: string;
  assignedAt: Date;
}

// Создание смены
export async function createShift(shift: Omit<Shift, 'id' | 'createdAt'>): Promise<Shift> {
  return {
    ...shift,
    id: Math.floor(Math.random() * 1000000),
    createdAt: new Date(),
  };
}

// Получение доступных смен для работника
export async function getAvailableShifts(workerId: number, filters?: any): Promise<Shift[]> {
  // Здесь должна быть логика получения смен из БД
  return [];
}

// Распределение работников на смены
export async function assignWorkerToShift(shiftId: number, workerId: number): Promise<ShiftAssignment> {
  return {
    id: Math.floor(Math.random() * 1000000),
    shiftId,
    workerId,
    status: 'pending',
    assignedAt: new Date(),
  };
}

// Проверка наличия конфликтов по времени
export async function checkTimeConflict(workerId: number, startTime: Date, endTime: Date): Promise<boolean> {
  // Проверить, есть ли уже назначенные смены в это время
  return false;
}

// Автоматическое распределение работников
export async function autoAssignWorkers(shiftId: number, requiredWorkers: number, availableWorkers: any[]): Promise<ShiftAssignment[]> {
  const assignments: ShiftAssignment[] = [];
  
  // Сортируем по рейтингу
  const sortedWorkers = availableWorkers.sort((a, b) => b.rating - a.rating);
  
  for (let i = 0; i < Math.min(requiredWorkers, sortedWorkers.length); i++) {
    assignments.push({
      id: Math.floor(Math.random() * 1000000),
      shiftId,
      workerId: sortedWorkers[i].id,
      status: 'pending',
      assignedAt: new Date(),
    });
  }
  
  return assignments;
}

// Check-in и Check-out
export async function checkInWorker(assignmentId: number): Promise<ShiftAssignment> {
  return {
    id: assignmentId,
    shiftId: 0,
    workerId: 0,
    status: 'accepted',
    checkInTime: new Date(),
    assignedAt: new Date(),
  };
}

export async function checkOutWorker(assignmentId: number): Promise<ShiftAssignment> {
  return {
    id: assignmentId,
    shiftId: 0,
    workerId: 0,
    status: 'completed',
    checkOutTime: new Date(),
    assignedAt: new Date(),
  };
}

// Расчет часов работы
export async function calculateHoursWorked(checkInTime: Date, checkOutTime: Date): Promise<number> {
  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  return Math.round(diffMs / (1000 * 60 * 60) * 100) / 100; // часы с точностью до сотых
}

// Календарь смен для работника
export interface ShiftCalendar {
  workerId: number;
  month: number;
  year: number;
  shifts: Shift[];
  totalHours: number;
  totalEarnings: number;
}

export async function getWorkerShiftCalendar(workerId: number, month: number, year: number): Promise<ShiftCalendar> {
  return {
    workerId,
    month,
    year,
    shifts: [],
    totalHours: 0,
    totalEarnings: 0,
  };
}

// Отмена смены
export async function cancelShift(shiftId: number, reason: string): Promise<boolean> {
  // Уведомить всех назначенных работников
  // Вернуть деньги, если необходимо
  return true;
}

// Отмена назначения работника
export async function cancelAssignment(assignmentId: number, reason: string): Promise<boolean> {
  // Уведомить работника и работодателя
  return true;
}
