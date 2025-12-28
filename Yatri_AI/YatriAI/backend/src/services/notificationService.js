const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Your personal phone number for SOS notifications
const EMERGENCY_CONTACT_NUMBER = process.env.EMERGENCY_CONTACT_NUMBER || '+1234567890'; // Replace with your number

let twilioClient: any = null;

// Initialize Twilio client
if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
  console.log('✅ Twilio SMS service initialized');
} else {
  console.warn('⚠️ Twilio credentials not found - SMS notifications will be disabled');
}

export interface SOSNotification {
  alertId: string;
  userId: string;
  userName: string;
  alertType: string;
  severity: string;
  message: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  timestamp: string;
}

class NotificationService {
  // Send SMS notification for SOS alert
  static async sendSOSAlert(notification: SOSNotification): Promise<boolean> {
    if (!twilioClient || !twilioPhoneNumber) {
      console.warn('Twilio not configured - SMS notification skipped');
      return false;
    }

    try {
      const urgencyEmoji = notification.severity === 'critical' ? '🚨🚨🚨' : 
                          notification.severity === 'high' ? '🚨🚨' : '🚨';
      
      const alertTypeEmoji = {
        medical: '🏥',
        security: '🛡️',
        transport: '🚗',
        weather: '🌪️',
        general: '⚠️'
      }[notification.alertType] || '⚠️';

      const mapsUrl = `https://maps.google.com/?q=${notification.location.latitude},${notification.location.longitude}`;
      
      const messageBody = `${urgencyEmoji} EMERGENCY ALERT ${urgencyEmoji}

${alertTypeEmoji} Type: ${notification.alertType.toUpperCase()}
👤 User: ${notification.userName}
📍 Location: ${notification.location.address}
🗺️ Maps: ${mapsUrl}

💬 Message: "${notification.message}"

⏰ Time: ${new Date(notification.timestamp).toLocaleString()}
🆔 Alert ID: ${notification.alertId}

This is an automated emergency notification from Axicov SOS Agent.`;

      const message = await twilioClient.messages.create({
        body: messageBody,
        from: twilioPhoneNumber,
        to: EMERGENCY_CONTACT_NUMBER
      });

      console.log(`✅ SOS SMS sent successfully: ${message.sid}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to send SOS SMS:', error);
      return false;
    }
  }

  // Send follow-up notification when alert status changes
  static async sendStatusUpdate(alertId: string, status: string, userName: string): Promise<boolean> {
    if (!twilioClient || !twilioPhoneNumber) {
      return false;
    }

    try {
      const statusEmoji = {
        acknowledged: '✅',
        resolved: '✅',
        active: '🔄'
      }[status] || '📝';

      const messageBody = `${statusEmoji} SOS Alert Update

🆔 Alert ID: ${alertId}
👤 User: ${userName}
📊 Status: ${status.toUpperCase()}
⏰ Updated: ${new Date().toLocaleString()}

Axicov SOS Agent`;

      const message = await twilioClient.messages.create({
        body: messageBody,
        from: twilioPhoneNumber,
        to: EMERGENCY_CONTACT_NUMBER
      });

      console.log(`✅ Status update SMS sent: ${message.sid}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to send status update SMS:', error);
      return false;
    }
  }

  // Send test notification to verify setup
  static async sendTestNotification(): Promise<boolean> {
    if (!twilioClient || !twilioPhoneNumber) {
      console.warn('Twilio not configured - test notification skipped');
      return false;
    }

    try {
      const messageBody = `🧪 Axicov SOS Test

This is a test notification from your Axicov SOS Agent.

✅ SMS notifications are working correctly!
📱 Emergency alerts will be sent to this number.
⏰ Test sent: ${new Date().toLocaleString()}

You can safely ignore this message.`;

      const message = await twilioClient.messages.create({
        body: messageBody,
        from: twilioPhoneNumber,
        to: EMERGENCY_CONTACT_NUMBER
      });

      console.log(`✅ Test SMS sent successfully: ${message.sid}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to send test SMS:', error);
      return false;
    }
  }

  // Send periodic heartbeat (optional - for monitoring)
  static async sendHeartbeat(): Promise<boolean> {
    if (!twilioClient || !twilioPhoneNumber) {
      return false;
    }

    try {
      const messageBody = `💓 Axicov Heartbeat

Your SOS Agent is online and monitoring.
⏰ ${new Date().toLocaleString()}

System Status: ✅ All services operational`;

      const message = await twilioClient.messages.create({
        body: messageBody,
        from: twilioPhoneNumber,
        to: EMERGENCY_CONTACT_NUMBER
      });

      console.log(`✅ Heartbeat SMS sent: ${message.sid}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to send heartbeat SMS:', error);
      return false;
    }
  }

  // Validate phone number format
  static validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Get service status
  static getServiceStatus(): {
    isConfigured: boolean;
    hasCredentials: boolean;
    emergencyNumber: string;
  } {
    return {
      isConfigured: !!twilioClient,
      hasCredentials: !!(accountSid && authToken && twilioPhoneNumber),
      emergencyNumber: EMERGENCY_CONTACT_NUMBER
    };
  }
}

module.exports = { NotificationService };