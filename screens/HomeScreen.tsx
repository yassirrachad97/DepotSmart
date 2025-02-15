import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthService } from '../services/auth';
import { ProductsService } from '../services/products';
import { MaterialIcons } from '@expo/vector-icons';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Home: { userId: number } | undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [warehouseman, setWarehouseman] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<{ totalProducts: number; outOfStock: number; totalStockValue: number } | null>(null);

  const loadWarehousemanData = async () => {
    try {
      if (route.params?.userId) {
        const data = await AuthService.getWarehousemanById(route.params.userId);
        setWarehouseman(data);
      } else {
        console.log('No userId found in route params.');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await ProductsService.calculateStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  useEffect(() => {
    loadWarehousemanData();
    loadStatistics();
  }, [route.params?.userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="person-outline" size={30} color="#fff" />
            <Text style={styles.welcomeText}>
              Bienvenue, {warehouseman?.name || 'Utilisateur'}
            </Text>
          </View>

         
          <View style={styles.statsContainer}>
            <Text style={styles.statTitle}>📊 Statistiques Générales</Text>

            <View style={styles.statCard}>
              <MaterialIcons name="inventory" size={30} color="#007AFF" />
              <Text style={styles.statText}>Total Produits</Text>
              <Text style={styles.statNumber}>{statistics?.totalProducts || 0}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FF3B30' }]}>
              <MaterialIcons name="error-outline" size={30} color="#fff" />
              <Text style={[styles.statText, { color: '#fff' }]}>Rupture de stock</Text>
              <Text style={[styles.statNumber, { color: '#fff' }]}>{statistics?.outOfStock || 0}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#4CD964' }]}>
              <MaterialIcons name="attach-money" size={30} color="#fff" />
              <Text style={[styles.statText, { color: '#fff' }]}>Valeur du Stock</Text>
              <Text style={[styles.statNumber, { color: '#fff' }]}>{statistics?.totalStockValue || 0} MAD</Text>
            </View>
          </View>

        
          <TouchableOpacity
            style={styles.viewMoreButton}
            // onPress={() => navigation.navigate('StatisticsDetails')}
          >
            <Text style={styles.viewMoreText}>📈 Voir les détails</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a11cb', // Fallback solid color
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6a11cb',
  },
  content: {
    padding: 16,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginTop: 10,
  },
  statTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#fff',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
  viewMoreButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  viewMoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default HomeScreen;