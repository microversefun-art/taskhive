import axios from 'axios';

export interface OneCConfig {
  baseUrl: string;
  username: string;
  password: string;
  database: string;
}

// Синхронизация данных с 1С
export async function syncWithOneC(config: OneCConfig, data: any): Promise<boolean> {
  try {
    const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
    
    await axios.post(`${config.baseUrl}/api/data`, data, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });
    
    return true;
  } catch (error) {
    console.error('1C sync failed:', error);
    return false;
  }
}

// Получение данных из 1С
export async function getDataFromOneC(config: OneCConfig, query: string): Promise<any> {
  try {
    const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
    
    const response = await axios.get(`${config.baseUrl}/api/query`, {
      params: { q: query },
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('1C query failed:', error);
    return null;
  }
}

// Синхронизация сотрудников
export async function syncEmployeesWithOneC(config: OneCConfig, employees: any[]): Promise<boolean> {
  const payload = {
    operation: 'sync_employees',
    data: employees,
  };
  
  return syncWithOneC(config, payload);
}

// Синхронизация зарплаты
export async function syncPayrollWithOneC(config: OneCConfig, payroll: any[]): Promise<boolean> {
  const payload = {
    operation: 'sync_payroll',
    data: payroll,
  };
  
  return syncWithOneC(config, payload);
}

// Получение справочников из 1С
export async function getOneCDictionaries(config: OneCConfig): Promise<any> {
  return getDataFromOneC(config, 'SELECT * FROM Dictionaries');
}
