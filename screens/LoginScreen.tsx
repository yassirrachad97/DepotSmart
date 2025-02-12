import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthService } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';


type RootStackParamList = {
  Home: { userId: number };
};

interface LoginScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [secretKey, setSecretKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSecretKey, setShowSecretKey] = useState<boolean>(false);

  const handleLogin = async () => {
    console.log("🔑 Secret Key Entered:", secretKey);
    setIsLoading(true);
    try {
      const warehouseman = await AuthService.login(secretKey);
  
      if (warehouseman) {
        console.log("✅ Logging in user ID:", warehouseman.id);

        Alert.alert('Success', `Welcome, ${warehouseman.name}`, [
          
          { text: 'OK', onPress: () => navigation.navigate('Home', { userId: warehouseman.id }) },
        ]);
        
      } else {
        Alert.alert('Error', 'Invalid Secret Key');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.background}>
          <View style={styles.content}>
            <Image
              source={require('../assets/warehouse.gif')}
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Enter your secret key to continue</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Secret Key"
                placeholderTextColor="#666"
                value={secretKey}
                onChangeText={setSecretKey}
                secureTextEntry={!showSecretKey}
                autoCapitalize="none"
                autoCorrect={false}
              />

                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowSecretKey(!showSecretKey)}
                  >
                        <Ionicons 
                          name={showSecretKey ? "eye-off" : "eye"} 
                          size={24} 
                          color="#666" 
                        />
                      </TouchableOpacity>
                    </View>


            <TouchableOpacity
              style={[
                styles.button,
                { opacity: isLoading ? 0.7 : 1 }
              ]}
              onPress={handleLogin}
              disabled={isLoading || !secretKey.trim()}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              Contact admin if you've forgotten your secret key
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#6200ee',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(151, 71, 255, 0.2)',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',  
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 24,
  },
  input: {
    flex: 1,  
    height: 56,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10, 
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: '100%',
    maxWidth: 320,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 16,
  },
  buttonText: {
    color: '#6200ee',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helpText: {
    marginTop: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
});


export default LoginScreen;