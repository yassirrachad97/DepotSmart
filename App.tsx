import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ProductsScreen from './screens/ProductsScreen';
import ScanQRScreen from './screens/ScanQRScreen';
import ProfileScreen from './screens/ProfileScreen';


export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Home: { userId: number } | undefined;
};

export type TabParamList = {
  Home: { userId: number };
  Products: undefined;
  ScanQR: { userId: number };
  Profile: { userId: number };
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MyTabs = ({ route }: { route: any }) => {
  const { userId } = route.params || {};

  return (
    <Tab.Navigator
      initialRouteName="TabHome"
      screenOptions={{
        tabBarStyle: { backgroundColor: '#6200ee' },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <Tab.Screen
        name="TabHome"
        component={HomeScreen}
        initialParams={{ userId }} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}  
        initialParams={{ userId }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScanQR"
        component={ScanQRScreen}
        initialParams={{ userId }}  
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId }}  
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={MyTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
