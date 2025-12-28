import React, { useState } from 'react';
import { X, Clock, MapPin, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { unifiedPaymentService } from '../../../lib/services/unified-payment.service';
import { useAuth } from '../../../contexts/AuthContext';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { MagicCard } from '../../magicui/MagicCard';

interface TransportBookingModalProps {
  route: any;
  isOpen: boolean;
  onClose: () => void;
}

const TransportBookingModal: React.FC<TransportBookingModalProps> = ({ route, isOpen, onClose }) => {
  const { user } = useAuth();
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  // Calculate pricing (example: base price per passenger)
  const basePrice = route.price || (route.type === 'tram' ? 20 : route.type === 'metro' ? 15 : route.type === 'train' ? 25 : 30);
  const totalPrice = basePrice * passengers;

  const handleBooking = async () => {
    if (!user) {
      alert('Please login to book transport');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await unifiedPaymentService.processPayment({
        amount: totalPrice,
        currency: 'INR',
        description: `Transport Booking: ${route.name} - ${route.from} to ${route.to}`,
        customerEmail: user.email || '',
        customerName: user.name || 'User',
        items: [{
          id: route.id,
          name: `${route.name} - ${route.from} to ${route.to}`,
          price: basePrice,
          quantity: passengers,
        }],
        metadata: {
          type: 'transport',
          transportType: route.type || 'tram',
          routeId: route.id,
          routeNumber: route.routeNumber,
          from: route.from,
          to: route.to,
          date: date,
          passengers: passengers,
        },
        returnUrl: `${window.location.origin}/payment/success?type=transport&route=${route.id}`,
        cancelUrl: `${window.location.origin}/payment/cancelled?type=transport&route=${route.id}`,
      });

      if (result.success) {
        setPaymentInitiated(true);
        
        // Redirect to payment gateway
        if (result.checkoutUrl || result.redirectUrl) {
          setTimeout(() => {
            window.location.href = result.checkoutUrl || result.redirectUrl || '';
          }, 1500);
        } else {
          alert(`Booking confirmed! Payment ID: ${result.paymentId}`);
          onClose();
        }
      } else {
        alert('Payment initiation failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      alert('An error occurred: ' + (error.message || error));
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <MagicCard gradientColor={route.color || '#FFB800'} gradientOpacity={0.1}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Book {route.name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{route.from} → {route.to}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Next: {route.nextArrival || route.nextTrain || route.nextBus} min</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {paymentInitiated ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Redirecting to Payment...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please complete your payment to confirm your booking.
                  </p>
                </div>
              ) : (
                <>
                  {/* Booking Details */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Travel Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-kolkata-yellow"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Passengers
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setPassengers(Math.max(1, passengers - 1))}
                          className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          -
                        </button>
                        <span className="text-xl font-semibold text-gray-900 dark:text-white w-12 text-center">
                          {passengers}
                        </span>
                        <button
                          onClick={() => setPassengers(Math.min(10, passengers + 1))}
                          className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Base Price (per person)</span>
                        <span className="text-gray-900 dark:text-white">₹{basePrice}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Passengers</span>
                        <span className="text-gray-900 dark:text-white">{passengers}</span>
                      </div>
                      <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                          <span className="text-2xl font-bold text-kolkata-yellow">₹{totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <ShimmerButton
                    onClick={handleBooking}
                    disabled={isProcessing}
                    className="w-full"
                    background="linear-gradient(135deg, #FFB800 0%, #C45C26 100%)"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Proceed to Payment</span>
                      </>
                    )}
                  </ShimmerButton>
                </>
              )}
            </div>
          </MagicCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransportBookingModal;



