
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

  static async getProductById(id: string): Promise<Product> {
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

  
  static async updateStockQuantity(productId: string, stockId: number, quantity: number) {
    try {
     

      const product: any = await this.getProductById(productId);
      if (!product || !product.stocks) {
        throw new Error("Produit ou stock introuvable");
      }

      const stockToUpdate = product.stocks.find((stock: any) => stock.id === "1999");
      if (!stockToUpdate) {
        throw new Error("Emplacement non trouvé dans le stock");
      }

      const updatedStocks = product.stocks.map((stock: any) =>
        stock.id === stockToUpdate.id
          ? { ...stock, quantity: parseInt(quantity.toString()) }
          : stock
      );

    

      const nexwss ={ ...product, stocks: updatedStocks };
      console.log(nexwss);
      

      const response = await fetch(`http://172.16.11.36:3000/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ ...product, stocks: updatedStocks }),
      });

      if (!response.ok) {
        const errorText = await response.text();
      
        throw new Error(`La mise à jour a échoué: ${response.status}`);
      }

      const updatedProduct = await response.json();
      

      return updatedProduct;
    } catch (error) {
     
      throw new Error(error.message || "Une erreur inconnue s'est produite.");
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