import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
} from 'react-native';
import { ProductsService } from '../services/products';
import { Product } from '../types/index';
import * as Print from 'expo-print';

const ProductScreen: React.FC<{ route: any }> = ({ route }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const spinValue = new Animated.Value(0);

  const { userId } = route.params || { userId: null };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await ProductsService.getAllProducts();
        setProducts(productData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    fetchProducts();
  }, []);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} // Fallback image
        style={styles.productImage}
        onError={(error) => console.log('Failed to load image:', error.nativeEvent.error)}
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productType}>{item.type}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <TouchableOpacity
          style={styles.productButton}
          onPress={() => {
            setSelectedProduct(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.productButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const printProductDetails = async () => {
    if (selectedProduct) {
      const htmlContent = `
        <h1>${selectedProduct.name}</h1>
        <img src="${selectedProduct.image || 'https://via.placeholder.com/150'}" alt="${selectedProduct.name}" style="width: 100%; height: auto;" />
        <p><strong>Type:</strong> ${selectedProduct.type}</p>
        <p><strong>Price:</strong> ${selectedProduct.price} MAD</p>
        <p><strong>Supplier:</strong> ${selectedProduct.supplier}</p>
        <p><strong>Barcode:</strong> ${selectedProduct.barcode}</p>
        <h2>Stocks:</h2>
        <ul>
          ${selectedProduct.stocks
            ?.map(
              (stock) => `
            <li>
              <strong>${stock.name}</strong>: ${stock.quantity} (${stock.localisation.city})
            </li>
          `
            )
            .join('')}
        </ul>
      `;

      try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        console.log('PDF generated at:', uri);
        await Print.printAsync({ uri });
      } catch (error) {
        console.error('Error generating or printing PDF:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
            <ActivityIndicator size="large" color="#6200ee" />
          </Animated.View>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <ScrollView>
                <View>
                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                  <Image
                    source={{ uri: selectedProduct.image || 'https://via.placeholder.com/150' }} // Fallback image
                    style={styles.modalImage}
                    onError={(error) => console.log('Failed to load image:', error.nativeEvent.error)}
                  />
                  <Text style={styles.modalText}>Type: {selectedProduct.type}</Text>
                  <Text style={styles.modalText}>Price: ${selectedProduct.price}</Text>
                  <Text style={styles.modalText}>Supplier: {selectedProduct.supplier}</Text>
                  <Text style={styles.modalText}>Barcode: {selectedProduct.barcode}</Text>
                  <Text style={styles.modalText}>Stocks:</Text>
                  {selectedProduct.stocks?.map((stock, index) => (
                    <View key={index} style={styles.stockItem}>
                      <Text style={styles.stockText}>Name: {stock.name}</Text>
                      <Text style={styles.stockText}>Quantity: {stock.quantity}</Text>
                      <Text style={styles.stockText}>
                        Location: {stock.localisation.city} (Lat: {stock.localisation.latitude}, Lng: {stock.localisation.longitude})
                      </Text>
                    </View>
                  ))}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={printProductDetails}>
                      <Text style={styles.closeButtonText}>Print Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  spinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productType: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  productButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  productButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  stockItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  stockText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductScreen;