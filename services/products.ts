
import { api } from '../api/api';
import { Product, Statistics } from '../types/index';

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
      console.log(`Fetching product with ID ${id}`);
      const response = await api.get<Product>(`/products/${id}`);
      console.log('Product data:', response.data);
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

  



  static async updateStockQuantity(productId: number, stockId: number, quantity: number): Promise<Product> {
    try {
      console.log(`Updating stock quantity for product ${productId}, stock ${stockId} to ${quantity}`);
      
     
      const product = await this.getProductById(productId);
      console.log('Fetched product:', product);
  
      const updatedStocks = product.stocks.map(stock =>
        stock.id === stockId ? { ...stock, quantity } : stock
      );
      console.log('Updated stocks:', updatedStocks);
  
      const response = await api.patch<Product>(`/products/${productId}`, { stocks: updatedStocks });
      console.log('Update response:', response.data);
  
      return response.data;
    } catch (error) {
      console.error('Update stock quantity error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
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
  static async calculateStatistics(): Promise<Statistics> {
    try {
      const products = await this.getAllProducts();
  
     
      const totalProducts = products.length;
  
   
      const outOfStock = products.filter(product => {
       
        if (!product.stocks || product.stocks.length === 0) return true;
     
        return product.stocks.every(stock => stock.quantity === 0);
      }).length;
  
      
      const totalStockValue = products.reduce((total, product) => {
       
        if (!product.stocks || product.stocks.length === 0) return total;
 
        const productValue = product.stocks.reduce((sum, stock) => sum + (stock.quantity * (product.solde || product.price)), 0);
        return total + productValue;
      }, 0);
  
    
      const roundedTotalStockValue = Math.round(totalStockValue * 100) / 100;
  
      return {
        totalProducts,
        outOfStock,
        totalStockValue: roundedTotalStockValue,
        mostAddedProducts: [],
        mostRemovedProducts: [], 
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
    
      return {
        totalProducts: 0,
        outOfStock: 0,
        totalStockValue: 0,
        mostAddedProducts: [],
        mostRemovedProducts: [],
      };
    }
  }


  
    
}