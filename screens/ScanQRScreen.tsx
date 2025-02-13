import React, { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Image, ScrollView, Alert } from 'react-native';
import { ProductsService } from '../services/products';

const ScanQRScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [product, setProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [manualInput, setManualInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [manualBarcode, setManualBarcode] = useState('');

    // Form fields
    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productSupplier, setProductSupplier] = useState('');
    const [productImage, setProductImage] = useState('');

    // Dynamic stock
    const [stocks, setStocks] = useState([]);
    const [stockName, setStockName] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [stockCity, setStockCity] = useState('');

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
        setStocks([]);
    };

    const fetchProduct = async (barcode) => {
        setLoading(true);
        try {
            const foundProduct = await ProductsService.getProductByBarcode(barcode);
            if (foundProduct) {
                setProduct(foundProduct);
                setShowForm(false); // Cache le formulaire si le produit est trouvé
            } else {
                setShowForm(true); // Afficher le formulaire si le produit n'existe pas
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setShowForm(true); // Afficher le formulaire en cas d'erreur
        } finally {
            setLoading(false);
        }
    };

    const handleBarCodeScanned = async ({ data }) => {
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

    const addStock = () => {
        if (!stockName || !stockQuantity || !stockCity) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs du stock.");
            return;
        }

        const newStock = {
            id: Date.now(),
            name: stockName,
            quantity: parseInt(stockQuantity),
            localisation: { city: stockCity, latitude: 0, longitude: 0 },
        };

        setStocks([...stocks, newStock]);
        setStockName('');
        setStockQuantity('');
        setStockCity('');
    };

    const handleSubmitNewProduct = async () => {
        if (!productName || !productType || !barcode || !productPrice || !productSupplier) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        const newProduct = {
            name: productName,
            type: productType,
            barcode,
            price: parseFloat(productPrice),
            supplier: productSupplier,
            image: productImage,
            stocks,
        };

        try {
            const createdProduct = await ProductsService.createProduct(newProduct);
            setProduct(createdProduct);
            setShowForm(false);
            resetState();
        } catch (error) {
            console.error('Error creating product:', error);
        }
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
                            {product.image ? (
                                <Image source={{ uri: product.image }} style={styles.productImage} />
                            ) : (
                                <Text>No image available</Text>
                            )}
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

                            <Text style={styles.subtitle}>Add Stock</Text>
                            <TextInput style={styles.input} placeholder="Stock Name" onChangeText={setStockName} />
                            <TextInput style={styles.input} placeholder="Quantity" keyboardType="numeric" onChangeText={setStockQuantity} />
                            <TextInput style={styles.input} placeholder="City" onChangeText={setStockCity} />
                            <TouchableOpacity style={styles.addButton} onPress={addStock}>
                                <Text style={styles.addButtonText}>Add Stock</Text>
                            </TouchableOpacity>

                            {stocks.map((stock, index) => (
                                <Text key={index}>{stock.name} - {stock.quantity} ({stock.localisation.city})</Text>
                            ))}

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
        marginTop: 10
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
});

export default ScanQRScreen;