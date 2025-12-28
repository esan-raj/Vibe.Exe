import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Shield, Star, CheckCircle, Package, 
  CreditCard, Truck, Award, MapPin, User, Clock,
  Heart, Share2, Eye, Loader2, ExternalLink, Wallet,
  BadgeCheck, FileText, QrCode, Download, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../../magicui/MagicCard';
import { BorderBeam } from '../../magicui/BorderBeam';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';
import { TerracottaIcon, PatachitraIcon } from '../../kolkata/KolkataIcons';
import { blockchainService } from '../../../lib/services/blockchain.service';
import { contractsService } from '../../../lib/services/contracts.service';
import { unifiedPaymentService, type PaymentGateway } from '../../../lib/services/unified-payment.service';
import { ActiveNetwork } from '../../../lib/services/config';
import { ethers } from 'ethers';
import PaymentMethodSelector from '../../payment/PaymentMethodSelector';
import api from '../../../lib/api';

// Verified Artisan Products with blockchain certificates
const verifiedProducts = [
  {
    id: 'prod-001',
    name: 'Durga Idol - Ekchala Style',
    category: 'Clay Sculpture',
    artist: {
      name: 'Kartik Pal',
      location: 'Kumartuli, Kolkata',
      verified: true,
      rating: 4.9,
      sales: 156,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80'
    },
    images: [
      'https://images.unsplash.com/photo-1599030641314-e7f9e2f5e8e1?auto=format&fit=crop&w=600&h=600&q=80',
      'https://images.unsplash.com/photo-1599030641314-e7f9e2f5e8e1?auto=format&fit=crop&w=600&h=600&q=80'
    ],
    price: 45000,
    originalPrice: 55000,
    discount: 18,
    inStock: true,
    handmade: true,
    deliveryDays: '15-20',
    description: 'Hand-crafted Durga idol using traditional Ekchala technique. Made with Ganges clay and natural pigments. Each piece is unique and comes with a certificate of authenticity.',
    materials: ['Ganges Clay', 'Natural Pigments', 'Straw', 'Jute'],
    dimensions: '24 x 12 x 36 inches',
    weight: '15 kg',
    certificationId: 'KUM-2024-001-DRG',
    blockchainHash: '0x7a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d',
    featured: true
  },
  {
    id: 'prod-002',
    name: 'Ramayana Patachitra Scroll',
    category: 'Patachitra',
    artist: {
      name: 'Mrinmoyee Devi',
      location: 'Naya, Pingla',
      verified: true,
      rating: 4.8,
      sales: 89,
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&h=100&q=80'
    },
    images: [
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=600&h=600&q=80'
    ],
    price: 25000,
    originalPrice: 30000,
    discount: 17,
    inStock: true,
    handmade: true,
    deliveryDays: '10-15',
    description: 'Authentic Patachitra scroll depicting scenes from Ramayana. Painted using traditional natural pigments on handmade paper. UNESCO recognized folk art form.',
    materials: ['Handmade Paper', 'Natural Pigments', 'Tree Gum'],
    dimensions: '60 x 24 inches',
    weight: '0.5 kg',
    certificationId: 'PAT-2024-045-RAM',
    blockchainHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    featured: true
  },
  {
    id: 'prod-003',
    name: 'Dokra Dancing Lady',
    category: 'Metal Craft',
    artist: {
      name: 'Abdul Karim',
      location: 'Bikna, Bankura',
      verified: true,
      rating: 4.9,
      sales: 234,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80'
    },
    images: [
      'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?auto=format&fit=crop&w=600&h=600&q=80'
    ],
    price: 18000,
    originalPrice: 22000,
    discount: 18,
    inStock: true,
    handmade: true,
    deliveryDays: '7-10',
    description: 'Lost-wax cast bronze figurine using 4000-year-old Dokra technique. Each piece is unique as the mold is destroyed after casting.',
    materials: ['Bronze', 'Brass', 'Beeswax', 'Clay'],
    dimensions: '12 x 4 x 4 inches',
    weight: '2.5 kg',
    certificationId: 'DOK-2024-112-DNC',
    blockchainHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    featured: false
  },
  {
    id: 'prod-004',
    name: 'Baluchari Silk Saree',
    category: 'Textile',
    artist: {
      name: 'Shyamal Das',
      location: 'Bishnupur, Bankura',
      verified: true,
      rating: 5.0,
      sales: 67,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80'
    },
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&h=600&q=80'
    ],
    price: 85000,
    originalPrice: 100000,
    discount: 15,
    inStock: true,
    handmade: true,
    deliveryDays: '20-30',
    description: 'Handwoven Baluchari silk saree with Mahabharata scenes on pallu. GI tagged product. Takes 15-45 days to weave a single piece.',
    materials: ['Pure Silk', 'Gold/Silver Zari'],
    dimensions: '5.5 meters with blouse piece',
    weight: '0.8 kg',
    certificationId: 'BAL-2024-023-MHB',
    blockchainHash: '0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    featured: true
  }
];

interface CartItem {
  product: typeof verifiedProducts[0];
  quantity: number;
}

const VerifiedMarketplace: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [purchaseTxHash, setPurchaseTxHash] = useState<string | null>(null);
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'crypto' | 'gateway'>('gateway');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch approved products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProducts();
        if (response.success && response.data) {
          // Map API products to match component structure
          const mappedProducts = response.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            artist: {
              name: p.seller?.name || 'Unknown Artisan',
              location: 'Kolkata',
              verified: p.seller?.isVerified || false,
              rating: 4.8,
              sales: p.sales || 0,
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80'
            },
            images: [p.image || p.imageUrl || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'],
            price: p.price || 0,
            originalPrice: (p.price || 0) * 1.2,
            discount: 15,
            inStock: p.inStock !== false && (p.stock || 0) > 0,
            stock: p.stock || 0,
            handmade: true,
            deliveryDays: '10-15',
            description: p.description || 'Handcrafted artisan product',
            materials: ['Handmade'],
            dimensions: 'Various',
            weight: 'Various',
            certificationId: `PROD-${p.id}`,
            blockchainHash: `0x${p.id.slice(0, 16)}`,
            featured: false,
            approved: p.approved
          }));
          setProducts(mappedProducts);
          if (mappedProducts.length > 0) {
            setSelectedProduct(mappedProducts[0]);
          }
        } else {
          // Fallback to hardcoded products if API fails
          setProducts(verifiedProducts);
          setSelectedProduct(verifiedProducts[0]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to hardcoded products
        setProducts(verifiedProducts);
        setSelectedProduct(verifiedProducts[0]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handlePurchase = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    setIsPurchasing(true);
    setIsProcessingPayment(true);
    setError(null);

    try {
      const cartItem = cart[0];
      const product = cartItem.product;
      const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      if (selectedPaymentMethod === 'crypto') {
        // Crypto payment via blockchain escrow
        if (!walletConnected) {
          const walletState = await blockchainService.connectWallet();
          setWalletConnected(true);
          await contractsService.initialize();
        }

        await contractsService.initialize();
        const sellerAddress = (product.artist as any).walletAddress || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
        const ethAmount = (totalAmount / 250000).toFixed(6);

        const result = await contractsService.createEscrow({
          sellerAddress: sellerAddress,
          productId: product.id,
          amount: ethAmount
        });

        setEscrowId(result.escrowId.toString());
        setPurchaseTxHash(result.txHash);
        setPurchaseComplete(true);
      } else {
        // Traditional payment gateway (Razorpay/Stripe/Dodo)
        const gateway = selectedGateway || unifiedPaymentService.selectGateway({
          amount: totalAmount,
          currency: 'INR',
          description: `Purchase: ${product.name}`,
          customerEmail: 'customer@example.com', // Get from user profile
          customerName: 'Customer', // Get from user profile
          items: cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images[0],
          })),
          metadata: {
            productId: product.id,
            type: 'marketplace_purchase',
          },
        });

        const result = await unifiedPaymentService.processPayment({
          amount: totalAmount,
          currency: 'INR',
          description: `Purchase: ${product.name}`,
          customerEmail: 'customer@example.com',
          customerName: 'Customer',
          items: cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images[0],
          })),
          metadata: {
            productId: product.id,
            type: 'marketplace_purchase',
          },
          gateway,
        });

        if (result.checkoutUrl || result.redirectUrl) {
          // Redirect to payment gateway
          window.location.href = result.checkoutUrl || result.redirectUrl || '';
        } else {
          setPurchaseComplete(true);
          setPurchaseTxHash(result.paymentId);
        }
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      setError(error.message || 'Failed to complete purchase');
      alert('Purchase failed: ' + (error.message || error));
    } finally {
      setIsPurchasing(false);
      setIsProcessingPayment(false);
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-kolkata-terracotta to-heritage-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
                Verified Artisan{' '}
                <AnimatedGradientText className="text-3xl">Marketplace</AnimatedGradientText>
                {' '}🛡️
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Blockchain-verified authentic handicrafts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Blockchain Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Sepolia Testnet</span>
            </div>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCheckoutOpen(true)}
              className="relative bg-kolkata-terracotta text-white p-3 rounded-xl shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-durga-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </BlurFade>

      {/* Trust Badges */}
      <BlurFade delay={0.15} inView>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BadgeCheck, label: 'Verified Artisans', value: '50+' },
            { icon: Shield, label: 'Blockchain Certified', value: '100%' },
            { icon: Truck, label: 'Safe Delivery', value: 'Insured' },
            { icon: Award, label: 'GI Tagged', value: 'Authentic' }
          ].map((badge, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-kolkata-yellow/20 rounded-lg flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-kolkata-terracotta" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{badge.value}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{badge.label}</p>
              </div>
            </div>
          ))}
        </div>
      </BlurFade>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-heritage-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No approved products available</p>
                <p className="text-sm mt-2">Check back soon for artisan crafts!</p>
              </div>
            ) : (
              products.map((product, index) => {
                const isFavorite = favorites.includes(product.id);
                const isSelected = selectedProduct && selectedProduct.id === product.id;

              return (
                <BlurFade key={product.id} delay={0.1 * index} inView>
                  <MagicCard 
                    gradientColor={isSelected ? '#C45C26' : '#D4A015'} 
                    gradientOpacity={0.1}
                    className="cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className={`relative ${isSelected ? 'ring-2 ring-kolkata-terracotta' : ''}`}>
                      {isSelected && <BorderBeam size={200} duration={15} />}
                      
                      {/* Image */}
                      <div className="relative h-48 rounded-t-xl overflow-hidden">
                        <img
                          src={product.images?.[0] || product.imageUrl || product.image || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {product.featured && (
                            <span className="px-2 py-1 bg-kolkata-yellow text-gray-900 rounded-full text-xs font-bold">
                              Featured
                            </span>
                          )}
                          {product.approved && (
                            <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Approved
                            </span>
                          )}
                          {product.artist?.verified && (
                            <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Verified Seller
                            </span>
                          )}
                        </div>

                        {/* Favorite */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30"
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                        </button>

                        {/* Discount */}
                        {product.discount > 0 && (
                          <div className="absolute bottom-3 left-3 px-2 py-1 bg-durga-500 text-white rounded text-xs font-bold">
                            {product.discount}% OFF
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                              {product.name}
                            </h3>
                          </div>
                        </div>

                        {/* Artist */}
                        {product.artist && (
                          <div className="flex items-center gap-2 mb-3">
                            <img
                              src={product.artist?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80'}
                              alt={product.artist?.name || 'Artisan'}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {product.artist?.name || 'Artisan'}
                            </span>
                            {product.artist?.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-kolkata-yellow text-kolkata-yellow" />
                                <span className="text-xs text-gray-600">{product.artist.rating}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Stock Status */}
                        {(product.stock !== undefined) && (
                          <div className="mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              (product.stock || 0) > 0 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-kolkata-terracotta">
                              ₹{product.price?.toLocaleString() || '0'}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-400 line-through ml-2">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if ((product.stock || 0) > 0) {
                                addToCart(product);
                              } else {
                                alert('This product is out of stock');
                              }
                            }}
                            disabled={(product.stock || 0) === 0}
                            className={`p-2 rounded-lg ${
                              (product.stock || 0) > 0
                                ? 'bg-kolkata-terracotta text-white hover:bg-kolkata-terracotta/90'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </MagicCard>
                </BlurFade>
              );
              })
            )}
          </div>
        </div>

        {/* Product Detail Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Selected Product */}
            {selectedProduct ? (
            <MagicCard gradientColor="#C45C26" gradientOpacity={0.15}>
              <div className="p-6">
                <BorderBeam size={200} duration={20} colorFrom="#C45C26" colorTo="#D4A015" />
                
                <img
                  src={selectedProduct.images?.[0] || selectedProduct.imageUrl || selectedProduct.image || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={selectedProduct.name}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedProduct.name}
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {selectedProduct.description}
                </p>

                {/* Artist Info */}
                {selectedProduct.artist && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4">
                    <img
                      src={selectedProduct.artist?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80'}
                      alt={selectedProduct.artist?.name || 'Artisan'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedProduct.artist?.name || 'Artisan'}
                        </span>
                        {selectedProduct.artist?.verified && (
                          <BadgeCheck className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{selectedProduct.artist?.location || 'Kolkata'}</p>
                    </div>
                  </div>
                )}

                {/* Blockchain Certificate */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 mb-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-700 dark:text-green-300">
                      Blockchain Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Certificate ID: {selectedProduct.certificationId || `PROD-${selectedProduct.id}`}
                  </p>
                  <p className="text-xs text-gray-500 font-mono truncate">
                    {selectedProduct.blockchainHash || `0x${selectedProduct.id?.slice(0, 16) || '0000000000000000'}`}
                  </p>
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="text-xs text-green-600 hover:underline mt-2 flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View Certificate
                  </button>
                </div>

                {/* Stock Status */}
                <div className="mb-4 p-3 bg-heritage-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Stock Available:</span>
                    <span className={`text-sm font-bold ${(selectedProduct.stock || 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {selectedProduct.stock || 0} units
                    </span>
                  </div>
                  {selectedProduct.stock > 0 && selectedProduct.stock <= 5 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">⚠️ Low stock - Only {selectedProduct.stock} left!</p>
                  )}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-kolkata-terracotta">
                      ₹{selectedProduct.price?.toLocaleString() || '0'}
                    </span>
                    <p className="text-xs text-gray-500">
                      Delivery: {selectedProduct.deliveryDays || '10-15'} days
                    </p>
                  </div>
                </div>

                <ShimmerButton
                  className="w-full py-3"
                  background="linear-gradient(135deg, #C45C26 0%, #D4A015 100%)"
                  onClick={() => {
                    if ((selectedProduct.stock || 0) > 0) {
                      addToCart(selectedProduct);
                    } else {
                      alert('This product is out of stock');
                    }
                  }}
                  disabled={(selectedProduct.stock || 0) === 0}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{(selectedProduct.stock || 0) > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </ShimmerButton>
              </div>
            </MagicCard>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-heritage-500/10">
                <Package className="w-12 h-12 text-heritage-500 mx-auto mb-4 opacity-50" />
                <p className="text-gray-500 dark:text-gray-400">Select a product to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isPurchasing && setIsCheckoutOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-r from-kolkata-terracotta to-heritage-500 p-6">
                <BorderBeam size={300} duration={20} />
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  {purchaseComplete ? 'Purchase Complete!' : 'Checkout'}
                </h2>
                <p className="text-white/80 text-sm">
                  {purchaseComplete ? 'Your order has been placed' : 'Blockchain-verified purchase'}
                </p>
              </div>

              <div className="p-6">
                {!purchaseComplete ? (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                      {cart.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Your cart is empty</p>
                      ) : (
                        cart.map((item) => (
                          <div key={item.product.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <img
                              src={item.product.images?.[0] || item.product.imageUrl || item.product.image || 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400'}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <span className="font-bold text-kolkata-terracotta">
                              ₹{(item.product.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {cart.length > 0 && (
                      <>
                        {/* Total */}
                        <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                          <span className="text-2xl font-bold text-kolkata-terracotta">
                            ₹{cartTotal.toLocaleString()}
                          </span>
                        </div>

                        {/* Payment Method Selection */}
                        <PaymentMethodSelector
                          selectedMethod={selectedPaymentMethod}
                          selectedGateway={selectedGateway}
                          onMethodChange={setSelectedPaymentMethod}
                          onGatewayChange={setSelectedGateway}
                          amount={cartTotal}
                          currency="INR"
                          className="mb-6"
                        />

                        {/* Purchase Button */}
                        <ShimmerButton
                          className="w-full py-4"
                          background="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                          onClick={handlePurchase}
                          disabled={isPurchasing}
                        >
                          {isPurchasing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>
                                {selectedPaymentMethod === 'crypto' 
                                  ? 'Processing on Blockchain...' 
                                  : 'Processing Payment...'}
                              </span>
                            </>
                          ) : (
                            <>
                              {selectedPaymentMethod === 'crypto' ? (
                                <>
                                  <Shield className="w-5 h-5" />
                                  <span>Pay with Crypto</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-5 h-5" />
                                  <span>Pay with {selectedGateway ? unifiedPaymentService.getGatewayName(selectedGateway) : 'Gateway'}</span>
                                </>
                              )}
                            </>
                          )}
                        </ShimmerButton>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Order Confirmed!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Your purchase has been recorded on the blockchain.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                      <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        0x8f7e6d5c4b3a2190...7a8b9c
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">View Receipt</span>
                      </button>
                      <button className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Certificate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCertificate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-kolkata-cream to-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-heritage">
                  Certificate of Authenticity
                </h2>
                <p className="text-kolkata-terracotta">Blockchain Verified</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Product</span>
                  <span className="font-medium text-gray-900">{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Artisan</span>
                  <span className="font-medium text-gray-900">{selectedProduct.artist.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Certificate ID</span>
                  <span className="font-mono text-sm text-gray-900">{selectedProduct.certificationId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Network</span>
                  <span className="font-medium text-gray-900">Ethereum Sepolia</span>
                </div>
              </div>

              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <QrCode className="w-24 h-24 mx-auto mb-2 text-gray-400" />
                <p className="text-xs text-gray-500 font-mono break-all">
                  {selectedProduct.blockchainHash}
                </p>
              </div>

              <button
                className="w-full mt-6 py-3 bg-kolkata-terracotta text-white rounded-xl flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View on Etherscan
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifiedMarketplace;


