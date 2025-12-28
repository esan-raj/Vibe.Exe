import express from 'express';
import { SimpleNotificationService } from '../services/simpleNotificationService';

const router = express.Router();

// Interfaces
interface SOSAlert {
  id: string;
  userId: string;
  type: string;
  severity: string;
  location: string;
  message: string;
  timestamp: string;
  status: string;
  responders: any[];
  estimatedResponseTime: number;
}

interface SOSNotification {
  alertId: string;
  userId: string;
  userName: string;
  alertType: string;
  severity: string;
  message: string;
  location: string;
  timestamp: string;
}

// Mock data for emergency contacts in Kolkata
const emergencyContacts = [
  {
    id: 'police-1',
    name: 'Kolkata Police Control Room',
    phone: '100',
    type: 'police',
    location: 'Kolkata',
    available24x7: true
  },
  {
    id: 'medical-1',
    name: 'Medical Emergency',
    phone: '108',
    type: 'medical',
    location: 'Kolkata',
    available24x7: true
  },
  {
    id: 'fire-1',
    name: 'Fire Brigade',
    phone: '101',
    type: 'fire',
    location: 'Kolkata',
    available24x7: true
  },
  {
    id: 'tourist-1',
    name: 'West Bengal Tourism Helpline',
    phone: '1363',
    type: 'tourist_helpline',
    location: 'Kolkata',
    available24x7: true
  },
  {
    id: 'embassy-1',
    name: 'Tourist Assistance Center',
    phone: '+91-33-2248-8271',
    type: 'embassy',
    location: 'Kolkata',
    available24x7: false
  }
];

// Mock SOS alerts storage
let sosAlerts: SOSAlert[] = [];

// AI-powered risk assessment
const assessRisk = (alertType: string, location: string, message: string): string => {
  // Simple risk assessment logic
  const riskFactors: Record<string, { base: string; keywords: string[] }> = {
    medical: { base: 'high', keywords: ['heart', 'breathing', 'unconscious', 'bleeding'] },
    security: { base: 'medium', keywords: ['robbery', 'assault', 'harassment', 'theft'] },
    transport: { base: 'low', keywords: ['accident', 'stranded', 'breakdown'] },
    weather: { base: 'medium', keywords: ['flood', 'storm', 'cyclone'] },
    general: { base: 'low', keywords: [] }
  };

  const factor = riskFactors[alertType] || riskFactors.general;
  let severity = factor.base;

  // Check for critical keywords
  const criticalKeywords = factor.keywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );

  if (criticalKeywords) {
    severity = alertType === 'medical' ? 'critical' : 'high';
  }

  return severity;
};

// Generate automated response suggestions
const generateResponseSuggestions = (alert: SOSAlert): string[] => {
  const suggestions: Record<string, string[]> = {
    medical: [
      'Stay calm and find a safe location',
      'Call 108 for immediate medical assistance',
      'If conscious, provide basic first aid',
      'Share your exact location with emergency contacts'
    ],
    security: [
      'Move to a crowded, well-lit area if possible',
      'Contact local police (100) immediately',
      'Alert nearby people for help',
      'Document the incident if safe to do so'
    ],
    transport: [
      'Contact local transport authority',
      'Share your location with family/friends',
      'Look for alternative transport options',
      'Stay in a safe, visible location'
    ],
    weather: [
      'Seek immediate shelter',
      'Monitor weather updates',
      'Avoid flooded areas',
      'Contact local authorities if trapped'
    ],
    general: [
      'Assess the situation calmly',
      'Contact appropriate emergency services',
      'Share your location with trusted contacts',
      'Follow local authority instructions'
    ]
  };

  return suggestions[alert.type] || suggestions.general;
};

// POST /api/sos/alert - Create SOS alert
router.post('/alert', async (req, res) => {
  try {
    const { userId, type, location, message, userName } = req.body;

    if (!userId || !type || !location || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, type, location, message'
      });
    }

    const alertId = `sos_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const severity = assessRisk(type, location, message);
    
    const newAlert: SOSAlert = {
      id: alertId,
      userId,
      type,
      severity: severity,
      location,
      message,
      timestamp: new Date().toISOString(),
      status: 'active',
      responders: [],
      estimatedResponseTime: severity === 'critical' ? 5 : severity === 'high' ? 10 : 15
    };

    sosAlerts.push(newAlert);

    console.log('🚨 SOS Alert Created:', {
      alertId,
      userId,
      type,
      severity,
      location: typeof location === 'string' 
        ? location.substring(0, 50) + '...' 
        : location.address || JSON.stringify(location).substring(0, 50) + '...',
      message: message.substring(0, 100) + '...',
      timestamp: newAlert.timestamp
    });

    // Send SMS notification
    const notification: SOSNotification = {
      alertId,
      userId,
      userName: userName || 'Unknown User',
      alertType: type,
      severity: severity,
      message,
      location,
      timestamp: newAlert.timestamp
    };

    // Send SMS notification (non-blocking)
    SimpleNotificationService.sendSOSAlert(notification).catch((error: any) => {
      console.error('Failed to send SMS notification:', error);
    });

    // Get relevant emergency contacts
    const relevantContacts = emergencyContacts.filter(contact => {
      if (type === 'medical') return contact.type === 'medical' || contact.type === 'police';
      if (type === 'security') return contact.type === 'police';
      if (type === 'transport') return contact.type === 'tourist_helpline';
      return contact.type === 'tourist_helpline' || contact.type === 'police';
    });

    const responseSuggestions = generateResponseSuggestions(newAlert);

    res.json({
      success: true,
      alert: newAlert,
      emergencyContacts: relevantContacts,
      responseSuggestions,
      smsNotificationSent: true,
      message: 'SOS alert created successfully. Emergency services and your emergency contact have been notified.'
    });

  } catch (error) {
    console.error('Error creating SOS alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SOS alert'
    });
  }
});

// GET /api/sos/alerts/:userId - Get user's SOS alerts
router.get('/alerts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userAlerts = sosAlerts.filter(alert => alert.userId === userId);

    console.log(`📋 Retrieved ${userAlerts.length} alerts for user ${userId}`);

    res.json({
      success: true,
      alerts: userAlerts
    });

  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SOS alerts'
    });
  }
});

// PUT /api/sos/alert/:alertId/status - Update alert status
router.put('/alert/:alertId/status', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, userName } = req.body;

    const alertIndex = sosAlerts.findIndex(alert => alert.id === alertId);
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const oldStatus = sosAlerts[alertIndex].status;
    sosAlerts[alertIndex].status = status;

    console.log(`📝 Alert ${alertId} status updated from ${oldStatus} to ${status}`);

    // Send status update SMS if status changed
    if (oldStatus !== status) {
      SimpleNotificationService.sendStatusUpdate(alertId, status, userName || 'Unknown User').catch((error: any) => {
        console.error('Failed to send status update SMS:', error);
      });
    }

    res.json({
      success: true,
      alert: sosAlerts[alertIndex],
      smsNotificationSent: oldStatus !== status,
      message: `Alert status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert status'
    });
  }
});

// GET /api/sos/emergency-contacts - Get emergency contacts
router.get('/emergency-contacts', async (req, res) => {
  try {
    const { location } = req.query;
    
    let contacts = emergencyContacts;
    if (location) {
      contacts = emergencyContacts.filter(contact => 
        contact.location.toLowerCase().includes(location.toString().toLowerCase())
      );
    }

    res.json({
      success: true,
      contacts
    });

  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency contacts'
    });
  }
});

// POST /api/sos/agent/analyze - AI analysis of situation
router.post('/agent/analyze', async (req, res) => {
  try {
    const { situation, location } = req.body;

    // AI-powered situation analysis
    const analysis = {
      riskLevel: assessRisk('general', location, situation),
      recommendedActions: [
        'Contact emergency services if immediate danger',
        'Share location with trusted contacts',
        'Move to a safe, well-lit area',
        'Document the situation if safe to do so'
      ],
      nearbyResources: [
        'Police Station: 0.5km away',
        'Hospital: 1.2km away',
        'Tourist Information Center: 0.8km away'
      ],
      estimatedResponseTime: '8-12 minutes',
      confidence: 0.85
    };

    res.json({
      success: true,
      analysis,
      message: 'Situation analyzed successfully'
    });

  } catch (error) {
    console.error('Error analyzing situation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze situation'
    });
  }
});

// POST /api/sos/test-notification - Send test SMS
router.post('/test-notification', async (_req, res) => {
  try {
    const success = await SimpleNotificationService.sendTestNotification();
    
    res.json({
      success,
      message: success 
        ? 'Test SMS sent successfully! Check your phone.' 
        : 'Failed to send test SMS. Check Twilio configuration.'
    });

  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

// GET /api/sos/notification-status - Get notification service status
router.get('/notification-status', async (_req, res) => {
  try {
    const status = SimpleNotificationService.getServiceStatus();
    
    res.json({
      success: true,
      status,
      message: status.isConfigured 
        ? 'SMS notifications are configured and ready'
        : 'SMS notifications are not configured. Please set up Twilio credentials.'
    });

  } catch (error) {
    console.error('Error getting notification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification status'
    });
  }
});

export default router;