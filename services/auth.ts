
import { api } from '../api/api';
import { Warehouseman } from '../types/index';

export class AuthService {
  static async login(secretKey: string): Promise<Warehouseman | null> {
    try {

        const response = await api.get<Warehouseman[]>(`/warehousemans?secretKey=${secretKey}`);

        if (response.data.length > 0) {
            const user = response.data[0];
           
            return user;
        } else {
          
            return null;
        }
    } catch (error) {
        
        throw error;
    }
}
  static async getWarehousemanById(userId: number | string): Promise<Warehouseman | null> {
    try {
      const response = await api.get<Warehouseman>(`/warehousemans/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get warehouseman error:', error);
      throw error;
    }
  }
}