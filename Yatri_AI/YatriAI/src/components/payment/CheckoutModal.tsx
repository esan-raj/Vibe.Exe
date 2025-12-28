/**
 * CheckoutModal Component
 * 
 * Full checkout flow with Dodo Payments integration.
 * Features:
 * - Cart display with items
 * - Customer information form
 * - Payment method selection
 * - Order summary
 * - Redirect to Dodo checkout
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShoppingCart, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet,
  Trash2,
  Plus,
  Minus,
  Shield,
  Loader2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { paymentService, type CartItem, type PaymentResult } from '../../lib/services/payment.service';
import { DodoPaymentsConfig, isDodoPaymentsConfigured } from '../../lib/services/config';
import { MagicCard } from '../magicui/MagicCard';
import { ShimmerButton } from '../magicui/ShimmerButton';
import { BorderBeam } from '../magicui/BorderBeam';
import { cn } from '../../lib/utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckoutComplete?: (result: PaymentResult) => void;
}

type CheckoutStep = 'cart' | 'info' | 'payment' | 'processing' | 'complete';

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, description: 'GPay, PhonePe, Paytm', enabled: DodoPaymentsConfig.PAYMENT_METHODS.UPI },
  { id: 'card', label: 'Card', icon: CreditCard, description: 'Credit / Debit Card', enabled: DodoPaymentsConfig.PAYMENT_METHODS.CARDS },
  { id: 'netbanking', label: 'Net Banking', icon: Building2, description: 'All major banks', enabled: DodoPaymentsConfig.PAYMENT_METHODS.NET_BANKING },
  { id: 'wallet', label: 'Wallets', icon: Wallet, description: 'Paytm, Amazon Pay', enabled: DodoPaymentsConfig.PAYMENT_METHODS.WALLETS },
];

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutComplete,
}) => {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('upi');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { platformFee, sellerAmount } = paymentService.calculatePlatformFee(subtotal);
  const total = subtotal; // Platform fee is taken from seller, not added to buyer

  const handleProceedToInfo = () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    setError(null);
    setStep('info');
  };

  const handleProceedToPayment = () => {
    if (!customerInfo.name || !customerInfo.email) {
      setError('Please fill in your name and email');
      return;
    }
    if (!customerInfo.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError(null);
    setStep('payment');
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);
    setStep('processing');

    try {
      const result = await paymentService.createPayment({
        amount: total,
        currency: DodoPaymentsConfig.DEFAULT_CURRENCY,
        description: `YatriAI Marketplace - ${items.length} item(s)`,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        items: items,
        metadata: {
          itemCount: items.length,
          paymentMethod: selectedPaymentMethod,
        },
      });

      if (result.success) {
        setPaymentResult(result);
        setStep('complete');
        onCheckoutComplete?.(result);

        // If we have a checkout URL, redirect after a short delay
        if (result.checkoutUrl && isDodoPaymentsConfigured()) {
          setTimeout(() => {
            window.location.href = result.checkoutUrl!;
          }, 2000);
        }
      } else {
        setError('Payment creation failed. Please try again.');
        setStep('payment');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep('cart');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative"
      >
        <BorderBeam size={400} duration={15} colorFrom="#22c55e" colorTo="#f97316" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold">
                {step === 'cart' && 'Your Cart'}
                {step === 'info' && 'Customer Information'}
                {step === 'payment' && 'Select Payment'}
                {step === 'processing' && 'Processing...'}
                {step === 'complete' && 'Order Placed!'}
              </h3>
              <p className="text-sm text-green-100">
                {items.length} item(s) • {paymentService.formatAmount(total)}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Progress Steps */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {['cart', 'info', 'payment', 'complete'].map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    step === s || ['cart', 'info', 'payment', 'complete'].indexOf(step) > i
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                  )}>
                    {['cart', 'info', 'payment', 'complete'].indexOf(step) > i ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={cn(
                    'hidden sm:inline text-sm',
                    step === s ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500'
                  )}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                </div>
                {i < 3 && (
                  <div className={cn(
                    'flex-1 h-1 mx-2 rounded-full transition-all',
                    ['cart', 'info', 'payment', 'complete'].indexOf(step) > i
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {/* Cart Step */}
            {step === 'cart' && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <MagicCard key={item.id} className="p-4">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <p className="text-green-600 dark:text-green-400 font-semibold">
                            {paymentService.formatAmount(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRemoveItem(item.id)}
                            className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </MagicCard>
                  ))
                )}
              </motion.div>
            )}

            {/* Customer Info Step */}
            {step === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </motion.div>
            )}

            {/* Payment Method Step */}
            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select your preferred payment method
                </p>
                <div className="space-y-3">
                  {paymentMethods.filter(m => m.enabled).map((method) => {
                    const Icon = method.icon;
                    return (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={cn(
                          'w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all',
                          selectedPaymentMethod === method.id
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          selectedPaymentMethod === method.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {method.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {method.description}
                          </div>
                        </div>
                        <div className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                          selectedPaymentMethod === method.id
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 dark:border-gray-600'
                        )}>
                          {selectedPaymentMethod === method.id && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Sandbox Notice */}
                {DodoPaymentsConfig.IS_SANDBOX && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Sandbox mode - Use test credentials for payment</span>
                    </div>
                  </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure payment powered by Dodo Payments</span>
                </div>
              </motion.div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <Loader2 className="w-16 h-16 text-green-500 animate-spin mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Processing your order...
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Please wait while we set up your payment
                </p>
              </motion.div>
            )}

            {/* Complete Step */}
            {step === 'complete' && paymentResult && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Order Created Successfully!
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Order ID: {paymentResult.orderId}
                </p>
                
                {paymentResult.checkoutUrl ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Redirecting to payment page...
                    </p>
                    <a
                      href={paymentResult.checkoutUrl}
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                    >
                      Complete Payment <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {paymentResult.message}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 pb-2">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}

        {/* Footer */}
        {step !== 'processing' && step !== 'complete' && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            {/* Order Summary */}
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.length} items)</span>
                <span>{paymentService.formatAmount(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600">
                <span>Total</span>
                <span className="text-green-600">{paymentService.formatAmount(total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {step !== 'cart' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setError(null);
                    if (step === 'info') setStep('cart');
                    if (step === 'payment') setStep('info');
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </motion.button>
              )}
              <ShimmerButton
                onClick={() => {
                  if (step === 'cart') handleProceedToInfo();
                  else if (step === 'info') handleProceedToPayment();
                  else if (step === 'payment') handleCheckout();
                }}
                disabled={items.length === 0 || isProcessing}
                className="flex-1 py-3"
              >
                {step === 'cart' && (
                  <>
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </>
                )}
                {step === 'info' && (
                  <>
                    Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
                {step === 'payment' && (
                  <>
                    Pay {paymentService.formatAmount(total)}
                  </>
                )}
              </ShimmerButton>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutModal;

