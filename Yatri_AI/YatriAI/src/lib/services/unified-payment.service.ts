/**
 * Unified Payment Gateway Service
 * 
 * Provides a unified interface for payment processing:
 * - Dodo Payments (Primary - UPI, Cards, Net Banking, Wallets, Split Payments)
 * - Crypto/Web3 (Alternative - Ethereum, USDC, USDT)
 * 
 * Automatically selects Dodo Payments if configured, otherwise falls back to Crypto
 */

import { paymentService, type CreatePaymentParams, type PaymentResult } from './payment.service';
import { isDodoPaymentsConfigured } from './config';

export type PaymentGateway = 'dodo' | 'crypto';

export interface UnifiedPaymentParams extends CreatePaymentParams {
  gateway?: PaymentGateway; // Optional: force specific gateway
  currency?: string;
}

export interface UnifiedPaymentResult extends PaymentResult {
  gateway: PaymentGateway;
  gatewayResponse?: any;
}

class UnifiedPaymentService {
  /**
   * Get available payment gateways
   */
  getAvailableGateways(): PaymentGateway[] {
    const gateways: PaymentGateway[] = [];
    
    // Dodo Payments is primary gateway
    if (isDodoPaymentsConfigured()) {
      gateways.push('dodo');
    }
    
    // Crypto/Web3 is always available if wallet is connected
    gateways.push('crypto');
    
    return gateways;
  }

  /**
   * Select best gateway for payment
   */
  selectGateway(params: UnifiedPaymentParams): PaymentGateway {
    // If gateway is explicitly specified, use it
    if (params.gateway && this.isGatewayAvailable(params.gateway)) {
      return params.gateway;
    }

    // Prefer Dodo Payments if configured
    if (isDodoPaymentsConfigured()) {
      return 'dodo';
    }

    // Fallback to crypto
    return 'crypto';
  }

  /**
   * Check if gateway is available
   */
  isGatewayAvailable(gateway: PaymentGateway): boolean {
    switch (gateway) {
      case 'dodo':
        return isDodoPaymentsConfigured();
      case 'crypto':
        return true; // Always available if wallet connected
      default:
        return false;
    }
  }

  /**
   * Process payment with unified interface
   */
  async processPayment(params: UnifiedPaymentParams): Promise<UnifiedPaymentResult> {
    const gateway = this.selectGateway(params);
    
    console.log(`💳 Processing payment via ${gateway}...`, {
      amount: params.amount,
      currency: params.currency || 'INR',
      gateway,
    });

    try {
      switch (gateway) {
        case 'dodo':
          return await this.processDodoPayment(params);
        
        case 'crypto':
          return await this.processCryptoPayment(params);
        
        default:
          throw new Error(`Payment gateway ${gateway} is not available`);
      }
    } catch (error: any) {
      console.error(`Payment failed with ${gateway}:`, error);
      
      // Try fallback gateway (crypto if dodo fails, or vice versa)
      const fallbackGateways = this.getAvailableGateways().filter(g => g !== gateway);
      if (fallbackGateways.length > 0) {
        console.log(`Trying fallback gateway: ${fallbackGateways[0]}`);
        return this.processPayment({ ...params, gateway: fallbackGateways[0] });
      }
      
      throw error;
    }
  }

  /**
   * Process payment via Dodo Payments
   */
  private async processDodoPayment(params: UnifiedPaymentParams): Promise<UnifiedPaymentResult> {
    const result = await paymentService.createPayment(params);
    
    return {
      ...result,
      gateway: 'dodo',
      gatewayResponse: result,
    };
  }

  /**
   * Process payment via Crypto/Web3
   */
  private async processCryptoPayment(params: UnifiedPaymentParams): Promise<UnifiedPaymentResult> {
    // This would use the contracts service for crypto payments
    // For now, return a placeholder
    throw new Error('Crypto payments should be handled separately via contracts service');
  }

  /**
   * Get gateway display name
   */
  getGatewayName(gateway: PaymentGateway): string {
    const names: Record<PaymentGateway, string> = {
      dodo: 'Dodo Payments',
      crypto: 'Crypto (Web3)',
    };
    return names[gateway] || gateway;
  }

  /**
   * Get gateway icon/symbol
   */
  getGatewayIcon(gateway: PaymentGateway): string {
    const icons: Record<PaymentGateway, string> = {
      dodo: '💳',
      crypto: '⛓️',
    };
    return icons[gateway] || '💳';
  }

  /**
   * Get supported payment methods for gateway
   */
  getSupportedMethods(gateway: PaymentGateway): string[] {
    switch (gateway) {
      case 'dodo':
        return ['UPI', 'Credit/Debit Cards', 'Net Banking', 'Wallets', 'Split Payments'];
      case 'crypto':
        return ['Ethereum', 'USDC', 'USDT'];
      default:
        return [];
    }
  }
}

export const unifiedPaymentService = new UnifiedPaymentService();
export default unifiedPaymentService;

