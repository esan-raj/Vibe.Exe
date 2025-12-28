/**
 * Razorpay Payment Gateway Service
 * 
 * Razorpay is India's leading payment gateway supporting:
 * - UPI (GPay, PhonePe, Paytm, etc.)
 * - Credit/Debit Cards
 * - Net Banking
 * - Wallets (Paytm, Amazon Pay, etc.)
 * - EMI
 * - International Cards
 * 
 * Documentation: https://razorpay.com/docs/
 * Test Cards: https://razorpay.com/docs/payments/test-cards/
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise (INR) or smallest currency unit
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  handler?: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private isTestMode: boolean;
  private scriptLoaded: boolean = false;

  constructor() {
    this.keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
    this.keySecret = import.meta.env.VITE_RAZORPAY_KEY_SECRET || '';
    this.isTestMode = import.meta.env.VITE_RAZORPAY_TEST_MODE !== 'false';
  }

  /**
   * Check if Razorpay is configured
   */
  isConfigured(): boolean {
    return this.keyId !== '' && this.keySecret !== '';
  }

  /**
   * Load Razorpay checkout script
   */
  async loadScript(): Promise<void> {
    if (this.scriptLoaded || window.Razorpay) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Razorpay script'));
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Create Razorpay order (server-side recommended, but can be done client-side with key secret)
   */
  async createOrder(params: {
    amount: number; // in paise
    currency: string;
    receipt: string;
    notes?: Record<string, any>;
  }): Promise<RazorpayOrder> {
    // Note: In production, order creation should be done server-side
    // This is a client-side implementation for demo purposes
    // You should call your backend API to create orders securely
    
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: orderId,
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      status: 'created',
      created_at: Date.now(),
    };
  }

  /**
   * Open Razorpay checkout
   */
  async openCheckout(options: RazorpayOptions): Promise<RazorpayResponse> {
    if (!this.isConfigured()) {
      throw new Error('Razorpay is not configured. Please add VITE_RAZORPAY_KEY_ID to .env');
    }

    await this.loadScript();

    return new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        ...options,
        key: this.keyId,
        handler: (response: RazorpayResponse) => {
          if (options.handler) {
            options.handler(response);
          }
          resolve(response);
        },
        modal: {
          ...options.modal,
          ondismiss: () => {
            if (options.modal?.ondismiss) {
              options.modal.ondismiss();
            }
            reject(new Error('Payment cancelled by user'));
          },
        },
        theme: {
          color: options.theme?.color || '#F97316', // YatriAI orange
        },
      });

      razorpay.open();
    });
  }

  /**
   * Verify payment signature (should be done server-side)
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    // Note: Signature verification should be done server-side for security
    // This is a placeholder - implement proper HMAC SHA256 verification on backend
    // Using crypto-js: crypto.createHmac('sha256', keySecret).update(orderId + '|' + paymentId).digest('hex')
    
    console.warn('Signature verification should be done server-side');
    return true; // Placeholder
  }

  /**
   * Format amount to paise (smallest currency unit)
   */
  toPaise(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Format paise to rupees
   */
  fromPaise(paise: number): number {
    return paise / 100;
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService;






