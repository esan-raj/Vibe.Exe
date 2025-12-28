/**
 * Notification Service
 * 
 * Multi-channel notification system for YatriAI.
 * Supports in-app, email, SMS, and push notifications.
 * 
 * Channels:
 * - In-App: Real-time notifications within the app
 * - Email: Via n8n workflows (SendGrid, Mailgun, etc.)
 * - SMS: Via n8n workflows (Twilio, etc.)
 * - Push: Browser push notifications (Web Push API)
 * 
 * Features:
 * - Notification preferences per user
 * - Notification history
 * - Read/unread status
 * - Priority levels
 * - Scheduled notifications
 */

import { ServiceFlags, NotificationChannels } from './config';
import { n8nService } from './n8n.service';

// Notification types
export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'payment_received'
  | 'payment_failed'
  | 'itinerary_ready'
  | 'guide_assigned'
  | 'guide_message'
  | 'review_request'
  | 'trip_reminder'
  | 'weather_alert'
  | 'emergency'
  | 'promotion'
  | 'system';

// Notification priority
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Notification channel
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

// Notification creation params
export interface CreateNotificationParams {
  userId: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: Date;
}

// Notification preferences
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;
  disabledTypes?: NotificationType[];
}

// In-memory notification store (would be replaced with backend in production)
const notificationStore: Map<string, Notification[]> = new Map();
const preferencesStore: Map<string, NotificationPreferences> = new Map();

// Event listeners for real-time notifications
type NotificationListener = (notification: Notification) => void;
const listeners: Map<string, NotificationListener[]> = new Map();

class NotificationService {
  private useMock: boolean;

  constructor() {
    this.useMock = ServiceFlags.USE_MOCK_NOTIFICATIONS;
  }

  /**
   * Get default notification preferences
   */
  getDefaultPreferences(): NotificationPreferences {
    return {
      email: NotificationChannels.EMAIL_ENABLED,
      sms: NotificationChannels.SMS_ENABLED,
      push: NotificationChannels.PUSH_ENABLED,
      inApp: NotificationChannels.IN_APP_ENABLED,
    };
  }

  /**
   * Get user notification preferences
   */
  getPreferences(userId: string): NotificationPreferences {
    return preferencesStore.get(userId) || this.getDefaultPreferences();
  }

  /**
   * Update user notification preferences
   */
  updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const current = this.getPreferences(userId);
    preferencesStore.set(userId, { ...current, ...preferences });
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribe(userId: string, callback: NotificationListener): () => void {
    if (!listeners.has(userId)) {
      listeners.set(userId, []);
    }
    listeners.get(userId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const userListeners = listeners.get(userId);
      if (userListeners) {
        const index = userListeners.indexOf(callback);
        if (index > -1) {
          userListeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify all listeners for a user
   */
  private notifyListeners(userId: string, notification: Notification): void {
    const userListeners = listeners.get(userId);
    if (userListeners) {
      userListeners.forEach(callback => callback(notification));
    }
  }

  /**
   * Create and send a notification
   */
  async send(params: CreateNotificationParams): Promise<Notification> {
    const preferences = this.getPreferences(params.userId);
    const priority = params.priority || 'medium';
    
    // Determine which channels to use based on preferences and request
    const requestedChannels = params.channels || this.getDefaultChannels(params.type, priority);
    const enabledChannels = requestedChannels.filter(channel => {
      switch (channel) {
        case 'email': return preferences.email && NotificationChannels.EMAIL_ENABLED;
        case 'sms': return preferences.sms && NotificationChannels.SMS_ENABLED;
        case 'push': return preferences.push && NotificationChannels.PUSH_ENABLED;
        case 'in_app': return preferences.inApp;
        default: return false;
      }
    });

    // Check if notification type is disabled
    if (preferences.disabledTypes?.includes(params.type)) {
      console.log(`Notification type "${params.type}" is disabled for user ${params.userId}`);
      // Still create in-app notification but mark as read
      const notification = this.createNotificationObject(params, ['in_app'], priority);
      notification.read = true;
      return notification;
    }

    // Create the notification
    const notification = this.createNotificationObject(params, enabledChannels, priority);

    // Store in-app notification
    if (enabledChannels.includes('in_app')) {
      this.storeNotification(params.userId, notification);
      this.notifyListeners(params.userId, notification);
    }

    // Send via external channels (n8n)
    if (!this.useMock) {
      await this.sendExternalNotifications(params, enabledChannels);
    } else {
      console.log(`📧 [Mock] Notification sent via ${enabledChannels.join(', ')}:`, {
        title: params.title,
        message: params.message,
      });
    }

    return notification;
  }

  /**
   * Create notification object
   */
  private createNotificationObject(
    params: CreateNotificationParams,
    channels: NotificationChannel[],
    priority: NotificationPriority
  ): Notification {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      priority,
      channels,
      data: params.data,
      imageUrl: params.imageUrl,
      actionUrl: params.actionUrl,
      actionLabel: params.actionLabel,
      read: false,
      createdAt: new Date(),
      expiresAt: params.expiresAt,
    };
  }

  /**
   * Get default channels based on notification type and priority
   */
  private getDefaultChannels(type: NotificationType, priority: NotificationPriority): NotificationChannel[] {
    const channels: NotificationChannel[] = ['in_app'];

    switch (priority) {
      case 'urgent':
        channels.push('email', 'sms', 'push');
        break;
      case 'high':
        channels.push('email', 'push');
        break;
      case 'medium':
        channels.push('email');
        break;
      case 'low':
        // Only in-app for low priority
        break;
    }

    // Override based on type
    if (type === 'emergency') {
      return ['in_app', 'email', 'sms', 'push'];
    }
    if (type === 'booking_confirmed' || type === 'payment_received') {
      return ['in_app', 'email'];
    }

    return channels;
  }

  /**
   * Send notifications via external channels using n8n
   */
  private async sendExternalNotifications(
    params: CreateNotificationParams,
    channels: NotificationChannel[]
  ): Promise<void> {
    // Skip if only in-app
    if (channels.length === 1 && channels[0] === 'in_app') {
      return;
    }

    // Map notification type to n8n workflow
    const workflowPayload = {
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      userPhone: params.userPhone,
      type: params.type,
      title: params.title,
      message: params.message,
      channels: channels.filter(c => c !== 'in_app'),
      data: params.data,
      actionUrl: params.actionUrl,
    };

    // Trigger appropriate n8n workflow based on notification type
    switch (params.type) {
      case 'booking_confirmed':
        // Handled by booking confirmation workflow
        break;
      case 'payment_received':
        // Handled by payment received workflow
        break;
      case 'itinerary_ready':
        // Handled by itinerary generated workflow
        break;
      case 'emergency':
        // Already handled by emergency alert
        break;
      default:
        // Generic notification workflow
        await n8nService.triggerCustomWorkflow('generic-notification', workflowPayload);
    }
  }

  /**
   * Store notification in memory
   */
  private storeNotification(userId: string, notification: Notification): void {
    if (!notificationStore.has(userId)) {
      notificationStore.set(userId, []);
    }
    notificationStore.get(userId)!.unshift(notification);

    // Keep only last 100 notifications per user
    const userNotifications = notificationStore.get(userId)!;
    if (userNotifications.length > 100) {
      notificationStore.set(userId, userNotifications.slice(0, 100));
    }
  }

  /**
   * Get all notifications for a user
   */
  getNotifications(userId: string, options?: {
    unreadOnly?: boolean;
    type?: NotificationType;
    limit?: number;
  }): Notification[] {
    let notifications = notificationStore.get(userId) || [];

    if (options?.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    if (options?.type) {
      notifications = notifications.filter(n => n.type === options.type);
    }
    if (options?.limit) {
      notifications = notifications.slice(0, options.limit);
    }

    // Filter out expired notifications
    const now = new Date();
    notifications = notifications.filter(n => !n.expiresAt || n.expiresAt > now);

    return notifications;
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId: string): number {
    return this.getNotifications(userId, { unreadOnly: true }).length;
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: string, notificationId: string): void {
    const notifications = notificationStore.get(userId);
    if (notifications) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        notification.readAt = new Date();
      }
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId: string): void {
    const notifications = notificationStore.get(userId);
    if (notifications) {
      const now = new Date();
      notifications.forEach(n => {
        if (!n.read) {
          n.read = true;
          n.readAt = now;
        }
      });
    }
  }

  /**
   * Delete a notification
   */
  delete(userId: string, notificationId: string): void {
    const notifications = notificationStore.get(userId);
    if (notifications) {
      const index = notifications.findIndex(n => n.id === notificationId);
      if (index > -1) {
        notifications.splice(index, 1);
      }
    }
  }

  /**
   * Clear all notifications for a user
   */
  clearAll(userId: string): void {
    notificationStore.set(userId, []);
  }

  /**
   * Request push notification permission
   */
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Send browser push notification
   */
  async sendPushNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }

  // Convenience methods for common notifications

  async notifyBookingConfirmed(params: {
    userId: string;
    userEmail: string;
    userName: string;
    bookingId: string;
    bookingTitle: string;
    date: string;
    amount: number;
  }): Promise<Notification> {
    return this.send({
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      type: 'booking_confirmed',
      title: 'Booking Confirmed! 🎉',
      message: `Your booking for "${params.bookingTitle}" on ${params.date} has been confirmed.`,
      priority: 'high',
      data: {
        bookingId: params.bookingId,
        amount: params.amount,
      },
      actionUrl: `/bookings/${params.bookingId}`,
      actionLabel: 'View Booking',
    });
  }

  async notifyPaymentReceived(params: {
    userId: string;
    userEmail: string;
    userName: string;
    paymentId: string;
    amount: number;
    currency: string;
  }): Promise<Notification> {
    return this.send({
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      type: 'payment_received',
      title: 'Payment Successful ✅',
      message: `We've received your payment of ${params.currency} ${params.amount}.`,
      priority: 'high',
      data: {
        paymentId: params.paymentId,
      },
    });
  }

  async notifyTripReminder(params: {
    userId: string;
    userEmail: string;
    userName: string;
    tripTitle: string;
    date: string;
    daysUntil: number;
  }): Promise<Notification> {
    return this.send({
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      type: 'trip_reminder',
      title: `Trip Reminder: ${params.daysUntil} day${params.daysUntil === 1 ? '' : 's'} to go! 🗓️`,
      message: `Your trip "${params.tripTitle}" starts on ${params.date}. Don't forget to pack!`,
      priority: 'medium',
      data: {
        daysUntil: params.daysUntil,
      },
    });
  }

  async notifyWeatherAlert(params: {
    userId: string;
    destination: string;
    alert: string;
    severity: 'low' | 'medium' | 'high';
  }): Promise<Notification> {
    return this.send({
      userId: params.userId,
      type: 'weather_alert',
      title: `Weather Alert for ${params.destination} ⚠️`,
      message: params.alert,
      priority: params.severity === 'high' ? 'high' : 'medium',
      data: {
        destination: params.destination,
        severity: params.severity,
      },
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;

