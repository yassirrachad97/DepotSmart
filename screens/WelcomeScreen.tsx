import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  
};

interface WelcomeScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to{'\n'}Entrepôt!</Text>

          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/warehouse.gif')}
              style={styles.gif}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.subtitle}>
            Your Complete Warehouse{'\n'}Management Solution
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 1,
  },
  imageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
  },
  gif: {
    width: 240,
    height: 240,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#6200ee',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;