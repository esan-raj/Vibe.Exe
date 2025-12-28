/**
 * External Services Configuration
 * 
 * This file configures external API endpoints for YatriAI.
 * Uses Beeceptor for mocking during development.
 * 
 * To switch between Beeceptor and real services, update .env files:
 * - Development with mocks: Use Beeceptor URLs
 * - Production: Use real service URLs
 * 
 * Integrations prepared:
 * - Axicov: AI agent deployment and orchestration
 * - ElevenLabs: Voice AI for chat responses and audio guides
 * - Dodo Payments: Payment processing for marketplace/bookings
 * - ETHIndia: Blockchain verification on Ethereum testnets
 * - n8n: Workflow automation (can orchestrate these services)
 */

// Beeceptor base URL - Create your mock at beeceptor.com
// Example: https://yatriai.free.beeceptor.com
const BEECEPTOR_BASE = import.meta.env.VITE_BEECEPTOR_URL || 'https://yatriai.free.beeceptor.com';

// Axicov base URL - Deployed agents at axicov.com
// Your deployed agents will have URLs like: https://api.axicov.com/v1/agents/{agent-id}/run
const AXICOV_BASE = import.meta.env.VITE_AXICOV_URL || 'https://api.axicov.com/v1';

// n8n base URL - Self-hosted or cloud instance
// Local: http://localhost:5678 | Cloud: https://your-instance.app.n8n.cloud
const N8N_BASE = import.meta.env.VITE_N8N_URL || 'http://localhost:5678';

// Feature flags to enable/disable external services
export const ServiceFlags = {
  USE_MOCK_WEATHER: import.meta.env.VITE_USE_MOCK_WEATHER !== 'false',
  USE_MOCK_AI: import.meta.env.VITE_USE_MOCK_AI !== 'false',
  USE_MOCK_PAYMENT: import.meta.env.VITE_USE_MOCK_PAYMENT !== 'false',
  USE_MOCK_BLOCKCHAIN: import.meta.env.VITE_USE_MOCK_BLOCKCHAIN !== 'false',
  USE_MOCK_VOICE: import.meta.env.VITE_USE_MOCK_VOICE !== 'false',
  USE_MOCK_NOTIFICATIONS: import.meta.env.VITE_USE_MOCK_NOTIFICATIONS !== 'false',
  // Axicov - Set to true to use Axicov agents instead of direct AI API
  USE_AXICOV: import.meta.env.VITE_USE_AXICOV === 'true',
  // n8n - Set to true to use n8n for workflow automation
  USE_N8N: import.meta.env.VITE_USE_N8N === 'true',
  // Analytics - Set to true to enable event tracking
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

// Service URLs - Will be replaced with real service URLs when integrating
export const ServiceURLs = {
  // Weather API (for destination weather info)
  WEATHER_API: import.meta.env.VITE_WEATHER_API_URL || `${BEECEPTOR_BASE}/api/weather`,
  
  // AI/LLM API (for itinerary generation, chat responses)
  // Will be replaced with real LLM API or n8n workflow endpoint
  AI_API: import.meta.env.VITE_AI_API_URL || `${BEECEPTOR_BASE}/api/ai`,
  
  // Voice API (prepared for ElevenLabs integration)
  // ElevenLabs: https://api.elevenlabs.io/v1
  VOICE_API: import.meta.env.VITE_VOICE_API_URL || `${BEECEPTOR_BASE}/api/voice`,
  
  // Payment API (prepared for Dodo Payments integration)
  // Dodo Payments sandbox: https://sandbox.dodopayments.com/api
  PAYMENT_API: import.meta.env.VITE_PAYMENT_API_URL || `${BEECEPTOR_BASE}/api/payments`,
  
  // Blockchain API (prepared for ETHIndia/Ethereum integration)
  // Will connect to Sepolia/Holesky testnet via custom API or direct web3
  BLOCKCHAIN_API: import.meta.env.VITE_BLOCKCHAIN_API_URL || `${BEECEPTOR_BASE}/api/blockchain`,
  
  
  // Notification webhooks (for n8n integration)
  WEBHOOK_URL: import.meta.env.VITE_WEBHOOK_URL || `${BEECEPTOR_BASE}/webhooks`,
  
  // Axicov API (for AI agent deployment)
  // Agents are deployed as APIs at axicov.com
  AXICOV_API: AXICOV_BASE,
  
  // n8n API (for workflow automation)
  // Self-hosted: http://localhost:5678/webhook/
  // Cloud: https://your-instance.app.n8n.cloud/webhook/
  N8N_WEBHOOK: import.meta.env.VITE_N8N_WEBHOOK_URL || `${N8N_BASE}/webhook`,
  N8N_API: import.meta.env.VITE_N8N_API_URL || `${N8N_BASE}/api/v1`,
  
  // Analytics API (for event tracking)
  ANALYTICS_API: import.meta.env.VITE_ANALYTICS_API_URL || `${BEECEPTOR_BASE}/api/analytics`,
};

// API Keys (loaded from environment)
export const ServiceKeys = {
  // ElevenLabs API key (10k chars free/month)
  // Get your key at: https://elevenlabs.io/
  ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
  
  // Dodo Payments keys (sandbox mode - free, no credit card required)
  // Get your keys at: https://dashboard.dodopayments.com
  DODO_PUBLIC_KEY: import.meta.env.VITE_DODO_PUBLIC_KEY || '',
  DODO_SECRET_KEY: import.meta.env.VITE_DODO_SECRET_KEY || '',
  
  // Note: Razorpay and Stripe services are available but not used by default
  // Dodo Payments is the primary payment gateway for YatriAI
  
  // Weather API key (if using a real weather service)
  WEATHER_API_KEY: import.meta.env.VITE_WEATHER_API_KEY || '',
  
  // Axicov API key (free tier with Ethereum wallet login)
  // Get your key at axicov.com after signing in with MetaMask
  AXICOV_API_KEY: import.meta.env.VITE_AXICOV_API_KEY || '',
};

// ============================================
// Dodo Payments Configuration
// ============================================

// Dodo Payments API URLs
export const DodoPaymentsConfig = {
  // API Endpoints
  API_URL: import.meta.env.VITE_DODO_API_URL || 'https://sandbox.dodopayments.com/api',
  CHECKOUT_URL: import.meta.env.VITE_DODO_CHECKOUT_URL || 'https://sandbox.dodopayments.com/checkout',
  
  // Sandbox mode (use sandbox for testing, production for live)
  IS_SANDBOX: import.meta.env.VITE_DODO_SANDBOX !== 'false',
  
  // Supported currencies
  SUPPORTED_CURRENCIES: ['INR', 'USD', 'EUR', 'GBP'] as const,
  
  // Default currency for YatriAI
  DEFAULT_CURRENCY: 'INR',
  
  // Platform fee percentage (for marketplace transactions)
  PLATFORM_FEE_PERCENT: parseFloat(import.meta.env.VITE_DODO_PLATFORM_FEE || '5'),
  
  // Payment methods enabled
  PAYMENT_METHODS: {
    UPI: true,
    CARDS: true,
    NET_BANKING: true,
    WALLETS: true,
  },
  
  // Webhook URL for payment notifications
  WEBHOOK_URL: import.meta.env.VITE_DODO_WEBHOOK_URL || '',
  
  // Return URLs
  SUCCESS_URL: import.meta.env.VITE_DODO_SUCCESS_URL || '/payment/success',
  CANCEL_URL: import.meta.env.VITE_DODO_CANCEL_URL || '/payment/cancelled',
  
  // Split payment settings (for seller payouts)
  SPLIT_PAYMENTS_ENABLED: import.meta.env.VITE_DODO_SPLIT_PAYMENTS === 'true',
};

// Helper to check if Dodo Payments is configured
export const isDodoPaymentsConfigured = () => {
  return ServiceKeys.DODO_PUBLIC_KEY !== '' && !ServiceFlags.USE_MOCK_PAYMENT;
};

// Note: Razorpay and Stripe helpers removed - using Dodo Payments as primary gateway

// Payment Gateway Configuration
export const PaymentGatewayConfig = {
  // Default gateway (Dodo Payments)
  DEFAULT_GATEWAY: import.meta.env.VITE_DEFAULT_PAYMENT_GATEWAY || 'dodo', // 'dodo' | 'crypto'
  
  // Gateway priority order (Dodo Payments first, then Crypto)
  GATEWAY_PRIORITY: ['dodo', 'crypto'] as const,
};

// ElevenLabs Configuration
export const ElevenLabsConfig = {
  // API endpoint
  API_URL: 'https://api.elevenlabs.io/v1',
  
  // Model to use (eleven_monolingual_v1, eleven_multilingual_v1, eleven_multilingual_v2)
  MODEL_ID: import.meta.env.VITE_ELEVENLABS_MODEL || 'eleven_multilingual_v2',
  
  // Monthly character limit (free tier: 10,000)
  MONTHLY_LIMIT: parseInt(import.meta.env.VITE_ELEVENLABS_LIMIT || '10000', 10),
  
  // Default voice settings
  DEFAULT_STABILITY: 0.5,
  DEFAULT_SIMILARITY: 0.75,
  DEFAULT_STYLE: 0.5,
  
  // Preferred voices for different use cases
  VOICES: {
    // Chat responses - friendly and conversational
    CHAT_ENGLISH: import.meta.env.VITE_ELEVENLABS_VOICE_CHAT_EN || 'pNInz6obpgDQGcFmaJgB', // Adam
    CHAT_HINDI: import.meta.env.VITE_ELEVENLABS_VOICE_CHAT_HI || 'pNInz6obpgDQGcFmaJgB',
    
    // Audio guides - clear and informative
    GUIDE_ENGLISH: import.meta.env.VITE_ELEVENLABS_VOICE_GUIDE_EN || 'AZnzlk1XvdvUeBnXmlld', // Domi (Indian accent)
    GUIDE_HINDI: import.meta.env.VITE_ELEVENLABS_VOICE_GUIDE_HI || 'AZnzlk1XvdvUeBnXmlld',
    
    // Emergency/alerts - serious and urgent
    ALERT: import.meta.env.VITE_ELEVENLABS_VOICE_ALERT || '21m00Tcm4TlvDq8ikWAM', // Rachel
  },
  
  // Audio output format
  OUTPUT_FORMAT: 'mp3_44100_128', // Options: mp3_44100_128, mp3_44100_64, pcm_16000
};

// Helper to check if ElevenLabs is configured
export const isElevenLabsConfigured = () => {
  return ServiceKeys.ELEVENLABS_API_KEY !== '' && !ServiceFlags.USE_MOCK_VOICE;
};

// ============================================
// ETHIndia / Ethereum Blockchain Configuration
// ============================================

// Ethereum Networks Configuration
export const EthereumNetworks = {
  // Sepolia Testnet (recommended for testing)
  sepolia: {
    chainId: 11155111,
    chainIdHex: '0xaa36a7',
    name: 'Sepolia Testnet',
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    faucetUrl: 'https://sepoliafaucet.com',
    symbol: 'ETH',
    decimals: 18,
  },
  // Holesky Testnet (alternative testnet)
  holesky: {
    chainId: 17000,
    chainIdHex: '0x4268',
    name: 'Holesky Testnet',
    rpcUrl: import.meta.env.VITE_HOLESKY_RPC_URL || 'https://ethereum-holesky.publicnode.com',
    explorerUrl: 'https://holesky.etherscan.io',
    faucetUrl: 'https://holesky-faucet.pk910.de',
    symbol: 'ETH',
    decimals: 18,
  },
  // Polygon Mumbai (alternative L2 testnet)
  mumbai: {
    chainId: 80001,
    chainIdHex: '0x13881',
    name: 'Polygon Mumbai',
    rpcUrl: import.meta.env.VITE_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://mumbai.polygonscan.com',
    faucetUrl: 'https://faucet.polygon.technology',
    symbol: 'MATIC',
    decimals: 18,
  },
};

// Active network selection
export const ActiveEthNetwork = import.meta.env.VITE_ETH_NETWORK || 'sepolia';
export const ActiveNetwork = EthereumNetworks[ActiveEthNetwork as keyof typeof EthereumNetworks] || EthereumNetworks.sepolia;

// Smart Contract Addresses (deploy your own contracts for production)
export const ContractAddresses = {
  // YatriAI Booking Verification Contract
  BOOKING_VERIFICATION: import.meta.env.VITE_CONTRACT_BOOKING || '',
  
  // Guide Certification NFT Contract
  GUIDE_CERTIFICATE_NFT: import.meta.env.VITE_CONTRACT_GUIDE_NFT || '',
  
  // Heritage NFT Contract (for heritage location badges)
  HERITAGE_NFT: import.meta.env.VITE_CONTRACT_HERITAGE_NFT || '',
  
  // Product Authenticity NFT Contract
  PRODUCT_AUTHENTICITY: import.meta.env.VITE_CONTRACT_PRODUCT_NFT || '',
  
  // Escrow Contract for Payments (Marketplace)
  PAYMENT_ESCROW: import.meta.env.VITE_CONTRACT_ESCROW || '',
  
  // Donation Contract (Pandal Donations)
  DONATION: import.meta.env.VITE_CONTRACT_DONATION || '',
  
  // Booking Escrow Contract (uses BOOKING_VERIFICATION address)
  // Note: BOOKING_VERIFICATION can be used for both verification and escrow
};

// Blockchain Configuration
export const BlockchainConfig = {
  // Whether to use real blockchain (requires wallet & contracts)
  USE_REAL_BLOCKCHAIN: import.meta.env.VITE_USE_REAL_BLOCKCHAIN === 'true',
  
  // Gas settings (for testnet, can use higher values)
  DEFAULT_GAS_LIMIT: 200000,
  GAS_PRICE_GWEI: 20,
  
  // Confirmation settings
  CONFIRMATIONS_REQUIRED: 2,
  POLLING_INTERVAL: 4000, // ms
  
  // Wallet connection
  AUTO_CONNECT_WALLET: import.meta.env.VITE_AUTO_CONNECT_WALLET === 'true',
  
  // Supported wallet types
  SUPPORTED_WALLETS: ['metamask', 'walletconnect', 'coinbase'],
};

// Helper to check if blockchain is properly configured
export const isBlockchainConfigured = () => {
  return (
    BlockchainConfig.USE_REAL_BLOCKCHAIN &&
    !ServiceFlags.USE_MOCK_BLOCKCHAIN &&
    (ContractAddresses.BOOKING_VERIFICATION !== '' || 
     typeof window !== 'undefined' && (window as any).ethereum)
  );
};

// Helper to check if MetaMask is available
export const isMetaMaskAvailable = () => {
  return typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask;
};

// Helper to get network by chainId
export const getNetworkByChainId = (chainId: number) => {
  return Object.values(EthereumNetworks).find(n => n.chainId === chainId);
};

// Axicov Agent IDs - Set these after deploying your agents
export const AxicovAgents = {
  // Travel Assistant Agent - Handles general chat about Jharkhand tourism
  TRAVEL_ASSISTANT: import.meta.env.VITE_AXICOV_AGENT_TRAVEL_ASSISTANT || '',
  
  // Itinerary Planner Agent - Generates personalized travel itineraries
  ITINERARY_PLANNER: import.meta.env.VITE_AXICOV_AGENT_ITINERARY_PLANNER || '',
  
  // Recommendations Agent - Provides destination and activity recommendations
  RECOMMENDATIONS: import.meta.env.VITE_AXICOV_AGENT_RECOMMENDATIONS || '',
  
  // Guide Matcher Agent - Matches tourists with appropriate local guides
  GUIDE_MATCHER: import.meta.env.VITE_AXICOV_AGENT_GUIDE_MATCHER || '',
  
  // Cultural Expert Agent - Provides insights on tribal culture and heritage
  CULTURAL_EXPERT: import.meta.env.VITE_AXICOV_AGENT_CULTURAL_EXPERT || '',
};

// n8n Workflow Webhook Paths - Set these after creating workflows
export const N8nWorkflows = {
  // User registration workflow - sends welcome email
  USER_REGISTRATION: import.meta.env.VITE_N8N_WORKFLOW_USER_REGISTRATION || 'user-registration',
  
  // Booking confirmation workflow - sends confirmation email + SMS
  BOOKING_CONFIRMATION: import.meta.env.VITE_N8N_WORKFLOW_BOOKING_CONFIRMATION || 'booking-confirmation',
  
  // Itinerary generated workflow - sends itinerary PDF via email
  ITINERARY_GENERATED: import.meta.env.VITE_N8N_WORKFLOW_ITINERARY_GENERATED || 'itinerary-generated',
  
  // Guide assignment workflow - notifies guide and tourist
  GUIDE_ASSIGNED: import.meta.env.VITE_N8N_WORKFLOW_GUIDE_ASSIGNED || 'guide-assigned',
  
  // Payment received workflow - sends receipt and updates blockchain
  PAYMENT_RECEIVED: import.meta.env.VITE_N8N_WORKFLOW_PAYMENT_RECEIVED || 'payment-received',
  
  // Review reminder workflow - sends reminder after trip ends
  REVIEW_REMINDER: import.meta.env.VITE_N8N_WORKFLOW_REVIEW_REMINDER || 'review-reminder',
  
  // Trip reminder workflow - sends reminder before trip starts
  TRIP_REMINDER: import.meta.env.VITE_N8N_WORKFLOW_TRIP_REMINDER || 'trip-reminder',
  
  // Emergency alert workflow - notifies emergency contacts
  EMERGENCY_ALERT: import.meta.env.VITE_N8N_WORKFLOW_EMERGENCY_ALERT || 'emergency-alert',
};

// Notification channels configuration
export const NotificationChannels = {
  EMAIL_ENABLED: import.meta.env.VITE_EMAIL_NOTIFICATIONS !== 'false',
  SMS_ENABLED: import.meta.env.VITE_SMS_NOTIFICATIONS === 'true',
  PUSH_ENABLED: import.meta.env.VITE_PUSH_NOTIFICATIONS === 'true',
  IN_APP_ENABLED: true, // Always enabled
};

// Helper to check if using mocks
export const isUsingMocks = () => {
  const mockFlags = { ...ServiceFlags };
  // Exclude USE_AXICOV from mock check as it's not a mock flag
  delete (mockFlags as Record<string, boolean>).USE_AXICOV;
  return Object.values(mockFlags).some(flag => flag === true);
};

// Helper to check if Axicov is configured
export const isAxicovConfigured = () => {
  return ServiceFlags.USE_AXICOV && 
         ServiceKeys.AXICOV_API_KEY !== '' && 
         Object.values(AxicovAgents).some(id => id !== '');
};

// Helper to check if n8n is configured
export const isN8nConfigured = () => {
  return ServiceFlags.USE_N8N && import.meta.env.VITE_N8N_URL !== undefined;
};

// Helper to get service status
export const getServiceStatus = () => {
  const aiStatus = ServiceFlags.USE_AXICOV 
    ? (isAxicovConfigured() ? 'axicov' : 'axicov-unconfigured')
    : (ServiceFlags.USE_MOCK_AI ? 'mock' : 'live');
  
  const voiceStatus = isElevenLabsConfigured() 
    ? 'elevenlabs' 
    : (ServiceFlags.USE_MOCK_VOICE ? 'mock' : 'browser-tts');
  
  const paymentStatus = isDodoPaymentsConfigured()
    ? (DodoPaymentsConfig.IS_SANDBOX ? 'dodo-sandbox' : 'dodo-live')
    : (ServiceFlags.USE_MOCK_PAYMENT ? 'mock' : 'api');
  
  const blockchainStatus = isBlockchainConfigured()
    ? `ethereum-${ActiveEthNetwork}`
    : (ServiceFlags.USE_MOCK_BLOCKCHAIN ? 'mock' : 'simulated');
    
  return {
    weather: ServiceFlags.USE_MOCK_WEATHER ? 'mock' : 'live',
    ai: aiStatus,
    payment: paymentStatus,
    blockchain: blockchainStatus,
    voice: voiceStatus,
    notifications: ServiceFlags.USE_MOCK_NOTIFICATIONS ? 'mock' : 'live',
    axicov: isAxicovConfigured() ? 'configured' : 'not-configured',
    n8n: isN8nConfigured() ? 'configured' : 'not-configured',
    elevenlabs: isElevenLabsConfigured() ? 'configured' : 'not-configured',
    dodoPayments: isDodoPaymentsConfigured() ? 'configured' : 'not-configured',
    ethereum: isBlockchainConfigured() ? `${ActiveEthNetwork}-connected` : 'not-configured',
    analytics: ServiceFlags.ENABLE_ANALYTICS ? 'enabled' : 'disabled',
  };
};
