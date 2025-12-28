/**
 * n8n Workflow Automation Service
 * 
 * Integrates with n8n (n8n.io) for workflow automation.
 * n8n can be self-hosted locally or used via cloud.
 * 
 * Features:
 * - Trigger workflows via webhooks
 * - Notification automation (email, SMS, push)
 * - Multi-step workflow orchestration
 * - Integration with other services (payment, blockchain, AI)
 * 
 * Workflows:
 * - User Registration: Welcome emails, onboarding
 * - Booking Confirmation: Confirmation emails, SMS
 * - Itinerary Generated: PDF email delivery
 * - Guide Assignment: Notifications to both parties
 * - Payment Received: Receipts and blockchain recording
 * - Trip/Review Reminders: Scheduled notifications
 * - Emergency Alerts: Urgent notifications
 */

import { ServiceURLs, ServiceFlags, N8nWorkflows } from './config';
import { createServiceFetch } from '../debug';

// Create debug-enabled fetch for this service
const serviceFetch = createServiceFetch('n8nService');

// Workflow trigger result
export interface WorkflowTriggerResult {
  success: boolean;
  workflowId?: string;
  executionId?: string;
  message?: string;
  error?: string;
}

// User registration payload
export interface UserRegistrationPayload {
  userId: string;
  email: string;
  name: string;
  role: 'tourist' | 'guide' | 'seller' | 'admin';
  registeredAt: string;
  preferences?: {
    interests: string[];
    language: string;
  };
}

// Booking confirmation payload
export interface BookingConfirmationPayload {
  bookingId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  bookingType: 'guide' | 'accommodation' | 'transport' | 'package';
  title: string;
  date: string;
  endDate?: string;
  amount: number;
  currency: string;
  status: 'confirmed' | 'pending';
  blockchainHash?: string;
  guideDetails?: {
    guideId: string;
    guideName: string;
    guidePhone?: string;
    guideEmail?: string;
  };
  destinationDetails?: {
    name: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
}

// Itinerary generated payload
export interface ItineraryGeneratedPayload {
  itineraryId: string;
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  duration: number;
  startDate?: string;
  destinations: string[];
  estimatedCost: number;
  highlights: string[];
  pdfUrl?: string; // Optional pre-generated PDF URL
}

// Guide assignment payload
export interface GuideAssignmentPayload {
  bookingId: string;
  touristId: string;
  touristName: string;
  touristEmail: string;
  touristPhone?: string;
  guideId: string;
  guideName: string;
  guideEmail: string;
  guidePhone?: string;
  tourDetails: {
    title: string;
    date: string;
    duration: string;
    meetingPoint?: string;
  };
}

// Payment received payload
export interface PaymentReceivedPayload {
  paymentId: string;
  bookingId: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  blockchainHash?: string;
  receiptUrl?: string;
}

// Reminder payload
export interface ReminderPayload {
  userId: string;
  userEmail: string;
  userName: string;
  reminderType: 'trip' | 'review';
  bookingId?: string;
  tripDetails?: {
    title: string;
    date: string;
    destination: string;
  };
  daysUntil?: number; // For trip reminder
  daysSince?: number; // For review reminder
}

// Emergency alert payload
export interface EmergencyAlertPayload {
  userId: string;
  userName: string;
  userPhone?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  alertType: 'sos' | 'medical' | 'lost' | 'other';
  message?: string;
  emergencyContacts?: {
    name: string;
    phone: string;
    email?: string;
  }[];
  timestamp: string;
}

class N8nService {
  private webhookBase: string;
  private apiBase: string;
  private isEnabled: boolean;

  constructor() {
    this.webhookBase = ServiceURLs.N8N_WEBHOOK;
    this.apiBase = ServiceURLs.N8N_API;
    this.isEnabled = ServiceFlags.USE_N8N;
  }

  /**
   * Check if n8n is configured
   */
  isConfigured(): boolean {
    return this.isEnabled;
  }

  /**
   * Trigger a workflow via webhook
   */
  private async triggerWorkflow<T>(
    workflowPath: string,
    payload: T,
    workflowName: string
  ): Promise<WorkflowTriggerResult> {
    if (!this.isEnabled) {
      console.log(`📧 [Mock] n8n workflow "${workflowName}" would be triggered with:`, payload);
      return {
        success: true,
        workflowId: workflowPath,
        executionId: `mock-${Date.now()}`,
        message: `Mock: ${workflowName} workflow logged (n8n not configured)`,
      };
    }

    try {
      const response = await serviceFetch(`${this.webhookBase}/${workflowPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          _meta: {
            source: 'YatriAI',
            timestamp: new Date().toISOString(),
            environment: import.meta.env.MODE,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`n8n workflow "${workflowName}" failed:`, errorText);
        return {
          success: false,
          error: `Workflow failed with status ${response.status}`,
        };
      }

      const result = await response.json();
      console.log(`✅ n8n workflow "${workflowName}" triggered successfully`);
      
      return {
        success: true,
        workflowId: workflowPath,
        executionId: result.executionId || result.id,
        message: result.message || 'Workflow triggered successfully',
      };
    } catch (error) {
      console.error(`n8n workflow "${workflowName}" error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Trigger user registration workflow
   * Sends welcome email and sets up user in external systems
   */
  async onUserRegistration(payload: UserRegistrationPayload): Promise<WorkflowTriggerResult> {
    return this.triggerWorkflow(
      N8nWorkflows.USER_REGISTRATION,
      payload,
      'User Registration'
    );
  }

  /**
   * Trigger booking confirmation workflow
   * Sends confirmation email, SMS, and calendar invite
   */
  async onBookingConfirmation(payload: BookingConfirmationPayload): Promise<WorkflowTriggerResult> {
    return this.triggerWorkflow(
      N8nWorkflows.BOOKING_CONFIRMATION,
      payload,
      'Booking Confirmation'
    );
  }

  /**
   * Trigger itinerary generated workflow
   * Generates PDF and sends via email
   */
  async onItineraryGenerated(payload: ItineraryGeneratedPayload): Promise<WorkflowTriggerResult> {
    return this.triggerWorkflow(
      N8nWorkflows.ITINERARY_GENERATED,
      payload,
      'Itinerary Generated'
    );
  }

  /**
   * Trigger guide assignment workflow
   * Notifies both guide and tourist
   */
  async onGuideAssigned(payload: GuideAssignmentPayload): Promise<WorkflowTriggerResult> {
    return this.triggerWorkflow(
      N8nWorkflows.GUIDE_ASSIGNED,
      payload,
      'Guide Assigned'
    );
  }

  /**
   * Trigger payment received workflow
   * Sends receipt and records on blockchain
   */
  async onPaymentReceived(payload: PaymentReceivedPayload): Promise<WorkflowTriggerResult> {
    return this.triggerWorkflow(
      N8nWorkflows.PAYMENT_RECEIVED,
      payload,
      'Payment Received'
    );
  }

  /**
   * Trigger review reminder workflow
   * Sends reminder to leave a review after trip
   */
  async sendReviewReminder(payload: ReminderPayload): Promise<WorkflowTriggerResult> {
    return this.triggerWorkflow(
      N8nWorkflows.REVIEW_REMINDER,
      { ...payload, reminderType: 'review' },
      'Review Reminder'
    );
  }

  /**
   * Trigger trip reminder workflow
   * Sends reminder before trip starts
   */
  async sendTripReminder(payload: ReminderPayload): Promise<WorkflowTriggerResult> {
    return this.triggerWorkflow(
      N8nWorkflows.TRIP_REMINDER,
      { ...payload, reminderType: 'trip' },
      'Trip Reminder'
    );
  }

  /**
   * Trigger emergency alert workflow
   * Sends urgent notifications to emergency contacts and authorities
   */
  async sendEmergencyAlert(payload: EmergencyAlertPayload): Promise<WorkflowTriggerResult> {
    console.warn('🚨 EMERGENCY ALERT TRIGGERED:', payload);
    return this.triggerWorkflow(
      N8nWorkflows.EMERGENCY_ALERT,
      payload,
      'Emergency Alert'
    );
  }

  /**
   * Trigger a custom workflow
   */
  async triggerCustomWorkflow<T>(
    workflowPath: string,
    payload: T
  ): Promise<WorkflowTriggerResult> {
    return this.triggerWorkflow(workflowPath, payload, `Custom: ${workflowPath}`);
  }

  /**
   * Get workflow execution status (requires n8n API access)
   */
  async getExecutionStatus(executionId: string): Promise<{
    status: 'running' | 'success' | 'error' | 'unknown';
    finishedAt?: string;
    error?: string;
  }> {
    if (!this.isEnabled) {
      return { status: 'unknown' };
    }

    try {
      const response = await serviceFetch(`${this.apiBase}/executions/${executionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { status: 'unknown' };
      }

      const data = await response.json();
      return {
        status: data.finished ? (data.stoppedAt ? 'error' : 'success') : 'running',
        finishedAt: data.stoppedAt,
        error: data.data?.error?.message,
      };
    } catch {
      return { status: 'unknown' };
    }
  }
}

export const n8nService = new N8nService();
export default n8nService;

