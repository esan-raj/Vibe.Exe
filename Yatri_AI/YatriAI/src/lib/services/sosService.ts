// Fixed API URL - removed duplicate /api
const API_BASE_URL = 'http://localhost:3001';
console.log('🔧 SOS Service using API_BASE_URL:', API_BASE_URL);

export interface SOSAlert {
  id: string;
  userId: string;
  type: 'medical' | 'security' | 'transport' | 'weather' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  responders: string[];
  estimatedResponseTime: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'police' | 'medical' | 'fire' | 'tourist_helpline' | 'embassy';
  location: string;
  available24x7: boolean;
}

export interface SOSResponse {
  success: boolean;
  alert?: SOSAlert;
  emergencyContacts?: EmergencyContact[];
  responseSuggestions?: string[];
  message: string;
}

export class SOSService {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${API_BASE_URL}/api/sos${endpoint}`;
      console.log(`🌐 SOS API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`📡 SOS API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ SOS API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`SOS API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ SOS API Success:`, data.success ? 'Success' : 'Failed');
      return data;
    } catch (error) {
      console.error('❌ SOS Service Error:', error);
      throw error;
    }
  }

  static async createAlert(alertData: {
    userId: string;
    type: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    message: string;
    userName?: string;
  }): Promise<SOSResponse> {
    return this.makeRequest('/alert', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  static async getUserAlerts(userId: string): Promise<{ success: boolean; alerts: SOSAlert[] }> {
    return this.makeRequest(`/alerts/${userId}`);
  }

  static async updateAlertStatus(alertId: string, status: string): Promise<SOSResponse> {
    return this.makeRequest(`/alert/${alertId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  static async getEmergencyContacts(location?: string): Promise<{ success: boolean; contacts: EmergencyContact[] }> {
    const query = location ? `?location=${encodeURIComponent(location)}` : '';
    return this.makeRequest(`/emergency-contacts${query}`);
  }

  static async analyzeSituation(situationData: {
    situation: string;
    location: any;
    userProfile: any;
  }): Promise<{
    success: boolean;
    analysis: {
      riskLevel: string;
      recommendedActions: string[];
      nearbyResources: string[];
      estimatedResponseTime: string;
      confidence: number;
    };
    message: string;
  }> {
    return this.makeRequest('/agent/analyze', {
      method: 'POST',
      body: JSON.stringify(situationData),
    });
  }

  // Test SMS notification
  static async testNotification(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/test-notification', {
      method: 'POST',
    });
  }

  // Get notification service status
  static async getNotificationStatus(): Promise<{
    success: boolean;
    status: {
      isConfigured: boolean;
      hasCredentials: boolean;
      emergencyNumber: string;
    };
    message: string;
  }> {
    return this.makeRequest('/notification-status');
  }

  // Utility method to get user's current location
  static async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    address: string;
  }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        // Fallback to Kolkata coordinates
        resolve({
          latitude: 22.5726,
          longitude: 88.3639,
          address: 'Kolkata, West Bengal (Default Location)'
        });
        return;
      }

      console.log('🗺️ Requesting user location...');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`📍 Location obtained: ${latitude}, ${longitude}`);
          
          // In a real app, you would reverse geocode this to get the address
          // For now, we'll use a placeholder
          const address = await SOSService.reverseGeocode(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            address: address || 'Current Location'
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          console.log('🗺️ Using fallback location: Kolkata, West Bengal');
          
          // Fallback to Kolkata coordinates
          resolve({
            latitude: 22.5726,
            longitude: 88.3639,
            address: 'Kolkata, West Bengal (Fallback Location)'
          });
        },
        {
          enableHighAccuracy: false, // Changed to false for faster response
          timeout: 5000, // Reduced to 5 seconds
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Simple reverse geocoding (in a real app, you'd use a proper geocoding service)
  private static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      // This is a placeholder - in a real app, you'd use Google Maps API or similar
      return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      return 'Unknown Location';
    }
  }

  // Emergency contact quick dial
  static dialEmergencyNumber(phone: string) {
    if (typeof window !== 'undefined') {
      window.open(`tel:${phone}`, '_self');
    }
  }

  // Share location via various methods
  static async shareLocation(location: { latitude: number; longitude: number; address: string }) {
    const locationText = `Emergency! I need help at: ${location.address} (${location.latitude}, ${location.longitude})`;
    const mapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Location',
          text: locationText,
          url: mapsUrl
        });
      } catch (error) {
        // Fallback to copying to clipboard
        SOSService.copyToClipboard(`${locationText}\n${mapsUrl}`);
      }
    } else {
      // Fallback to copying to clipboard
      SOSService.copyToClipboard(`${locationText}\n${mapsUrl}`);
    }
  }

  private static copyToClipboard(text: string) {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern clipboard API (requires HTTPS)
      navigator.clipboard.writeText(text).catch(() => {
        // Fallback if clipboard API fails
        this.fallbackCopyToClipboard(text);
      });
    } else {
      // Fallback for older browsers or non-HTTPS
      this.fallbackCopyToClipboard(text);
    }
  }

  private static fallbackCopyToClipboard(text: string) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      // Try the deprecated method as last resort
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        console.warn('Fallback copy to clipboard failed');
      }
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    }
  }
}

export default SOSService;