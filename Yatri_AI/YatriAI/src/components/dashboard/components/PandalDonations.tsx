import React, { useState, useEffect } from 'react';
import { 
  Heart, Gift, Users, TrendingUp, CheckCircle, Clock,
  Wallet, ExternalLink, Share2, Award, MapPin, Star,
  Loader2, Shield, Eye, ArrowRight, ChevronDown, QrCode,
  FileText, Download, Globe, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../../magicui/MagicCard';
import { BorderBeam } from '../../magicui/BorderBeam';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';
import { DurgaIcon, DhunuchiIcon } from '../../kolkata/KolkataIcons';
import { blockchainService } from '../../../lib/services/blockchain.service';
import { contractsService } from '../../../lib/services/contracts.service';
import { unifiedPaymentService, type PaymentGateway } from '../../../lib/services/unified-payment.service';
import { ActiveNetwork } from '../../../lib/services/config';
import PaymentMethodSelector from '../../payment/PaymentMethodSelector';

// Verified Durga Puja Pandals for donations
const pandals = [
  {
    id: 'pandal-001',
    name: 'Bagbazar Sarbojanin',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&h=400&q=80',
    location: 'Bagbazar, Kolkata',
    established: 1919,
    rating: 4.9,
    category: 'Heritage',
    verified: true,
    description: 'One of the oldest Durga Puja committees in Kolkata, known for traditional celebrations.',
    goalAmount: 2500000,
    raisedAmount: 1875000,
    donors: 342,
    daysLeft: 15,
    perks: ['Name on donor wall', 'VIP Darshan pass', 'Prasad home delivery', 'Certificate of donation'],
    recentDonors: [
      { name: 'Amit S.', amount: 5000, time: '2 hours ago' },
      { name: 'Priya M.', amount: 11000, time: '5 hours ago' },
      { name: 'Rajesh K.', amount: 2500, time: '1 day ago' }
    ],
    expenditure: [
      { category: 'Idol & Decoration', percent: 35 },
      { category: 'Pandal Structure', percent: 25 },
      { category: 'Cultural Programs', percent: 15 },
      { category: 'Bhog & Prasad', percent: 15 },
      { category: 'Security & Misc', percent: 10 }
    ],
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  },
  {
    id: 'pandal-002',
    name: 'Kumartuli Park',
    image: 'https://images.unsplash.com/photo-1599030641314-e7f9e2f5e8e1?auto=format&fit=crop&w=600&h=400&q=80',
    location: 'Kumartuli, Kolkata',
    established: 1995,
    rating: 4.8,
    category: 'Artistic',
    verified: true,
    description: 'Famous for innovative themes and award-winning pandal art installations.',
    goalAmount: 3500000,
    raisedAmount: 2800000,
    donors: 567,
    daysLeft: 15,
    perks: ['Name on donor wall', 'Behind-the-scenes tour', 'Artisan meet & greet', 'Limited edition print'],
    recentDonors: [
      { name: 'Sanjay B.', amount: 25000, time: '1 hour ago' },
      { name: 'Meera D.', amount: 5000, time: '3 hours ago' }
    ],
    expenditure: [
      { category: 'Theme Installation', percent: 40 },
      { category: 'Idol Making', percent: 20 },
      { category: 'Lighting & Sound', percent: 20 },
      { category: 'Bhog & Prasad', percent: 12 },
      { category: 'Security', percent: 8 }
    ],
    walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72'
  },
  {
    id: 'pandal-003',
    name: 'College Square',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&h=400&q=80',
    location: 'College Street, Kolkata',
    established: 1948,
    rating: 4.7,
    category: 'Cultural',
    verified: true,
    description: 'Known for intellectual and cultural programs alongside traditional puja rituals.',
    goalAmount: 1800000,
    raisedAmount: 980000,
    donors: 234,
    daysLeft: 15,
    perks: ['Name on donor wall', 'Cultural program front row', 'Book collection', 'Certificate'],
    recentDonors: [
      { name: 'Debanjan R.', amount: 10000, time: '6 hours ago' }
    ],
    expenditure: [
      { category: 'Cultural Programs', percent: 30 },
      { category: 'Pandal & Idol', percent: 35 },
      { category: 'Bhog & Prasad', percent: 20 },
      { category: 'Books Distribution', percent: 10 },
      { category: 'Misc', percent: 5 }
    ],
    walletAddress: '0xdd4bc51496dc93a0c47008e820e0d80745476f22'
  },
  {
    id: 'pandal-004',
    name: 'Suruchi Sangha',
    image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&w=600&h=400&q=80',
    location: 'New Alipore, Kolkata',
    established: 1975,
    rating: 4.9,
    category: 'Eco-Friendly',
    verified: true,
    description: 'Pioneer in eco-friendly pujas, using sustainable materials and solar power.',
    goalAmount: 2000000,
    raisedAmount: 1650000,
    donors: 456,
    daysLeft: 15,
    perks: ['Name on eco-wall', 'Plant a tree certificate', 'Eco-goodie bag', 'Solar light souvenir'],
    recentDonors: [
      { name: 'Ananya G.', amount: 15000, time: '4 hours ago' },
      { name: 'Vikram S.', amount: 3000, time: '8 hours ago' }
    ],
    expenditure: [
      { category: 'Eco-Materials', percent: 35 },
      { category: 'Solar Installation', percent: 20 },
      { category: 'Biodegradable Idol', percent: 20 },
      { category: 'Green Programs', percent: 15 },
      { category: 'Prasad (Organic)', percent: 10 }
    ],
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  }
];

const donationAmounts = [500, 1100, 2500, 5000, 11000, 25000, 51000];

const PandalDonations: React.FC = () => {
  const [selectedPandal, setSelectedPandal] = useState(pandals[0]);
  const [selectedAmount, setSelectedAmount] = useState(1100);
  const [customAmount, setCustomAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [donationComplete, setDonationComplete] = useState(false);
  const [showTransparency, setShowTransparency] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [donationTxHash, setDonationTxHash] = useState<string | null>(null);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'gateway' | 'crypto'>('gateway');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);

  // Check wallet connection on mount
  useEffect(() => {
    const checkWallet = async () => {
      const walletState = blockchainService.getWalletState();
      if (walletState.isConnected && walletState.address) {
        setWalletConnected(true);
      }
    };
    checkWallet();
  }, []);

  const progress = (selectedPandal.raisedAmount / selectedPandal.goalAmount) * 100;
  const donationAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  const handleDonate = async () => {
    if (donationAmount < 100) {
      alert('Minimum donation amount is ₹100');
      return;
    }

    setIsDonating(true);
    setError(null);

    try {
      if (selectedPaymentMethod === 'crypto') {
        // Crypto donation via blockchain
        if (!walletConnected) {
          const walletState = await blockchainService.connectWallet();
          setWalletConnected(true);
          await contractsService.initialize();
        }

        await contractsService.initialize();
        const ethAmount = (donationAmount / 250000).toFixed(6);

        const result = await contractsService.donate({
          pandalId: selectedPandal.id,
          amount: ethAmount,
          message: `Donation of ₹${donationAmount.toLocaleString()} to ${selectedPandal.name}`
        });

        setDonationId(result.donationId.toString());
        setDonationTxHash(result.txHash);
        setDonationComplete(true);
      } else {
        // Traditional payment gateway
        const gateway = selectedGateway || unifiedPaymentService.selectGateway({
          amount: donationAmount,
          currency: 'INR',
          description: `Donation to ${selectedPandal.name}`,
          metadata: {
            pandalId: selectedPandal.id,
            type: 'donation',
          },
        });

        const result = await unifiedPaymentService.processPayment({
          amount: donationAmount,
          currency: 'INR',
          description: `Donation to ${selectedPandal.name}`,
          customerEmail: 'donor@example.com', // Get from user profile
          customerName: 'Donor', // Get from user profile
          metadata: {
            pandalId: selectedPandal.id,
            type: 'donation',
            pandalName: selectedPandal.name,
          },
          gateway,
        });

        if (result.checkoutUrl || result.redirectUrl) {
          window.location.href = result.checkoutUrl || result.redirectUrl || '';
        } else {
          setDonationComplete(true);
          setDonationTxHash(result.paymentId);
        }
      }
    } catch (error: any) {
      console.error('Donation failed:', error);
      setError(error.message || 'Failed to make donation');
      alert('Donation failed: ' + (error.message || error));
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-durga-500 to-kolkata-sindoor rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <DurgaIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
                Smart{' '}
                <AnimatedGradientText className="text-3xl">Pandal Donations</AnimatedGradientText>
                {' '}🪔
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Transparent blockchain-verified donations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Total Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-durga-100 dark:bg-durga-900/30 text-durga-700 dark:text-durga-300 rounded-xl">
                <Heart className="w-4 h-4" />
                <span>₹85L+ Raised</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl">
                <Users className="w-4 h-4" />
                <span>1,599 Donors</span>
              </div>
            </div>

            {/* Network */}
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-800">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Polygon</span>
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Trust Banner */}
      <BlurFade delay={0.15} inView>
        <div className="bg-gradient-to-r from-durga-50 to-kolkata-yellow/10 dark:from-durga-900/20 dark:to-kolkata-yellow/5 rounded-2xl p-4 border border-durga-200 dark:border-durga-800">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: Shield, label: '100% Verified Pandals' },
              { icon: Eye, label: 'Full Transparency' },
              { icon: FileText, label: 'On-chain Receipts' },
              { icon: Gift, label: 'Donor Perks' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-durga-700 dark:text-durga-300">
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* Pandal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pandal List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pandals.map((pandal, index) => {
              const isSelected = selectedPandal.id === pandal.id;
              const pandalProgress = (pandal.raisedAmount / pandal.goalAmount) * 100;

              return (
                <BlurFade key={pandal.id} delay={0.1 * index} inView>
                  <MagicCard 
                    gradientColor={isSelected ? '#E23D28' : '#FFB800'} 
                    gradientOpacity={0.1}
                    className="cursor-pointer"
                    onClick={() => setSelectedPandal(pandal)}
                  >
                    <div className={`relative ${isSelected ? 'ring-2 ring-durga-500' : ''}`}>
                      {isSelected && <BorderBeam size={200} duration={15} colorFrom="#E23D28" colorTo="#FFB800" />}
                      
                      {/* Image */}
                      <div className="relative h-40 rounded-t-xl overflow-hidden">
                        <img
                          src={pandal.image}
                          alt={pandal.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {pandal.verified && (
                            <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                          <span className="px-2 py-1 bg-durga-500 text-white rounded-full text-xs font-bold">
                            {pandal.category}
                          </span>
                        </div>

                        {/* Days Left */}
                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white" />
                          <span className="text-white text-xs">{pandal.daysLeft} days left</span>
                        </div>

                        {/* Info */}
                        <div className="absolute bottom-3 left-3">
                          <h3 className="text-white font-semibold">{pandal.name}</h3>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <MapPin className="w-3 h-3" />
                          <span>{pandal.location}</span>
                          <span>•</span>
                          <span>Est. {pandal.established}</span>
                        </div>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold text-durga-600">₹{(pandal.raisedAmount / 100000).toFixed(1)}L</span>
                            <span className="text-gray-500">of ₹{(pandal.goalAmount / 100000).toFixed(1)}L</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pandalProgress}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className="h-full bg-gradient-to-r from-durga-500 to-kolkata-yellow"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{pandal.donors} donors</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-kolkata-yellow text-kolkata-yellow" />
                            <span className="text-sm font-medium">{pandal.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MagicCard>
                </BlurFade>
              );
            })}
          </div>
        </div>

        {/* Donation Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Donation Card */}
            <MagicCard gradientColor="#E23D28" gradientOpacity={0.15}>
              <div className="p-6">
                <BorderBeam size={200} duration={20} colorFrom="#E23D28" colorTo="#FFB800" />

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-durga-500 to-kolkata-sindoor rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                    <DhunuchiIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heritage">
                    {selectedPandal.name}
                  </h2>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-2xl font-bold text-durga-600">
                      ₹{(selectedPandal.raisedAmount / 100000).toFixed(1)}L
                    </span>
                    <span className="text-gray-500">of ₹{(selectedPandal.goalAmount / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-durga-500 to-kolkata-yellow"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{Math.round(progress)}% funded</span>
                    <span>{selectedPandal.daysLeft} days left</span>
                  </div>
                </div>

                {!donationComplete ? (
                  <>
                    {/* Amount Selection */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Select Amount (₹)
                      </p>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {donationAmounts.slice(0, 4).map((amount) => (
                          <button
                            key={amount}
                            onClick={() => {
                              setSelectedAmount(amount);
                              setCustomAmount('');
                            }}
                            className={`py-2 rounded-xl text-sm font-bold transition-all ${
                              selectedAmount === amount && !customAmount
                                ? 'bg-durga-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-durga-100'
                            }`}
                          >
                            {amount >= 1000 ? `${amount/1000}K` : amount}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {donationAmounts.slice(4).map((amount) => (
                          <button
                            key={amount}
                            onClick={() => {
                              setSelectedAmount(amount);
                              setCustomAmount('');
                            }}
                            className={`py-2 rounded-xl text-sm font-bold transition-all ${
                              selectedAmount === amount && !customAmount
                                ? 'bg-durga-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-durga-100'
                            }`}
                          >
                            {amount/1000}K
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Or enter custom amount"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-center font-bold"
                      />
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-6">
                      <PaymentMethodSelector
                        selectedMethod={selectedPaymentMethod}
                        selectedGateway={selectedGateway}
                        onMethodChange={setSelectedPaymentMethod}
                        onGatewayChange={setSelectedGateway}
                        amount={donationAmount}
                        currency="INR"
                      />
                    </div>

                    {/* Donate Button */}
                    <ShimmerButton
                      className="w-full py-4"
                      background="linear-gradient(135deg, #E23D28 0%, #FFB800 100%)"
                      onClick={handleDonate}
                      disabled={isDonating || donationAmount < 100}
                    >
                      {isDonating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>
                            {selectedPaymentMethod === 'crypto' 
                              ? 'Processing on Blockchain...' 
                              : 'Processing Donation...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5" />
                          <span>
                            Donate ₹{donationAmount?.toLocaleString() || 0}
                            {selectedPaymentMethod === 'gateway' && selectedGateway && (
                              <span className="text-xs ml-2 opacity-75">
                                via {unifiedPaymentService.getGatewayName(selectedGateway)}
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </ShimmerButton>

                    {/* Perks */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Donor Perks:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPandal.perks.slice(0, 2).map((perk, index) => (
                          <span key={index} className="px-2 py-1 bg-kolkata-yellow/20 text-kolkata-terracotta text-xs rounded-full">
                            {perk}
                          </span>
                        ))}
                        {selectedPandal.perks.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-full">
                            +{selectedPandal.perks.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Donation Successful! 🙏
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You donated ₹{donationAmount.toLocaleString()} to {selectedPandal.name}
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        0x9f8e7d6c5b4a3210...8c9d
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center gap-1 text-sm">
                        <Download className="w-4 h-4" />
                        Receipt
                      </button>
                      <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center gap-1 text-sm">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                    <button
                      onClick={() => setDonationComplete(false)}
                      className="mt-4 text-durga-500 text-sm underline"
                    >
                      Donate Again
                    </button>
                  </div>
                )}
              </div>
            </MagicCard>

            {/* Transparency Button */}
            <button
              onClick={() => setShowTransparency(!showTransparency)}
              className="w-full py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-durga-500" />
                <span className="font-medium">View Fund Transparency</span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${showTransparency ? 'rotate-180' : ''}`} />
            </button>

            {/* Transparency Panel */}
            <AnimatePresence>
              {showTransparency && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <MagicCard gradientColor="#22c55e" gradientOpacity={0.1}>
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-500" />
                        Fund Allocation
                      </h3>
                      <div className="space-y-3">
                        {selectedPandal.expenditure.map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">{item.category}</span>
                              <span className="font-medium text-gray-900 dark:text-white">{item.percent}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-300">
                          ✓ All transactions are recorded on-chain for full transparency
                        </p>
                      </div>
                    </div>
                  </MagicCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Donors */}
            <MagicCard gradientColor="#D4A015" gradientOpacity={0.1}>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-kolkata-yellow" />
                  Recent Donations
                </h3>
                <div className="space-y-3">
                  {selectedPandal.recentDonors.map((donor, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-durga-100 dark:bg-durga-900/30 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-durga-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{donor.name}</p>
                          <p className="text-xs text-gray-500">{donor.time}</p>
                        </div>
                      </div>
                      <span className="font-bold text-durga-600">₹{donor.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PandalDonations;


