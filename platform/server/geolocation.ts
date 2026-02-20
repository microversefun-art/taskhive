export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface WorkerLocation {
  workerId: number;
  location: Location;
  shiftId?: number;
  status: 'on_shift' | 'off_shift';
}

// Получение текущей локации работника
export async function getWorkerLocation(workerId: number): Promise<WorkerLocation | null> {
  return null;
}

// Обновление локации работника
export async function updateWorkerLocation(workerId: number, location: Location, shiftId?: number): Promise<boolean> {
  return true;
}

// Проверка нахождения работника в зоне работы
export async function isWorkerInJobZone(workerLocation: Location, jobLocation: Location, radiusMeters: number = 500): Promise<boolean> {
  const R = 6371000; // Радиус Земли в метрах
  const lat1 = (workerLocation.latitude * Math.PI) / 180;
  const lat2 = (jobLocation.latitude * Math.PI) / 180;
  const deltaLat = ((jobLocation.latitude - workerLocation.latitude) * Math.PI) / 180;
  const deltaLon = ((jobLocation.longitude - workerLocation.longitude) * Math.PI) / 180;
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance <= radiusMeters;
}

// Отслеживание маршрута работника
export interface RouteTracking {
  workerId: number;
  shiftId: number;
  startLocation: Location;
  endLocation: Location;
  distance: number;
  duration: number;
  waypoints: Location[];
}

export async function trackWorkerRoute(workerId: number, shiftId: number, locations: Location[]): Promise<RouteTracking> {
  return {
    workerId,
    shiftId,
    startLocation: locations[0],
    endLocation: locations[locations.length - 1],
    distance: 0,
    duration: 0,
    waypoints: locations,
  };
}

// Получение ближайших работников к месту работы
export async function getNearbyWorkers(jobLocation: Location, radiusMeters: number = 5000, limit: number = 10): Promise<WorkerLocation[]> {
  return [];
}
