
import { api } from '../api/api';
import { Product } from '../types/index';

export class ProductsService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>('/products');
      return response.data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  static async getProductById(id: number): Promise<Product> {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }

  static async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const response = await api.post<Product>('/products', product);
      return response.data;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  static async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    try {
      const response = await api.patch<Product>(`/products/${id}`, product);
      return response.data;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  static async deleteProduct(id: number): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }

  static async updateStock(productId: number, stockId: number, quantity: number): Promise<Product> {
    try {
      const product = await this.getProductById(productId);
      const updatedStocks = product.stocks.map(stock => 
        stock.id === stockId ? { ...stock, quantity } : stock
      );
      
      return await this.updateProduct(productId, { stocks: updatedStocks });
    } catch (error) {
      console.error('Update stock error:', error);
      throw error;
    }
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      const response = await api.get<Product[]>(`/products?barcode=${barcode}`);
      if (response.data && response.data.length > 0) {
        return response.data[0]; 
      }
      return null;
    } catch (error) {
      console.error('Error fetching product by barcode:', error);
      throw error;
    }
  }

  static async getStatistics() {
    try {
      const response = await api.get('/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
  static async calculateStatistics() {
    try {
      const products = await this.getAllProducts();
  
      const totalProducts = products.length;
      const outOfStock = products.filter(product => 
        !product.stocks || product.stocks.every(stock => stock.quantity === 0)
      ).length;
  
      const totalStockValue = products.reduce((total, product) => {
        const productValue = product.stocks.reduce((sum, stock) => sum + (stock.quantity * product.price), 0);
        return total + productValue;
      }, 0);
  
      return { totalProducts, outOfStock, totalStockValue };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      throw error;
    }
  }
    
}