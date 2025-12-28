import React, { useState } from 'react';
import { ShoppingCart, Star, Shield, Filter, Search, Heart, Sparkles, Package, TrendingUp, CreditCard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '../../../data/mockData';
import { MagicCard } from '../../magicui/MagicCard';
import { BorderBeam } from '../../magicui/BorderBeam';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';
import { CheckoutModal } from '../../payment';
import { paymentService, type CartItem } from '../../../lib/services/payment.service';
import { isDodoPaymentsConfigured, DodoPaymentsConfig } from '../../../lib/services/config';

const Marketplace: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);

  const categories = [
    { id: 'all', label: 'All Products', count: products.length, icon: '🛍️' },
    { id: 'handicrafts', label: 'Handicrafts', count: 8, icon: '🎨' },
    { id: 'textiles', label: 'Textiles', count: 5, icon: '🧵' },
    { id: 'art', label: 'Art & Sculptures', count: 6, icon: '🗿' },
    { id: 'jewelry', label: 'Tribal Jewelry', count: 4, icon: '💍' },
    { id: 'pottery', label: 'Pottery', count: 3, icon: '🏺' }
  ];

  const sortOptions = [
    { id: 'featured', label: 'Featured' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'newest', label: 'Newest First' }
  ];

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        sellerId: product.seller?.id,
      };
      setCart(prev => [...prev, cartItem]);
    }
    setShowCartPreview(true);
    setTimeout(() => setShowCartPreview(false), 3000);
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutComplete = (result: any) => {
    console.log('✅ Checkout complete:', result);
    // In production, would clear cart after successful payment confirmation
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase().includes(selectedCategory);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Authentic{' '}
                <AnimatedGradientText className="text-3xl">Marketplace</AnimatedGradientText>
                {' '}🏺
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Shop genuine tribal handicrafts from verified local artisans
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 p-3 rounded-xl hover:shadow-lg transition-all"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </motion.button>
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => cart.length > 0 && setIsCheckoutOpen(true)}
                className="relative bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {cartItemCount}
                  </span>
                )}
              </motion.button>

              {/* Cart Preview Popup */}
              <AnimatePresence>
                {showCartPreview && cart.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Cart ({cartItemCount})
                      </h4>
                      <button
                        onClick={() => setShowCartPreview(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {cart.slice(-3).map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-gray-500">{item.quantity} × {paymentService.formatAmount(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Total</span>
                        <span className="font-semibold text-green-600">{paymentService.formatAmount(cartTotal)}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowCartPreview(false);
                          setIsCheckoutOpen(true);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Checkout
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <ShimmerButton className="px-5 py-3">
              <TrendingUp className="w-4 h-4" />
              <span>Become a Seller</span>
            </ShimmerButton>
          </div>
        </div>
      </BlurFade>

      {/* Search and Filters */}
      <BlurFade delay={0.2} inView>
        <MagicCard gradientColor="#f97316" gradientOpacity={0.1}>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for handicrafts, textiles, art..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </motion.button>
              </div>
            </div>
          </div>
        </MagicCard>
      </BlurFade>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="space-y-6">
          <BlurFade delay={0.3} inView>
            <MagicCard gradientColor="#22c55e" gradientOpacity={0.1}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-green-500" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ x: 5 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="font-medium">{category.label}</span>
                        </div>
                        <span className={`text-sm px-2 py-0.5 rounded-full ${
                          selectedCategory === category.id 
                            ? 'bg-white/20' 
                            : 'bg-gray-100 dark:bg-gray-600'
                        }`}>
                          {category.count}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </MagicCard>
          </BlurFade>

          {/* Featured Seller */}
          <BlurFade delay={0.4} inView>
            <MagicCard gradientColor="#8b5cf6" gradientOpacity={0.15}>
              <div className="p-6 relative">
                <BorderBeam size={150} duration={10} colorFrom="#8b5cf6" colorTo="#f97316" />
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  Featured Seller
                </h3>
                <div className="text-center">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 bg-gradient-to-r from-green-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white font-bold text-2xl">TA</span>
                  </motion.div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Tribal Arts Co-op</h4>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">(4.9)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Verified Seller</span>
                  </div>
                  <ShimmerButton className="w-full mt-4 py-2.5" background="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)">
                    View Store
                  </ShimmerButton>
                </div>
              </div>
            </MagicCard>
          </BlurFade>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <BlurFade key={product.id} delay={0.1 * index} inView>
                  <MagicCard 
                    className="group h-full"
                    gradientColor="#22c55e"
                    gradientOpacity={0.1}
                  >
                    <div className="h-full flex flex-col">
                      <div className="relative overflow-hidden rounded-t-2xl">
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleWishlist(product.id)}
                          className={`absolute top-3 right-3 p-2.5 rounded-full transition-all shadow-lg ${
                            wishlist.includes(product.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                        </motion.button>
                        {product.seller.isVerified && (
                          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1 shadow-lg">
                            <Shield className="w-3 h-3" />
                            <span className="font-medium">Verified</span>
                          </div>
                        )}
                        {/* Quick view overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm opacity-0 group-hover:opacity-100 transition-all"
                          >
                            Quick View
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              {product.seller.rating}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            by {product.seller.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div>
                            <span className="text-2xl font-bold text-gradient">
                              ₹{product.price.toLocaleString()}
                            </span>
                            <div className={`text-xs mt-1 font-medium ${
                              product.inStock 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                            </div>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addToCart(product)}
                            disabled={!product.inStock}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </MagicCard>
                </BlurFade>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <BlurFade delay={0.2} inView>
              <MagicCard className="text-center py-16">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🔍
                </motion.div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </MagicCard>
            </BlurFade>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckoutComplete={handleCheckoutComplete}
      />

      {/* Dodo Payments Badge */}
      {isDodoPaymentsConfigured() && (
        <div className="fixed bottom-4 left-4 z-40">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">
              Payments by <span className="font-semibold text-gray-900 dark:text-white">Dodo</span>
              {DodoPaymentsConfig.IS_SANDBOX && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-[10px]">
                  SANDBOX
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
