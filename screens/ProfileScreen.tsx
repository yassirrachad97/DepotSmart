import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Image, ScrollView, Button } from 'react-native';
import { Warehouseman } from '../types/index'; 
import { AuthService } from '../services/auth'; 
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileScreenProps {
  route: RouteProp<any, 'Profile'>;
  navigation: StackNavigationProp<any, 'Profile'>;  
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ route, navigation }) => {
  const userId = route.params?.userId;  
  const [warehouseman, setWarehouseman] = useState<Warehouseman | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWarehousemanData = useCallback(async () => {
    setLoading(true);
    setError(null); 
  
    try {
      const data = await AuthService.getWarehousemanById(userId);  
      if (data) {
        setWarehouseman(data);
      } else {
        setError('Utilisateur non trouvé');
      }
    } catch (error) {
      console.error('Error fetching warehouseman:', error);
      setError("Impossible de charger l'utilisateur");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setError('ID de l\'utilisateur non trouvé');
      setLoading(false);
      return;
    }
    fetchWarehousemanData();
  }, [userId]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],  
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Réessayer" onPress={fetchWarehousemanData} />
      </View>
    );
  }

  if (!warehouseman) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Données utilisateur introuvables.</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
        
          <Image
            source={require('../assets/amine.jpeg')} 
            style={styles.profileImage}
            onError={(error) => console.log('Failed to load profile picture:', error.nativeEvent.error)}
          />
          <Text style={styles.profileName}>{warehouseman.name}</Text>
          <Text style={styles.profileCity}>{warehouseman.city}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informations Utilisateur</Text>
          <View style={styles.infoRow}>
            <Icon name="person" size={20} color="#6a11cb" />
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>{warehouseman.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="home" size={20} color="#6a11cb" />
            <Text style={styles.infoLabel}>Warehouse ID:</Text>
            <Text style={styles.infoValue}>{warehouseman.warehouseId}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="logout" size={20} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileCity: {
    fontSize: 16,
    color: 'white',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen;