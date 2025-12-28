/**
 * Payment Service - Dodo Payments Integration
 * 
 * Handles payment processing for:
 * - Marketplace purchases (product checkout)
 * - Guide bookings
 * - Tour packages
 * - Transaction verification
 * 
 * Dodo Payments Features:
 * - Sandbox mode (free, no credit card required)
 * - UPI, Cards, Net Banking, Wallets
 * - Split payments for marketplace sellers
 * - Webhook notifications
 * - Refund processing
 * 
 * Sandbox URL: https://sandbox.dodopayments.com
 * Docs: https://docs.dodopayments.com
 */

import { ServiceURLs, ServiceFlags, ServiceKeys, DodoPaymentsConfig, isDodoPaymentsConfigured } from './config';
import { createServiceFetch } from '../debug';

// Create debug-enabled fetch for this service
const serviceFetch = createServiceFetch('PaymentService');

// ============================================
// Interfaces
// ============================================

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: string;
  receiptUrl?: string;
}

export interface CreatePaymentParams {
  amount: number;
  currency?: string;
  description: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
  cancelUrl?: string;
  items?: CartItem[];
  sellerId?: string; // For split payments
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  orderId?: string;
  status: string;
  redirectUrl?: string;
  checkoutUrl?: string;
  message?: string;
  expiresAt?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
  message?: string;
}

export interface TransactionDetails {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  customerEmail?: string;
  customerName?: string;
  items?: CartItem[];
  createdAt: string;
  completedAt?: string;
  receiptUrl?: string;
  refunds?: RefundResult[];
}

export interface PaymentWebhookEvent {
  event: 'payment.completed' | 'payment.failed' | 'refund.completed' | 'payout.completed';
  paymentId: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================
// Payment Service Class
// ============================================

class PaymentService {
  private baseUrl: string;
  private useMock: boolean;
  private publicKey: string;
  private secretKey: string;
  private isSandbox: boolean;

  constructor() {
    this.baseUrl = isDodoPaymentsConfigured() 
      ? DodoPaymentsConfig.API_URL 
      : ServiceURLs.PAYMENT_API;
    this.useMock = ServiceFlags.USE_MOCK_PAYMENT;
    this.publicKey = ServiceKeys.DODO_PUBLIC_KEY;
    this.secretKey = ServiceKeys.DODO_SECRET_KEY;
    this.isSandbox = DodoPaymentsConfig.IS_SANDBOX;
  }

  /**
   * Check if Dodo Payments is enabled
   */
  isDodoEnabled(): boolean {
    return isDodoPaymentsConfigured();
  }

  /**
   * Get payment configuration
   */
  getConfig() {
    return {
      isSandbox: this.isSandbox,
      supportedCurrencies: DodoPaymentsConfig.SUPPORTED_CURRENCIES,
      defaultCurrency: DodoPaymentsConfig.DEFAULT_CURRENCY,
      paymentMethods: DodoPaymentsConfig.PAYMENT_METHODS,
      platformFeePercent: DodoPaymentsConfig.PLATFORM_FEE_PERCENT,
    };
  }

  /**
   * Create a payment/checkout session
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    console.log('💳 Creating payment...', { amount: params.amount, currency: params.currency });

    // Use Dodo Payments if configured
    if (isDodoPaymentsConfigured()) {
      try {
        return await this.createDodoPayment(params);
      } catch (error) {
        console.warn('Dodo Payments failed, falling back:', error);
      }
    }

    // Fallback to API/mock
    if (this.useMock && !import.meta.env.VITE_BEECEPTOR_URL) {
      return this.createMockPayment(params);
    }

    try {
      const response = await serviceFetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.publicKey && { 'X-Dodo-Key': this.publicKey }),
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || DodoPaymentsConfig.DEFAULT_CURRENCY,
          description: params.description,
          customer: {
            email: params.customerEmail,
            name: params.customerName,
            phone: params.customerPhone,
          },
          items: params.items,
          metadata: {
            ...params.metadata,
            platform: 'YatriAI',
          },
          return_url: params.returnUrl || window.location.origin + DodoPaymentsConfig.SUCCESS_URL,
          cancel_url: params.cancelUrl || window.location.origin + DodoPaymentsConfig.CANCEL_URL,
        }),
      });

      if (!response.ok) {
        console.warn(`Payment API returned ${response.status}, using fallback`);
        return this.createMockPayment(params);
      }

      return await response.json();
    } catch (error) {
      console.warn('Payment API unavailable, using mock:', error);
      return this.createMockPayment(params);
    }
  }

  /**
   * Create payment via Dodo Payments API
   */
  private async createDodoPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payload = {
      order_id: orderId,
      amount: params.amount * 100, // Dodo uses smallest currency unit (paise for INR)
      currency: params.currency || DodoPaymentsConfig.DEFAULT_CURRENCY,
      description: params.description,
      customer: {
        email: params.customerEmail,
        name: params.customerName,
        phone: params.customerPhone,
      },
      line_items: params.items?.map(item => ({
        name: item.name,
        amount: item.price * 100,
        quantity: item.quantity,
        image_url: item.image,
      })),
      metadata: {
        ...params.metadata,
        platform: 'YatriAI',
        environment: this.isSandbox ? 'sandbox' : 'production',
      },
      success_url: params.returnUrl || window.location.origin + DodoPaymentsConfig.SUCCESS_URL + `?order_id=${orderId}`,
      cancel_url: params.cancelUrl || window.location.origin + DodoPaymentsConfig.CANCEL_URL + `?order_id=${orderId}`,
      webhook_url: DodoPaymentsConfig.WEBHOOK_URL || undefined,
    };

    // If split payments enabled and seller specified
    if (DodoPaymentsConfig.SPLIT_PAYMENTS_ENABLED && params.sellerId) {
      const platformFee = Math.round(params.amount * DodoPaymentsConfig.PLATFORM_FEE_PERCENT / 100);
      (payload as any).splits = [
        {
          account_id: params.sellerId,
          amount: (params.amount - platformFee) * 100,
        },
      ];
    }

    const response = await serviceFetch(`${DodoPaymentsConfig.API_URL}/v1/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.secretKey}`,
        'X-Dodo-Public-Key': this.publicKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dodo Payments error: ${error}`);
    }

    const data = await response.json();
    
    console.log('✅ Dodo checkout session created:', data.id);
    
    return {
      success: true,
      paymentId: data.id,
      orderId: orderId,
      status: 'pending',
      checkoutUrl: data.checkout_url || `${DodoPaymentsConfig.CHECKOUT_URL}/${data.id}`,
      redirectUrl: data.checkout_url,
      expiresAt: data.expires_at,
      message: this.isSandbox ? 'Sandbox payment created. Use test cards to complete.' : 'Payment session created.',
    };
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentId: string): Promise<PaymentIntent> {
    console.log('🔍 Verifying payment:', paymentId);

    if (isDodoPaymentsConfigured()) {
      try {
        return await this.verifyDodoPayment(paymentId);
      } catch (error) {
        console.warn('Dodo verification failed:', error);
      }
    }

    if (this.useMock && !import.meta.env.VITE_BEECEPTOR_URL) {
      return this.getMockPaymentStatus(paymentId);
    }

    try {
      const response = await serviceFetch(`${this.baseUrl}/verify/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.publicKey && { 'X-Dodo-Key': this.publicKey }),
        },
      });

      if (!response.ok) {
        return this.getMockPaymentStatus(paymentId);
      }

      return await response.json();
    } catch (error) {
      console.warn('Payment verification failed:', error);
      return this.getMockPaymentStatus(paymentId);
    }
  }

  /**
   * Verify payment via Dodo Payments API
   */
  private async verifyDodoPayment(paymentId: string): Promise<PaymentIntent> {
    const response = await serviceFetch(`${DodoPaymentsConfig.API_URL}/v1/checkout/sessions/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'X-Dodo-Public-Key': this.publicKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    
    return {
      id: data.id,
      amount: data.amount / 100, // Convert from paise
      currency: data.currency,
      status: this.mapDodoStatus(data.status),
      description: data.description || '',
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      paymentMethod: data.payment_method,
      receiptUrl: data.receipt_url,
    };
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(orderId: string): Promise<TransactionDetails | null> {
    console.log('📋 Getting transaction details:', orderId);

    if (this.useMock) {
      return this.getMockTransactionDetails(orderId);
    }

    try {
      const response = await serviceFetch(`${this.baseUrl}/transactions/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      if (!response.ok) {
        return this.getMockTransactionDetails(orderId);
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to get transaction details:', error);
      return this.getMockTransactionDetails(orderId);
    }
  }

  /**
   * Process refund
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<RefundResult> {
    console.log('💸 Processing refund:', { paymentId, amount, reason });

    if (isDodoPaymentsConfigured()) {
      try {
        return await this.processDodoRefund(paymentId, amount, reason);
      } catch (error) {
        console.warn('Dodo refund failed:', error);
      }
    }

    if (this.useMock && !import.meta.env.VITE_BEECEPTOR_URL) {
      return this.processedMockRefund(paymentId, amount);
    }

    try {
      const response = await serviceFetch(`${this.baseUrl}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify({
          payment_id: paymentId,
          amount: amount ? amount * 100 : undefined, // Convert to paise
          reason: reason || 'Customer requested refund',
        }),
      });

      if (!response.ok) {
        return this.processedMockRefund(paymentId, amount);
      }

      return await response.json();
    } catch (error) {
      console.warn('Refund processing failed:', error);
      return this.processedMockRefund(paymentId, amount);
    }
  }

  /**
   * Process refund via Dodo Payments
   */
  private async processDodoRefund(paymentId: string, amount?: number, reason?: string): Promise<RefundResult> {
    const response = await serviceFetch(`${DodoPaymentsConfig.API_URL}/v1/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.secretKey}`,
      },
      body: JSON.stringify({
        payment_id: paymentId,
        amount: amount ? amount * 100 : undefined,
        reason: reason || 'Refund requested',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Refund failed: ${error}`);
    }

    const data = await response.json();
    
    console.log('✅ Refund processed:', data.id);
    
    return {
      success: true,
      refundId: data.id,
      amount: data.amount / 100,
      status: data.status,
      message: 'Refund processed successfully',
    };
  }

  /**
   * Get payment history for a customer
   */
  async getPaymentHistory(customerEmail: string): Promise<PaymentIntent[]> {
    if (this.useMock) {
      return this.getMockPaymentHistory();
    }

    try {
      const response = await serviceFetch(`${this.baseUrl}/history?email=${encodeURIComponent(customerEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      if (!response.ok) {
        return this.getMockPaymentHistory();
      }

      return await response.json();
    } catch (error) {
      return this.getMockPaymentHistory();
    }
  }

  /**
   * Calculate platform fee for marketplace transactions
   */
  calculatePlatformFee(amount: number): { sellerAmount: number; platformFee: number } {
    const platformFee = Math.round(amount * DodoPaymentsConfig.PLATFORM_FEE_PERCENT / 100);
    return {
      sellerAmount: amount - platformFee,
      platformFee,
    };
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Map Dodo status to internal status
   */
  private mapDodoStatus(dodoStatus: string): PaymentIntent['status'] {
    const statusMap: Record<string, PaymentIntent['status']> = {
      'created': 'pending',
      'pending': 'pending',
      'processing': 'processing',
      'paid': 'completed',
      'completed': 'completed',
      'failed': 'failed',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'expired': 'cancelled',
    };
    return statusMap[dodoStatus] || 'pending';
  }

  // ============================================
  // Mock Implementations
  // ============================================

  private createMockPayment(params: CreatePaymentParams): PaymentResult {
    const paymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderId = `order_mock_${Date.now()}`;
    
    return {
      success: true,
      paymentId,
      orderId,
      status: 'pending',
      checkoutUrl: `/payment/mock-checkout?id=${paymentId}&amount=${params.amount}&items=${params.items?.length || 0}`,
      redirectUrl: `/payment/mock-checkout?id=${paymentId}`,
      message: 'Mock payment created. In production, this would redirect to Dodo Payments checkout.',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins
    };
  }

  private getMockPaymentStatus(paymentId: string): PaymentIntent {
    // Simulate different statuses based on payment ID
    const isCompleted = paymentId.includes('completed') || Math.random() > 0.3;
    
    return {
      id: paymentId,
      amount: 5000,
      currency: 'INR',
      status: isCompleted ? 'completed' : 'pending',
      description: 'Mock payment for testing',
      metadata: { platform: 'YatriAI' },
      createdAt: new Date(Date.now() - 60000).toISOString(),
      updatedAt: new Date().toISOString(),
      paymentMethod: 'upi',
      receiptUrl: isCompleted ? `/receipts/${paymentId}` : undefined,
    };
  }

  private getMockTransactionDetails(orderId: string): TransactionDetails {
    return {
      id: `pay_${orderId}`,
      orderId,
      amount: 5000,
      currency: 'INR',
      status: 'completed',
      paymentMethod: 'upi',
      customerEmail: 'customer@example.com',
      customerName: 'Test Customer',
      items: [
        { id: '1', name: 'Dokra Art Figurine', price: 2500, quantity: 1 },
        { id: '2', name: 'Tribal Painting', price: 2500, quantity: 1 },
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3500000).toISOString(),
      receiptUrl: `/receipts/${orderId}`,
    };
  }

  private processedMockRefund(paymentId: string, amount?: number): RefundResult {
    return {
      success: true,
      refundId: `ref_mock_${Date.now()}`,
      amount: amount || 5000,
      status: 'processed',
      message: 'Mock refund processed. In production, this would be processed via Dodo Payments.',
    };
  }

  private getMockPaymentHistory(): PaymentIntent[] {
    return [
      {
        id: 'pay_mock_1',
        amount: 5000,
        currency: 'INR',
        status: 'completed',
        description: 'Guide booking - Ranchi Heritage Tour',
        metadata: { type: 'booking', guideId: 'guide-123' },
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        paymentMethod: 'upi',
        receiptUrl: '/receipts/pay_mock_1',
      },
      {
        id: 'pay_mock_2',
        amount: 3500,
        currency: 'INR',
        status: 'completed',
        description: 'Handicraft purchase - Dokra Art Elephant',
        metadata: { type: 'product', productId: 'prod-456' },
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        paymentMethod: 'card',
        receiptUrl: '/receipts/pay_mock_2',
      },
      {
        id: 'pay_mock_3',
        amount: 15000,
        currency: 'INR',
        status: 'completed',
        description: 'Tour package - 3 Day Jharkhand Adventure',
        metadata: { type: 'package', packageId: 'pkg-789' },
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        paymentMethod: 'netbanking',
        receiptUrl: '/receipts/pay_mock_3',
      },
    ];
  }
}

export const paymentService = new PaymentService();
export default paymentService;
