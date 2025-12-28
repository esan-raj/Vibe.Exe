/**
 * Payment Method Selector Component
 * 
 * Allows users to choose between:
 * - Dodo Payments (Primary - UPI, Cards, Net Banking, Wallets)
 * - Crypto/Web3 payments (Alternative - Ethereum, USDC, USDT)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Smartphone, Globe, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { unifiedPaymentService, type PaymentGateway } from '../../lib/services/unified-payment.service';
import { blockchainService } from '../../lib/services/blockchain.service';
import { cn } from '../../lib/utils';

export type PaymentMethod = 'gateway' | 'crypto';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  selectedGateway?: PaymentGateway | null;
  onMethodChange: (method: PaymentMethod) => void;
  onGatewayChange?: (gateway: PaymentGateway) => void;
  amount: number;
  currency?: string;
  className?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  selectedGateway,
  onMethodChange,
  onGatewayChange,
  amount,
  currency = 'INR',
  className,
}) => {
  const availableGateways = unifiedPaymentService.getAvailableGateways().filter(g => g !== 'crypto');
  const walletConnected = blockchainService.getWalletState().isConnected;
  const dodoAvailable = availableGateways.includes('dodo');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Traditional Payment Gateway */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMethodChange('gateway')}
            className={cn(
              'p-4 rounded-xl border-2 transition-all text-left',
              selectedMethod === 'gateway'
                ? 'border-kolkata-terracotta bg-kolkata-terracotta/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-kolkata-terracotta/50'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                selectedMethod === 'gateway' ? 'bg-kolkata-terracotta text-white' : 'bg-gray-100 dark:bg-gray-800'
              )}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Payment Gateway
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  UPI, Cards, Net Banking
                </div>
              </div>
              {selectedMethod === 'gateway' && (
                <CheckCircle className="w-5 h-5 text-kolkata-terracotta ml-auto" />
              )}
            </div>
          </motion.button>

          {/* Crypto/Web3 Payment */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMethodChange('crypto')}
            disabled={!walletConnected && availableGateways.length > 0}
            className={cn(
              'p-4 rounded-xl border-2 transition-all text-left',
              selectedMethod === 'crypto'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-500/50',
              !walletConnected && availableGateways.length > 0 && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                selectedMethod === 'crypto' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
              )}>
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Crypto Payment
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {walletConnected ? 'ETH, USDC, USDT' : 'Connect wallet'}
                </div>
              </div>
              {selectedMethod === 'crypto' && (
                <CheckCircle className="w-5 h-5 text-purple-500 ml-auto" />
              )}
            </div>
          </motion.button>
        </div>
      </div>

      {/* Dodo Payments Info (if gateway payment selected) */}
      {selectedMethod === 'gateway' && dodoAvailable && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <div className="font-medium mb-1">Dodo Payments</div>
              <div className="text-xs">
                Supports UPI, Cards, Net Banking, and Wallets. Secure and instant payments with split payment support for marketplace sellers.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Messages */}
      {selectedMethod === 'crypto' && !walletConnected && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              Connect your wallet to use crypto payments. Otherwise, use Dodo Payments for instant payment.
            </div>
          </div>
        </div>
      )}

      {selectedMethod === 'gateway' && !dodoAvailable && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300">
              Dodo Payments is not configured. Please add VITE_DODO_PUBLIC_KEY to .env.local or use crypto payments.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;

