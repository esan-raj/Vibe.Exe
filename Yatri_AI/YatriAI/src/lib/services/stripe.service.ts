/**
 * Stripe Payment Gateway Service
 * 
 * Stripe supports:
 * - Credit/Debit Cards (Visa, Mastercard, Amex, etc.)
 * - Digital Wallets (Apple Pay, Google Pay)
 * - Bank Transfers
 * - Buy Now Pay Later (Klarna, Afterpay)
 * - International payments
 * 
 * Documentation: https://stripe.com/docs
 * Test Cards: https://stripe.com/docs/testing
 */

declare global {
  interface Window {
    Stripe: any;
  }
}

export interface StripeOptions {
  amount: number; // Amount in cents (USD) or smallest currency unit
  currency: string;
  description: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
  successUrl: string;
  cancelUrl: string;
}

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

class StripeService {
  private publishableKey: string;
  private secretKey: string;
  private isTestMode: boolean;
  private stripe: any = null;

  constructor() {
    this.publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
    this.secretKey = import.meta.env.VITE_STRIPE_SECRET_KEY || '';
    this.isTestMode = import.meta.env.VITE_STRIPE_TEST_MODE !== 'false';
  }

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return this.publishableKey !== '';
  }

  /**
   * Load Stripe.js
   */
  async loadStripe(): Promise<any> {
    if (this.stripe) {
      return this.stripe;
    }

    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.head.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    this.stripe = window.Stripe(this.publishableKey);
    return this.stripe;
  }

  /**
   * Create payment intent (should be done server-side)
   */
  async createPaymentIntent(params: StripeOptions): Promise<StripePaymentIntent> {
    // Note: In production, payment intent creation should be done server-side
    // This is a client-side mock for demo purposes
    // You should call your backend API: POST /api/stripe/create-payment-intent
    
    const intentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: intentId,
      client_secret: `pi_${intentId}_secret_mock`,
      amount: params.amount,
      currency: params.currency,
      status: 'requires_payment_method',
    };
  }

  /**
   * Confirm payment with card
   */
  async confirmCardPayment(
    clientSecret: string,
    cardElement: any,
    billingDetails?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: any;
    }
  ): Promise<{ paymentIntent?: any; error?: any }> {
    const stripe = await this.loadStripe();
    
    return await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: billingDetails,
      },
    });
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.loadStripe();
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Create checkout session (should be done server-side)
   */
  async createCheckoutSession(params: StripeOptions): Promise<{ sessionId: string; url: string }> {
    // Note: In production, checkout session creation should be done server-side
    // Call your backend: POST /api/stripe/create-checkout-session
    
    const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      sessionId,
      url: `/stripe-checkout?session_id=${sessionId}`,
    };
  }

  /**
   * Format amount to cents (smallest currency unit)
   */
  toCents(amount: number, currency: string = 'USD'): number {
    // Most currencies use 2 decimal places, but some use 0 or 3
    const decimalPlaces: Record<string, number> = {
      'USD': 2,
      'EUR': 2,
      'GBP': 2,
      'INR': 2,
      'JPY': 0, // No decimal places
      'KRW': 0,
    };
    
    const decimals = decimalPlaces[currency.toUpperCase()] || 2;
    return Math.round(amount * Math.pow(10, decimals));
  }

  /**
   * Format cents to amount
   */
  fromCents(cents: number, currency: string = 'USD'): number {
    const decimalPlaces: Record<string, number> = {
      'USD': 2,
      'EUR': 2,
      'GBP': 2,
      'INR': 2,
      'JPY': 0,
      'KRW': 0,
    };
    
    const decimals = decimalPlaces[currency.toUpperCase()] || 2;
    return cents / Math.pow(10, decimals);
  }
}

export const stripeService = new StripeService();
export default stripeService;






