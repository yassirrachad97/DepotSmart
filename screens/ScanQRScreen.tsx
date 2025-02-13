import React, { useState, useRef, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert } from 'react-native';


const ScanQRScreen = () => {

    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    // const [product, setProduct] = useState<Product | null>(null);
    const [barcode, setBarcode] = useState('');
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef<CameraView | null>(null);
    
    if (!permission) {
        return <View />;
      }
    
      if (!permission.granted) {
        return (
          <View style={styles.container}>
            <Text style={styles.message}>We need your permission to show the camera</Text>
            <Button onPress={requestPermission} title="grant permission" />
          </View>
        );
      }


      return (
        <View style={styles.container}>
          <CameraView
            style={styles.camera}
            facing="back"
            // onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'upc_a'],
            }}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
                <Text style={styles.text}>Scan Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
            style={styles.button}
            // onPress={() => setShowManualInput(!showManualInput)}
          >
            <Text style={styles.text}>Enter Barcode </Text>
          </TouchableOpacity>
    
            </View>
          </CameraView>
    
        </View>
      );

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    message: {
      textAlign: 'center',
      paddingBottom: 10,
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-end',
      marginBottom: 30,
      backgroundColor: 'transparent',
      gap: 15,
    },
    button: {
      backgroundColor: '#6c5ce7',
      padding: 15,
      borderRadius: 12,
      width: '48%',
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#6c5ce7',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    text: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
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
      maxHeight: '80%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333',
    },
    productName: {
      fontSize: 18,
      marginBottom: 10,
      color: '#666',
    },
    inputContainer: {
      marginTop: 20,
      width: '100%',
    },
    input: {
      height: 50,
      borderColor: '#b2bec3',
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: 10,
      fontSize: 16,
      backgroundColor: 'white',
    },
    submitButton: {
      backgroundColor: '#6c5ce7',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
    },
    submitButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 10,
    },
    modalButton: {
      flex: 1,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#ff4757',
    },
    confirmButton: {
      backgroundColor: '#6c5ce7',
    },
    modalButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default ScanQRScreen;
