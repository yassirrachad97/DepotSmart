import React, { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Image, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For stock selection
import { ProductsService } from '../services/products';
import { Product } from '../types/index'; // Import the Product type

const ScanQRScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [product, setProduct] = useState<Product | null>(null); // Properly typed
    const [showForm, setShowForm] = useState(false);
    const [manualInput, setManualInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [manualBarcode, setManualBarcode] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [quantity, setQuantity] = useState<number>(0); // State for quantity input

    // Form fields
    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productSupplier, setProductSupplier] = useState('');
    const [productImage, setProductImage] = useState('');

    // Stock selection
    const [selectedStock, setSelectedStock] = useState('1999'); // Default to Gueliz B2
    const [stockQuantity, setStockQuantity] = useState('');

    // List of available stocks
    const stocks = [
        { id: '1999', name: 'Gueliz B2', city: 'Marrakesh' },
        { id: '2991', name: 'Lazari H2', city: 'Oujda' },
    ];

    const cameraRef = useRef(null);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to use the camera</Text>
                <Button onPress={requestPermission} title="Grant permission" />
            </View>
        );
    }

    // Reset state when starting a new scan
    const resetState = () => {
        setProduct(null);
        setShowForm(false);
        setProductName('');
        setProductType('');
        setProductPrice('');
        setProductSupplier('');
        setProductImage('');
        setSelectedStock('1999'); // Reset to default stock
        setStockQuantity('');
        setQuantity(0); // Reset quantity
    };

    const fetchProduct = async (barcode: string) => {
        setLoading(true);
        try {
            const foundProduct = await ProductsService.getProductByBarcode(barcode);
            if (foundProduct) {
                setProduct(foundProduct);
                setQuantity(foundProduct.stocks[0]?.quantity || 0); // Set initial quantity
                setShowForm(false); // Hide form if product is found
                setModalVisible(true); // Show modal with product details
            } else {
                setShowForm(true); // Show form if product doesn't exist
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setShowForm(true); // Show form in case of error
        } finally {
            setLoading(false);
        }
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        resetState();
        setScanned(true);
        setBarcode(data);
        fetchProduct(data);
    };

    const handleManualBarcodeSubmit = () => {
        if (manualBarcode.trim() === '') return;
        resetState();
        setScanned(true);
        setBarcode(manualBarcode);
        fetchProduct(manualBarcode);
        setManualInput(false);
    };

    const handleSubmitNewProduct = async () => {
        if (!productName || !productType || !barcode || !productPrice || !productSupplier || !stockQuantity) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
            return;
        }

        // Create the new product object
        const newProduct = {
            name: productName,
            type: productType,
            barcode,
            price: parseFloat(productPrice),
            supplier: productSupplier,
            image: productImage || 'https://via.placeholder.com/150', // Fallback image
            stocks: [
                {
                    id: selectedStock,
                    name: stocks.find(stock => stock.id === selectedStock)?.name || '',
                    quantity: parseInt(stockQuantity),
                    localisation: {
                        city: stocks.find(stock => stock.id === selectedStock)?.city || '',
                        latitude: 0,
                        longitude: 0,
                    },
                },
            ],
        };

        try {
            // Save the product to the backend
            const createdProduct = await ProductsService.createProduct(newProduct);
            setProduct(createdProduct);
            setShowForm(false);
            resetState();
            Alert.alert("Succès", "Produit ajouté au stock avec succès!");
        } catch (error) {
            console.error('Error creating product:', error);
            Alert.alert("Erreur", "Une erreur s'est produite lors de l'ajout du produit.");
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setProduct(null);
    };

    const handleUpdateQuantity = async () => {
        if (!product || !product.stocks || product.stocks.length === 0) {
          Alert.alert("Erreur", "Aucun stock trouvé pour ce produit.");
          return;
        }
      
        try {
          const updatedProduct = await ProductsService.updateStockQuantity(
            product.id, // No need for parseInt since id is a number
            product.stocks[0].id, // Ensure this is a number
            quantity
          );
          setProduct(updatedProduct);
          Alert.alert("Succès", "Quantité mise à jour avec succès!");
        } catch (error) {
          console.error('Error updating quantity:', error);
          if (error.response && error.response.status === 404) {
            Alert.alert("Erreur", "Le produit ou le stock n'existe pas.");
          } else {
            Alert.alert("Erreur", "Une erreur s'est produite lors de la mise à jour de la quantité.");
          }
        }
      };

    const getQuantityColor = (quantity: number) => {
        if (quantity < 10) return 'red';
        if (quantity <= 20) return 'orange';
        return 'green';
    };

    return (
        <View style={styles.container}>
            {!scanned ? (
                <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={handleBarCodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ['ean13', 'upc_a'] }}
                >
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.halfButton]} onPress={() => setScanned(false)}>
                            <Text style={styles.text}>Scan Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.halfButton]} onPress={() => setManualInput(true)}>
                            <Text style={styles.text}>Enter Barcode</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            ) : (
                <ScrollView contentContainerStyle={styles.detailsContainer}>
                    {loading && <Text>Loading...</Text>}

                    {product ? (
                        <View>
                            <Image
                                source={{ uri: product.image || 'https://via.placeholder.com/150' }} // Fallback image
                                style={styles.productImage}
                                onError={(error) => console.log('Failed to load image:', error.nativeEvent.error)}
                            />
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text>Price: ${product.price}</Text>
                        </View>
                    ) : showForm ? (
                        <View style={styles.formContainer}>
                            <Text style={styles.modalTitle}>New Product</Text>
                            <TextInput style={styles.input} placeholder="Product Name" onChangeText={setProductName} />
                            <TextInput style={styles.input} placeholder="Type" onChangeText={setProductType} />
                            <TextInput style={styles.input} placeholder="Price" keyboardType="numeric" onChangeText={setProductPrice} />
                            <TextInput style={styles.input} placeholder="Supplier" onChangeText={setProductSupplier} />
                            <TextInput style={styles.input} placeholder="Image URL" onChangeText={setProductImage} />

                            <Text style={styles.subtitle}>Stock Information</Text>
                            <Picker
                                selectedValue={selectedStock}
                                onValueChange={(itemValue) => setSelectedStock(itemValue)}
                                style={styles.picker}
                            >
                                {stocks.map((stock) => (
                                    <Picker.Item key={stock.id} label={`${stock.name} (${stock.city})`} value={stock.id} />
                                ))}
                            </Picker>
                            <TextInput
                                style={styles.input}
                                placeholder="Quantity"
                                keyboardType="numeric"
                                onChangeText={setStockQuantity}
                            />

                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitNewProduct}>
                                <Text style={styles.submitButtonText}>Save Product</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
                        <Text style={styles.text}>Scan Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => setManualInput(true)}>
                        <Text style={styles.text}>Enter Barcode</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Modal for Product Details */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {product && (
                            <ScrollView>
                                <View>
                                    <Text style={styles.modalTitle}>{product.name}</Text>
                                    <Image
                                        source={{ uri: product.image || 'https://via.placeholder.com/150' }} // Fallback image
                                        style={styles.modalImage} // Use modalImage style
                                        onError={(error) => console.log('Failed to load image:', error.nativeEvent.error)}
                                    />
                                    <Text style={styles.modalText}>Type: {product.type}</Text>
                                    <Text style={styles.modalText}>Price: ${product.price}</Text>
                                    <Text style={styles.modalText}>Supplier: {product.supplier}</Text>
                                    <Text style={styles.modalText}>Barcode: {product.barcode}</Text>
                                    <Text style={styles.modalText}>Stocks:</Text>
                                    {product.stocks?.map((stock, index) => (
                                        <View key={index} style={styles.stockItem}>
                                            <Text style={styles.stockText}>Name: {stock.name}</Text>
                                            <Text style={[styles.stockText, { color: getQuantityColor(stock.quantity) }]}>
                                                Quantity: {stock.quantity}
                                            </Text>
                                            <Text style={styles.stockText}>
                                                Location: {stock.localisation.city} (Lat: {stock.localisation.latitude}, Lng: {stock.localisation.longitude})
                                            </Text>
                                        </View>
                                    ))}
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Update Quantity"
                                        keyboardType="numeric"
                                        value={quantity.toString()}
                                        onChangeText={(text) => setQuantity(parseInt(text) || 0)}
                                    />
                                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdateQuantity}>
                                        <Text style={styles.updateButtonText}>Update Quantity</Text>
                                    </TouchableOpacity>
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                                            <Text style={styles.closeButtonText}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal for Manual Barcode Input */}
            <Modal visible={manualInput} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={styles.input}
                            placeholder="Barcode"
                            keyboardType="numeric"
                            onChangeText={setManualBarcode}
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={handleManualBarcodeSubmit}>
                            <Text style={styles.text}>Rechercher</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    camera: { flex: 1 },
    detailsContainer: { padding: 20 },
    formContainer: { padding: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 },
    picker: { borderWidth: 1, marginBottom: 10, borderRadius: 8 },
    button: {
        backgroundColor: '#6c5ce7',
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    submitButton: {
        backgroundColor: '#6c5ce7',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    halfButton: {
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
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
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        width: '90%',
        alignItems: 'center',
    },
    modalButton: {
        backgroundColor: '#6c5ce7',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
        width: '45%',
    },
    productImage: { width: 100, height: 100, marginBottom: 10 },
    productName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    updateButton: {
        backgroundColor: '#6200ee',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginTop: 10,
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ScanQRScreen;