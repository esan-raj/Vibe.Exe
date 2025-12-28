/**
 * App Navigator
 * Handles navigation between auth and main app screens
 */

import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { useNetworkStore } from '../services/offline';
import { syncService } from '../services/sync';
import { notificationService } from '../services/notifications';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TouristDashboardScreen from '../screens/TouristDashboardScreen';
import LoadingScreen from '../components/LoadingScreen';
import FloatingTranslateButton from '../components/FloatingTranslateButton';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#10B981',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={TouristDashboardScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 20, color }}>🏠</Text>
        ),
      }}
    />
    <Tab.Screen
      name="Bookings"
      component={TouristDashboardScreen}
      options={{
        tabBarLabel: 'Bookings',
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 20, color }}>📅</Text>
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={TouristDashboardScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 20, color }}>👤</Text>
        ),
      }}
    />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();
  const { checkConnection } = useNetworkStore();

  useEffect(() => {
    // Initialize services
    const initServices = async () => {
      // Check network connection
      await checkConnection();
      
      // Initialize sync service
      await syncService.initialize();
      
      // Register push notifications
      await notificationService.registerPushToken();
      
      // Setup notification listeners
      notificationService.setupNotificationListeners();
      
      // Restore auth session
      await restoreSession();
    };

    initServices();
  }, []);

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        {isAuthenticated ? (
          <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Navigator>
            {/* Global Floating Translate Button - Only shown when authenticated */}
            <FloatingTranslateButton />
          </>
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </View>
  );
};

export default AppNavigator;

