import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, Shield, CheckCircle, Clock, AlertCircle, Ticket, Home, Users, ArrowRight, ExternalLink, Loader2, Wallet, Receipt, RefreshCw, X, Star, MapPin, DollarSign, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bookings } from '../../../data/mockData';
import { MagicCard } from '../../magicui/MagicCard';
import { BorderBeam } from '../../magicui/BorderBeam';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';
import { WalletConnect, BlockchainVerification } from '../../blockchain';
import { blockchainService, type VerificationResult, type WalletState, type BlockchainRecord } from '../../../lib/services/blockchain.service';
import { paymentService, type PaymentResult, type PaymentIntent } from '../../../lib/services/payment.service';
import { unifiedPaymentService, type PaymentGateway } from '../../../lib/services/unified-payment.service';
import { DodoPaymentsConfig, isMetaMaskAvailable, ActiveNetwork, isDodoPaymentsConfigured } from '../../../lib/services/config';
import api from '../../../lib/api';

// Helper function to replace Jharkhand with Kolkata and Betla with Sundarbans in tour data
const sanitizeTourData = (tour: any) => {
  return {
    ...tour,
    title: tour.title?.replace(/Jharkhand/gi, 'Kolkata').replace(/Betla/gi, 'Sundarbans') || tour.title,
    description: tour.description?.replace(/Jharkhand/gi, 'Kolkata').replace(/Betla/gi, 'Sundarbans') || tour.description
  };
};

const BookingSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'new'>('current');
  const [verificationResults, setVerificationResults] = useState<Record<string, VerificationResult>>({});
  const [blockchainRecords, setBlockchainRecords] = useState<Record<string, BlockchainRecord>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  
  // Dodo Payments state
  const [paymentResults, setPaymentResults] = useState<Record<string, PaymentResult>>({});
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, PaymentIntent>>({});
  const [verifyingPayment, setVerifyingPayment] = useState<string | null>(null);
  
  // ETHIndia blockchain state
  const [walletState, setWalletState] = useState<WalletState>(blockchainService.getWalletState());
  const [recordingOnChain, setRecordingOnChain] = useState<string | null>(null);

  // Booking options state
  const [selectedBookingType, setSelectedBookingType] = useState<'guide' | 'accommodation' | 'tour' | null>(null);
  const [approvedGuides, setApprovedGuides] = useState<any[]>([]);
  const [approvedTours, setApprovedTours] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [isLoadingGuides, setIsLoadingGuides] = useState(false);
  const [isLoadingTours, setIsLoadingTours] = useState(false);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const currentBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const historyBookings = bookings.filter(b => b.status === 'cancelled');

  // Fetch approved guides when "Book a Guide" is selected
  useEffect(() => {
    if (selectedBookingType === 'guide') {
      fetchApprovedGuides();
    }
  }, [selectedBookingType]);

  // Fetch approved tours when "Book a Tour" is selected
  useEffect(() => {
    if (selectedBookingType === 'tour') {
      fetchApprovedTours();
    }
  }, [selectedBookingType]);

  // Fetch hotels when "Book a Stay" is selected
  useEffect(() => {
    if (selectedBookingType === 'accommodation') {
      fetchHotels();
    }
  }, [selectedBookingType]);

  const fetchApprovedGuides = async () => {
    setIsLoadingGuides(true);
    try {
      const response = await api.getGuides();
      // Filter for verified/approved guides
      const guides = Array.isArray(response) ? response : (response.success && response.data ? response.data : []);
      const verifiedGuides = guides.filter((guide: any) => guide.isVerified !== false);
      setApprovedGuides(verifiedGuides);
    } catch (error) {
      console.error('Error fetching approved guides:', error);
      setApprovedGuides([]);
    } finally {
      setIsLoadingGuides(false);
    }
  };

  const fetchApprovedTours = async () => {
    setIsLoadingTours(true);
    try {
      const response = await api.getApprovedTours();
      let tours = [];
      if (response.success && response.data) {
        tours = response.data;
      } else if (Array.isArray(response)) {
        tours = response;
      }
      // Sanitize tour data to replace Jharkhand with Kolkata and Betla with Sundarbans
      setApprovedTours(tours.map(sanitizeTourData));
    } catch (error) {
      console.error('Error fetching approved tours:', error);
      setApprovedTours([]);
    } finally {
      setIsLoadingTours(false);
    }
  };

  const fetchHotels = async () => {
    setIsLoadingHotels(true);
    try {
      // Mock hotels data - can be replaced with API call later
      // For now, using nearby hotels in Kolkata
      const mockHotels = [
        {
          id: 'hotel-1',
          name: 'The Oberoi Grand',
          description: 'Luxury heritage hotel in the heart of Kolkata',
          location: '15, Jawaharlal Nehru Road, Kolkata',
          distance: '0.5 km from city center',
          price: 8500,
          rating: 4.8,
          image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
          amenities: ['WiFi', 'AC', 'Pool', 'Spa', 'Restaurant', 'Parking', 'Room Service'],
          latitude: 22.5448,
          longitude: 88.3426
        },
        {
          id: 'hotel-2',
          name: 'Taj Bengal',
          description: '5-star hotel with modern amenities and heritage charm',
          location: '34B, Belvedere Road, Alipore, Kolkata',
          distance: '3 km from city center',
          price: 12000,
          rating: 4.9,
          image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
          amenities: ['WiFi', 'AC', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking'],
          latitude: 22.5308,
          longitude: 88.3300
        },
        {
          id: 'hotel-3',
          name: 'Heritage Homestay',
          description: 'Traditional Bengali home with modern amenities',
          location: 'Park Street, Kolkata',
          distance: '1 km from city center',
          price: 2500,
          rating: 4.5,
          image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
          amenities: ['WiFi', 'AC', 'Breakfast', 'Parking', 'Local Tours'],
          latitude: 22.5514,
          longitude: 88.3519
        },
        {
          id: 'hotel-4',
          name: 'Eco Resort Sundarbans',
          description: 'Sustainable stay near Sundarbans National Park',
          location: 'Sundarbans, West Bengal',
          distance: '110 km from Kolkata',
          price: 3500,
          rating: 4.7,
          image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
          amenities: ['WiFi', 'AC', 'Meals', 'Guided Tours', 'Wildlife Viewing'],
          latitude: 21.9497,
          longitude: 88.9401
        },
        {
          id: 'hotel-5',
          name: 'City Center Hotel',
          description: 'Comfortable hotel in the heart of Kolkata',
          location: 'Esplanade, Kolkata',
          distance: '0.8 km from city center',
          price: 4000,
          rating: 4.3,
          image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
          amenities: ['WiFi', 'AC', 'Gym', 'Restaurant', 'Room Service', 'Parking'],
          latitude: 22.5626,
          longitude: 88.3630
        },
        {
          id: 'hotel-6',
          name: 'Boutique Heritage Stay',
          description: 'Charming heritage property with colonial architecture',
          location: 'Ballygunge, Kolkata',
          distance: '5 km from city center',
          price: 5500,
          rating: 4.6,
          image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400',
          amenities: ['WiFi', 'AC', 'Breakfast', 'Heritage Tours', 'Library', 'Garden'],
          latitude: 22.5200,
          longitude: 88.3650
        }
      ];
      setAccommodations(mockHotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setAccommodations([]);
    } finally {
      setIsLoadingHotels(false);
    }
  };

  const handleBookingOptionClick = (type: 'guide' | 'accommodation' | 'tour') => {
    setSelectedBookingType(type);
  };

  const handleBookItem = (item: any) => {
    setSelectedItem(item);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    // Here you would create the booking via API
    const itemName = selectedItem?.title 
      ? sanitizeTourData(selectedItem).title 
      : selectedItem?.name;
    alert(`Booking confirmed for ${itemName}!`);
    setShowBookingModal(false);
    setSelectedItem(null);
    setSelectedBookingType(null);
    // Refresh bookings list
  };

  // Handle wallet connection (ETHIndia)
  const handleWalletConnect = (state: WalletState) => {
    setWalletState(state);
    console.log('🔗 Wallet connected:', state.address);
  };

  // Record booking on blockchain (requires wallet) - ETHIndia
  const handleRecordOnBlockchain = async (booking: typeof bookings[0]) => {
    if (!walletState.isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setRecordingOnChain(booking.id);
    try {
      const record = await blockchainService.recordBooking({
        id: booking.id,
        userId: 'user-123', // Would come from auth context
        guideId: booking.type === 'guide' ? 'guide-456' : undefined,
        amount: booking.amount,
        type: booking.type,
        details: {
          title: booking.title,
          date: booking.date,
        },
      });

      setBlockchainRecords(prev => ({ ...prev, [booking.id]: record }));
      console.log('✅ Booking recorded on blockchain:', record.txHash);
    } catch (error: any) {
      console.error('Failed to record on blockchain:', error);
      alert(error.message || 'Failed to record on blockchain');
    } finally {
      setRecordingOnChain(null);
    }
  };

  // Verify booking on blockchain via ETHIndia service
  const handleVerifyOnBlockchain = async (bookingId: string, txHash: string) => {
    setVerifyingId(bookingId);
    try {
      const result = await blockchainService.verifyBooking(txHash);
      setVerificationResults(prev => ({ ...prev, [bookingId]: result }));
    } catch (error) {
      console.error('Blockchain verification failed:', error);
    } finally {
      setVerifyingId(null);
    }
  };

  // Process payment via unified payment service
  const handleCompletePayment = async (booking: typeof bookings[0]) => {
    setProcessingPayment(booking.id);
    try {
      // Use unified payment service (automatically selects best gateway)
      const result = await unifiedPaymentService.processPayment({
        amount: booking.amount,
        currency: DodoPaymentsConfig.DEFAULT_CURRENCY,
        description: booking.title,
        customerEmail: 'customer@example.com', // Get from user profile
        customerName: 'Customer', // Get from user profile
        items: [{
          id: booking.id,
          name: booking.title,
          price: booking.amount,
          quantity: 1,
        }],
        metadata: {
          bookingId: booking.id,
          type: booking.type,
        },
        returnUrl: `${window.location.origin}/payment/success?booking=${booking.id}`,
        cancelUrl: `${window.location.origin}/payment/cancelled?booking=${booking.id}`,
      });

      if (result.success) {
        setPaymentResults(prev => ({ ...prev, [booking.id]: result as PaymentResult }));
        
        // Redirect to payment gateway if URL provided
        if (result.checkoutUrl || result.redirectUrl) {
          window.location.href = result.checkoutUrl || result.redirectUrl || '';
        } else {
          // Payment completed (for crypto or instant payments)
          console.log('💳 Payment completed:', result);
          alert(`Payment completed!\n\nPayment ID: ${result.paymentId}\nOrder ID: ${result.orderId || 'N/A'}\n\nGateway: ${result.gateway}`);
        }
      } else {
        alert('Payment creation failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      alert('An error occurred while processing payment: ' + (error.message || error));
    } finally {
      setProcessingPayment(null);
    }
  };

  // Verify payment status (Dodo Payments)
  const handleVerifyPayment = async (booking: typeof bookings[0]) => {
    const paymentResult = paymentResults[booking.id];
    if (!paymentResult?.paymentId) return;

    setVerifyingPayment(booking.id);
    try {
      const status = await paymentService.verifyPayment(paymentResult.paymentId);
      setPaymentStatuses(prev => ({ ...prev, [booking.id]: status }));
      
      if (status.status === 'completed') {
        alert(`✅ Payment verified!\n\nStatus: ${status.status}\nAmount: ${paymentService.formatAmount(status.amount)}\n\nReceipt: ${status.receiptUrl || 'Will be sent via email'}`);
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    } finally {
      setVerifyingPayment(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  const tabs = [
    { id: 'current', label: 'Current Bookings', count: currentBookings.length, icon: Ticket },
    { id: 'history', label: 'Booking History', count: historyBookings.length, icon: Clock },
    { id: 'new', label: 'New Booking', count: 0, icon: Calendar }
  ];

  return (
    <div className="space-y-8">
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Secure Booking System{' '}
                <AnimatedGradientText className="text-3xl">🔒</AnimatedGradientText>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Blockchain-verified bookings on {ActiveNetwork.name}
              </p>
            </div>
          </div>
          
          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            <WalletConnect 
              compact 
              onConnect={handleWalletConnect}
              onDisconnect={() => setWalletState(blockchainService.getWalletState())}
            />
          </div>
        </div>
      </BlurFade>

      {/* Tab Navigation */}
      <BlurFade delay={0.2} inView>
        <MagicCard gradientColor="#3b82f6" gradientOpacity={0.1}>
          <div className="p-2">
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id 
                          ? 'bg-white/20' 
                          : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </MagicCard>
      </BlurFade>

      {/* Current Bookings */}
      <AnimatePresence mode="wait">
        {activeTab === 'current' && (
          <motion.div
            key="current"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {currentBookings.map((booking, index) => (
              <BlurFade key={booking.id} delay={0.1 * index} inView>
                <MagicCard 
                  gradientColor={booking.status === 'confirmed' ? '#22c55e' : '#eab308'}
                  gradientOpacity={0.1}
                >
                  <div className="p-6 relative">
                    <BorderBeam 
                      size={300} 
                      duration={15} 
                      colorFrom={booking.status === 'confirmed' ? '#22c55e' : '#eab308'} 
                      colorTo="#3b82f6" 
                    />
                    
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                          {booking.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>{new Date(booking.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                            <CreditCard className="w-4 h-4 text-green-500" />
                            <span className="font-semibold">₹{booking.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </div>
                    </div>

                    {/* Blockchain Verification Section */}
                    {(booking.blockchainHash || blockchainRecords[booking.id]) ? (
                      <BlockchainVerification
                        txHash={blockchainRecords[booking.id]?.txHash || booking.blockchainHash}
                        record={blockchainRecords[booking.id] || (verificationResults[booking.id]?.record as BlockchainRecord)}
                        showDetails={false}
                        className="mb-4"
                      />
                    ) : (
                      /* Record on Blockchain Button */
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 mb-4 border border-amber-200 dark:border-amber-800"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                              Not Yet on Blockchain
                            </span>
                          </div>
                          {walletState.isConnected ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRecordOnBlockchain(booking)}
                              disabled={recordingOnChain === booking.id}
                              className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {recordingOnChain === booking.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Recording...
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3 h-3" />
                                  Record on {ActiveNetwork.name.split(' ')[0]}
                                </>
                              )}
                            </motion.button>
                          ) : (
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              Connect wallet to record
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                          Record this booking on the blockchain for immutable verification and transparency.
                        </p>
                      </motion.div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <ShimmerButton className="flex-1 py-2.5" background="linear-gradient(135deg, #16a34a 0%, #22c55e 100%)">
                        View Details
                      </ShimmerButton>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                      >
                        Contact Support
                      </motion.button>
                      {booking.status === 'pending' && (
                        <ShimmerButton 
                          className="flex-1 py-2.5" 
                          background="linear-gradient(135deg, #ea580c 0%, #f97316 100%)"
                          onClick={() => handleCompletePayment(booking)}
                          disabled={processingPayment === booking.id}
                        >
                          {processingPayment === booking.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              Complete Payment
                            </>
                          )}
                        </ShimmerButton>
                      )}
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>
            ))}

            {currentBookings.length === 0 && (
              <BlurFade delay={0.2} inView>
                <MagicCard className="text-center py-16">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    📅
                  </motion.div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    No Current Bookings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start planning your next Kolkata adventure!
                  </p>
                  <ShimmerButton onClick={() => setActiveTab('new')}>
                    <Calendar className="w-5 h-5" />
                    Create New Booking
                  </ShimmerButton>
                </MagicCard>
              </BlurFade>
            )}
          </motion.div>
        )}

        {/* Booking History */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BlurFade delay={0.2} inView>
              <MagicCard gradientColor="#6366f1" gradientOpacity={0.1}>
                <div className="overflow-hidden rounded-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Booking
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {bookings.map((booking, index) => (
                          <motion.tr 
                            key={booking.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {booking.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {booking.type}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(booking.date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gradient">
                              ₹{booking.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                <span className="capitalize">{booking.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                              <button className="text-green-600 hover:text-green-800 dark:hover:text-green-400 transition-colors">
                                View
                              </button>
                              <button className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors">
                                Download
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </MagicCard>
            </BlurFade>
          </motion.div>
        )}

        {/* New Booking */}
        {activeTab === 'new' && (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BlurFade delay={0.2} inView>
              <MagicCard gradientColor="#8b5cf6" gradientOpacity={0.1}>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                    What would you like to book?
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: 'Book a Guide',
                        description: 'Connect with verified local guides',
                        icon: Users,
                        color: 'from-blue-500 to-cyan-500',
                        emoji: '👨‍🏫'
                      },
                      {
                        title: 'Book a Stay',
                        description: 'Nearby hotels and accommodations',
                        icon: Home,
                        color: 'from-green-500 to-emerald-500',
                        emoji: '🏠'
                      },
                      {
                        title: 'Book a Tour',
                        description: 'Approved heritage tours',
                        icon: Ticket,
                        color: 'from-orange-500 to-red-500',
                        emoji: '🎒'
                      }
                    ].map((option, index) => {
                      const bookingType = index === 0 ? 'guide' : index === 1 ? 'accommodation' : 'tour';
                      return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBookingOptionClick(bookingType)}
                        className="relative p-8 rounded-2xl text-left group overflow-hidden"
                      >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-10 group-hover:opacity-100 transition-opacity duration-300`} />
                        
                        {/* Border */}
                        <div className="absolute inset-0 border-2 border-gray-200 dark:border-gray-700 rounded-2xl group-hover:border-transparent transition-colors" />
                        
                        <div className="relative z-10">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                            className="text-5xl mb-4"
                          >
                            {option.emoji}
                          </motion.div>
                          <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-white text-xl mb-2 transition-colors">
                            {option.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white/80 transition-colors mb-4">
                            {option.description}
                          </p>
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 group-hover:text-white font-medium text-sm transition-colors">
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                          </div>
                        </div>
                      </motion.button>
                      );
                    })}
                  </div>

                  {/* Booking Options Display */}
                  {selectedBookingType && (
                    <div className="mt-8">
                      {selectedBookingType === 'guide' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Available Guides</h4>
                            <button
                              onClick={() => setSelectedBookingType(null)}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          {isLoadingGuides ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                          ) : approvedGuides.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                              No verified guides available at the moment.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {approvedGuides.map((guide) => (
                                <motion.div
                                  key={guide.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
                                  onClick={() => handleBookItem(guide)}
                                >
                                  <div className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                                        {guide.name?.charAt(0) || 'G'}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900 dark:text-white">{guide.name}</h5>
                                        {guide.isVerified && (
                                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                            <CheckCircle className="w-3 h-3" />
                                            Verified
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {guide.specialties && guide.specialties.length > 0 && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {guide.specialties.slice(0, 3).join(', ')}
                                      </p>
                                    )}
                                    {guide.languages && guide.languages.length > 0 && (
                                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                                        Languages: {guide.languages.join(', ')}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between text-sm mb-3">
                                      {guide.rating && (
                                        <div className="flex items-center gap-1">
                                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                          <span className="font-medium">{guide.rating}</span>
                                        </div>
                                      )}
                                      <span className="font-bold text-blue-600 dark:text-blue-400">
                                        ₹{guide.pricePerDay || guide.price}/day
                                      </span>
                                    </div>
                                    {guide.location && (
                                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {guide.location}
                                      </p>
                                    )}
                                    <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-colors">
                                      Book Guide
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedBookingType === 'accommodation' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Nearby Hotels & Stays</h4>
                            <button
                              onClick={() => setSelectedBookingType(null)}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          {isLoadingHotels ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                            </div>
                          ) : accommodations.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                              No hotels available at the moment.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {accommodations.map((hotel) => (
                                <motion.div
                                  key={hotel.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
                                  onClick={() => handleBookItem(hotel)}
                                >
                                  <div className="relative h-48">
                                    <img
                                      src={hotel.image}
                                      alt={hotel.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-4">
                                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">{hotel.name}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{hotel.description}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                      <MapPin className="w-3 h-3" />
                                      {hotel.location}
                                    </div>
                                    {hotel.distance && (
                                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">{hotel.distance}</p>
                                    )}
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium">{hotel.rating}</span>
                                      </div>
                                      <span className="font-bold text-green-600 dark:text-green-400">₹{hotel.price}/night</span>
                                    </div>
                                    {hotel.amenities && hotel.amenities.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-3">
                                        {hotel.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                                          <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            {amenity}
                                          </span>
                                        ))}
                                        {hotel.amenities.length > 3 && (
                                          <span className="text-xs text-gray-500 dark:text-gray-500">+{hotel.amenities.length - 3} more</span>
                                        )}
                                      </div>
                                    )}
                                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-colors">
                                      Book Stay
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedBookingType === 'tour' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Approved Tours</h4>
                            <button
                              onClick={() => setSelectedBookingType(null)}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          {isLoadingTours ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                            </div>
                          ) : approvedTours.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                              No approved tours available at the moment.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {approvedTours.map((tour) => (
                                <motion.div
                                  key={tour.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
                                  onClick={() => handleBookItem(tour)}
                                >
                                  <div className="relative h-48">
                                    <img
                                      src={tour.image || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'}
                                      alt={tour.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-4">
                                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{sanitizeTourData(tour).title}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{sanitizeTourData(tour).description}</p>
                                    <div className="flex items-center justify-between text-sm mb-3">
                                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {tour.duration}
                                      </span>
                                      <span className="font-bold text-orange-600 dark:text-orange-400">₹{tour.price}</span>
                                    </div>
                                    {tour.guide && (
                                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        Guide: {tour.guide.name || 'Professional Guide'}
                                      </p>
                                    )}
                                    <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-colors">
                                      Book Tour
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </MagicCard>
            </BlurFade>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Confirmation Modal */}
      {showBookingModal && selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowBookingModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Confirm Booking</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{(selectedItem.title ? sanitizeTourData(selectedItem).title : selectedItem.name) || selectedItem.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedItem.title ? sanitizeTourData(selectedItem).description : selectedItem.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">₹{selectedItem.price}</span>
              </div>
              {selectedItem.duration && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="text-gray-900 dark:text-white">{selectedItem.duration}</span>
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BookingSystem;
