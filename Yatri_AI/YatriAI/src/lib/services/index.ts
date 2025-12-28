/**
 * External Services Index
 * 
 * Central export for all external service integrations.
 * 
 * Services use Beeceptor for mocking during development,
 * and can be switched to real APIs via environment variables.
 * 
 * Integrations:
 * - Axicov: AI agent deployment and orchestration
 * - n8n: Workflow automation and notifications
 * - ElevenLabs: Voice AI (voiceService)
 * - Dodo Payments: Payment processing (paymentService)
 * - ETHIndia: Blockchain verification (blockchainService)
 */

// Configuration
export * from './config';

// Axicov AI Agents
export { axicovService } from './axicov.service';
export type {
  AgentExecutionResult,
  TravelAssistantInput,
  TravelAssistantResponse,
  ItineraryPlannerInput,
  ItineraryPlannerResponse,
  RecommendationsInput,
  RecommendationsResponse,
  GuideMatcherInput,
  GuideMatcherResponse,
  CulturalExpertInput,
  CulturalExpertResponse,
} from './axicov.service';

// n8n Workflow Automation
export { n8nService } from './n8n.service';
export type {
  WorkflowTriggerResult,
  UserRegistrationPayload,
  BookingConfirmationPayload,
  ItineraryGeneratedPayload,
  GuideAssignmentPayload,
  PaymentReceivedPayload,
  ReminderPayload,
  EmergencyAlertPayload,
} from './n8n.service';

// Notification Service
export { notificationService } from './notification.service';
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  CreateNotificationParams,
  NotificationPreferences,
} from './notification.service';

// Analytics & Event Tracking
export { analyticsService } from './analytics.service';
export type {
  AnalyticsEvent,
  EventCategory,
  StandardEvent,
  UserTraits,
  Funnel,
  FunnelStep,
} from './analytics.service';

// Services
export { weatherService } from './weather.service';
export type { WeatherData, ForecastDay } from './weather.service';

export { aiService } from './ai.service';
export type { 
  ItineraryPreferences, 
  GeneratedItinerary, 
  DayPlan, 
  ChatMessage, 
  ChatResponse 
} from './ai.service';

export { paymentService } from './payment.service';
export type { 
  PaymentIntent, 
  CreatePaymentParams, 
  PaymentResult, 
  RefundResult,
  CartItem,
  TransactionDetails,
  PaymentWebhookEvent,
} from './payment.service';

export { blockchainService } from './blockchain.service';
export type { 
  BlockchainRecord, 
  VerificationResult, 
  BookingOnChain, 
  CertificateOnChain,
  WalletState,
  TransactionRequest,
} from './blockchain.service';

export { voiceService, AVAILABLE_VOICES } from './voice.service';
export type { 
  VoiceConfig, 
  SpeechResult, 
  VoiceSettings,
  AudioGuideContent,
  AudioGuideSection 
} from './voice.service';

export { indianRailApiService } from './indianRailApi.service';
export type {
  TrainInfo,
  TrainBetweenStationsResponse,
  TrainOnDateResponse,
  TrainRouteResponse,
} from './indianRailApi.service';


// Service status helper
import { 
  getServiceStatus, 
  isUsingMocks, 
  isAxicovConfigured, 
  isN8nConfigured, 
  isElevenLabsConfigured, 
  isDodoPaymentsConfigured, 
  isBlockchainConfigured, 
  isMetaMaskAvailable, 
  DodoPaymentsConfig, 
  ActiveNetwork, 
  ServiceFlags 
} from './config';
import { axicovService } from './axicov.service';
import { n8nService } from './n8n.service';
import { analyticsService } from './analytics.service';
import { voiceService } from './voice.service';
import { paymentService } from './payment.service';
import { blockchainService } from './blockchain.service';
export { getServiceStatus, isUsingMocks, isAxicovConfigured, isN8nConfigured, isElevenLabsConfigured, isDodoPaymentsConfigured, isBlockchainConfigured, isMetaMaskAvailable };

/**
 * Initialize all services (call once on app startup)
 */
export const initializeServices = async (): Promise<{
  status: ReturnType<typeof getServiceStatus>;
  usingMocks: boolean;
  usingAxicov: boolean;
  usingN8n: boolean;
  usingElevenLabs: boolean;
  usingDodoPayments: boolean;
  usingBlockchain: boolean;
  analyticsEnabled: boolean;
}> => {
  const status = getServiceStatus();
  const usingMocks = isUsingMocks();
  const usingAxicov = isAxicovConfigured();
  const usingN8n = isN8nConfigured();
  const usingElevenLabs = isElevenLabsConfigured();
  const usingDodoPayments = isDodoPaymentsConfigured();
  const usingBlockchain = isBlockchainConfigured();
  const analyticsEnabled = ServiceFlags.ENABLE_ANALYTICS;

  // Log Axicov status
  if (usingAxicov) {
    console.log(
      '%c🤖 YatriAI AI Agents: Powered by Axicov',
      'color: #8b5cf6; font-weight: bold;'
    );
    const agentStatus = axicovService.getAgentStatus();
    console.log('Axicov Agents:', agentStatus);
  }

  // Log n8n status
  if (usingN8n) {
    console.log(
      '%c⚡ YatriAI Workflows: Powered by n8n',
      'color: #ff6d5a; font-weight: bold;'
    );
    console.log('n8n configured:', n8nService.isConfigured());
  }

  // Log ElevenLabs status
  if (usingElevenLabs) {
    console.log(
      '%c🎙️ YatriAI Voice: Powered by ElevenLabs',
      'color: #10b981; font-weight: bold;'
    );
    const usageStats = voiceService.getUsageStats();
    console.log('ElevenLabs Usage:', `${usageStats.charactersUsed}/${usageStats.charactersRemaining + usageStats.charactersUsed} characters used this month`);
  } else {
    console.log(
      '%c🔊 YatriAI Voice: Using browser TTS (add VITE_ELEVENLABS_API_KEY for premium voices)',
      'color: #f59e0b; font-weight: bold;'
    );
  }

  // Log Dodo Payments status
  if (usingDodoPayments) {
    const mode = DodoPaymentsConfig.IS_SANDBOX ? 'Sandbox' : 'Live';
    console.log(
      `%c💳 YatriAI Payments: Dodo Payments (${mode})`,
      'color: #22c55e; font-weight: bold;'
    );
    console.log('Dodo Payments config:', paymentService.getConfig());
  } else {
    console.log(
      '%c💳 YatriAI Payments: Mock mode (add VITE_DODO_PUBLIC_KEY for real payments)',
      'color: #f59e0b; font-weight: bold;'
    );
  }

  // Log Blockchain/ETHIndia status
  if (usingBlockchain) {
    console.log(
      `%c⛓️ YatriAI Blockchain: ${ActiveNetwork.name} - ETHIndia`,
      'color: #f97316; font-weight: bold;'
    );
    console.log(`Network: ${ActiveNetwork.name} (Chain ID: ${ActiveNetwork.chainId})`);
    console.log(`Explorer: ${ActiveNetwork.explorerUrl}`);
    console.log(`Faucet: ${ActiveNetwork.faucetUrl}`);
  } else if (isMetaMaskAvailable()) {
    console.log(
      '%c🦊 MetaMask detected! Set VITE_USE_REAL_BLOCKCHAIN=true to enable blockchain features',
      'color: #f59e0b; font-weight: bold;'
    );
  } else {
    console.log(
      '%c⛓️ YatriAI Blockchain: Simulation mode (install MetaMask for real transactions)',
      'color: #6b7280; font-weight: bold;'
    );
  }

  // Log analytics status
  if (analyticsEnabled) {
    console.log(
      '%c📊 YatriAI Analytics: Enabled',
      'color: #3b82f6; font-weight: bold;'
    );
    console.log('Analytics consent:', analyticsService.hasConsent() ? 'given' : 'pending');
  }

  if (usingMocks) {
    console.log(
      '%c🐝 YatriAI Services: Using Beeceptor mocks',
      'color: #f59e0b; font-weight: bold;'
    );
    console.log('Service Status:', status);
  } else if (!usingAxicov && !usingN8n && !usingDodoPayments && !usingBlockchain) {
    console.log(
      '%c🚀 YatriAI Services: Connected to live APIs',
      'color: #10b981; font-weight: bold;'
    );
  }

  // Log setup hints
  console.log('%c📋 Service Configuration:', 'color: #6b7280; font-weight: bold;', status);

  return { status, usingMocks, usingAxicov, usingN8n, usingElevenLabs, usingDodoPayments, usingBlockchain, analyticsEnabled };
};
