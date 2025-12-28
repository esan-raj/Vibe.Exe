/**
 * Push Notifications Service
 * Handles Expo push notifications registration and listeners
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import apiClient from '../api/client';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async registerPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      this.expoPushToken = tokenData.data;
      
      // Send token to backend
      try {
        // Assuming backend has an endpoint to store push tokens
        // This would be: POST /api/auth/push-token
        // For now, we'll just log it
        console.log('Expo Push Token:', this.expoPushToken);
        // await apiClient.request('POST', '/auth/push-token', { token: this.expoPushToken });
      } catch (error) {
        console.error('Failed to send push token to backend:', error);
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error registering push token:', error);
      return null;
    }
  }

  setupNotificationListeners(): {
    removeForegroundListener: () => void;
    removeBackgroundListener: () => void;
  } {
    // Foreground notification listener
    const foregroundListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Foreground notification received:', notification);
      // Handle foreground notification
    });

    // Background/notification tapped listener
    const backgroundListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      // Handle notification tap - navigate to relevant screen
      const data = response.notification.request.content.data;
      // Navigation logic would go here
    });

    return {
      removeForegroundListener: () => Notifications.removeNotificationSubscription(foregroundListener),
      removeBackgroundListener: () => Notifications.removeNotificationSubscription(backgroundListener),
    };
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();

















