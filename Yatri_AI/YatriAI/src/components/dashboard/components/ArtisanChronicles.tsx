import React, { useState, useEffect } from 'react';
import { 
  User, MapPin, Calendar, Award, Heart, Share2, 
  ChevronRight, Play, ExternalLink, Shield, Star,
  BookOpen, Camera, Clock, Globe, Sparkles, Volume2, Loader2,
  Plus, Trash2, CheckCircle2, XCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../../magicui/MagicCard';
import { BorderBeam } from '../../magicui/BorderBeam';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';
import { TerracottaIcon, PatachitraIcon } from '../../kolkata/KolkataIcons';
import { voiceService, isElevenLabsConfigured } from '../../../lib/services';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

// Artisan data with rich stories (will be replaced with API data)
const initialArtisans = [
  {
    id: 'artisan-001',
    name: 'Kartik Pal',
    craft: 'Kumartuli Clay Idol Making',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1599030641314-e7f9e2f5e8e1?auto=format&fit=crop&w=800&h=400&q=80',
    location: 'Kumartuli, North Kolkata',
    experience: '45 years',
    generation: '5th Generation',
    rating: 4.9,
    reviews: 234,
    featured: true,
    awards: ['National Award 2018', 'State Artisan Award 2015', 'UNESCO Recognition 2020'],
    story: {
      intro: "In the narrow lanes of Kumartuli, where the air is thick with the scent of wet clay and the sound of artisans at work, Kartik Pal continues a tradition that his family has upheld for five generations.",
      journey: "At the age of 8, young Kartik first touched clay under his grandfather's watchful eyes. 'The clay speaks to you,' his grandfather would say, 'you just need to learn its language.' Today, at 65, Kartik has mastered that language, creating Durga idols that are not just sculptures but embodiments of devotion.",
      philosophy: "Unlike modern workshops that use molds, Kartik still follows the traditional 'ekchala' style - each idol carved entirely by hand. 'When I shape Ma Durga's eyes,' he explains, 'I'm not just sculpting clay. I'm giving birth to the divine. Each stroke is a prayer.'",
      legacy: "His workshop has created idols for some of Kolkata's most prestigious Durga Puja pandals. But what gives Kartik the most joy? Teaching his granddaughter the craft, ensuring this 200-year-old tradition lives on.",
      quote: "From clay, I create the Mother."
    },
    products: [
      { name: 'Durga Idol (12 inch)', price: 15000 },
      { name: 'Ganesh Murti', price: 5000 },
      { name: 'Lakshmi-Saraswati Set', price: 12000 }
    ],
    verificationHash: '0x7a8b9c...3d4e5f' // Future blockchain verification
  },
  {
    id: 'artisan-002',
    name: 'Mrinmoyee Devi',
    craft: 'Patachitra Scroll Painting',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&h=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&h=400&q=80',
    location: 'Naya Village, Pingla',
    experience: '35 years',
    generation: '4th Generation',
    rating: 4.8,
    reviews: 189,
    featured: true,
    awards: ['President\'s Award 2019', 'Bengal Craft Master 2017'],
    story: {
      intro: "In the village of Naya, where every wall tells a story through Patachitra paintings, Mrinmoyee Devi is known as the 'Singing Painter' - for she paints while singing the ancient Pater Gaan.",
      journey: "Born into a family of Patuas (scroll painters), Mrinmoyee learned to hold a brush before she could write. Her mother taught her the secret of making natural colors - from burnt earth for red, indigo plants for blue, and tamarind seeds mixed with coconut shell ash for black.",
      philosophy: "Each Patachitra tells a story - from the Ramayana to social messages about the environment. 'My paintings are not just art,' Mrinmoyee explains, 'they are my voice. Through them, I speak about our gods, our struggles, and our hopes.'",
      legacy: "Mrinmoyee has trained over 50 women in her village, creating a cooperative that now exports Patachitra to galleries worldwide. She believes art is not just heritage but livelihood - a way to preserve culture while empowering communities.",
      quote: "I speak through colors."
    },
    products: [
      { name: 'Ramayana Scroll (5 ft)', price: 25000 },
      { name: 'Durga Patachitra', price: 8000 },
      { name: 'Environmental Series', price: 15000 }
    ],
    verificationHash: '0x2b3c4d...8e9f0a'
  },
  {
    id: 'artisan-003',
    name: 'Abdul Karim',
    craft: 'Dokra Metal Craft',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?auto=format&fit=crop&w=800&h=400&q=80',
    location: 'Bikna, Bankura',
    experience: '40 years',
    generation: '6th Generation',
    rating: 4.9,
    reviews: 312,
    featured: true,
    awards: ['Shilp Guru Award 2016', 'National Dokra Master 2020'],
    story: {
      intro: "In the remote village of Bikna, where the ancient lost-wax casting technique has been practiced for over 4,000 years, Abdul Karim keeps alive one of humanity's oldest metal-working traditions.",
      journey: "Dokra craft came to Abdul's family through a Hindu-Muslim collaboration that dates back centuries. 'In our village,' he says with pride, 'we don't see religion in art. The craft belongs to the land, not to any one community.'",
      philosophy: "The lost-wax (cire perdue) technique involves creating a wax model, coating it with clay, melting the wax out, and pouring molten bronze into the hollow. Each piece is unique - once the clay mold breaks, it can never be replicated.",
      legacy: "Abdul's dancing lady figurines and tribal sculptures have found homes in museums from Paris to New York. Yet he still works in his small workshop, heating brass in the same furnace his grandfather used.",
      quote: "Art is born from fire."
    },
    products: [
      { name: 'Dancing Lady (12 inch)', price: 18000 },
      { name: 'Tribal Horse', price: 12000 },
      { name: 'Dokra Jewellery Set', price: 5000 }
    ],
    verificationHash: '0x5e6f7a...1b2c3d'
  },
  {
    id: 'artisan-004',
    name: 'Shyamal Das',
    craft: 'Baluchari Silk Weaving',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&h=400&q=80',
    location: 'Bishnupur, Bankura',
    experience: '50 years',
    generation: '7th Generation',
    rating: 5.0,
    reviews: 456,
    featured: true,
    awards: ['National Award 2010', 'Sant Kabir Award 2015', 'Padma Shri Nominee 2022'],
    story: {
      intro: "In the terracotta town of Bishnupur, where temples tell stories in clay, Shyamal Das weaves stories in silk. His Baluchari sarees are not just garments - they are epics you can wear.",
      journey: "The Baluchari tradition nearly died in the 1950s. Shyamal's grandfather was one of the last master weavers. 'He made me swear,' Shyamal recalls, 'that I would never let this art die. That promise has been my life's purpose.'",
      philosophy: "Each Baluchari saree takes 15-45 days to weave. The pallu (decorative end) depicts scenes from the Ramayana or Mahabharata. 'When a bride wears my saree,' Shyamal says, 'she carries our civilization's stories to her new home.'",
      legacy: "Shyamal has trained hundreds of weavers and fought to get Baluchari its GI (Geographical Indication) tag. His sarees have been worn by Prime Ministers and displayed in the Victoria & Albert Museum.",
      quote: "Every thread holds a story."
    },
    products: [
      { name: 'Ramayana Baluchari Saree', price: 85000 },
      { name: 'Mahabharata Series', price: 120000 },
      { name: 'Contemporary Baluchari', price: 45000 }
    ],
    verificationHash: '0x9a0b1c...4d5e6f'
  }
];

const ArtisanChronicles: React.FC = () => {
  const { user } = useAuth();
  const [artisans, setArtisans] = useState(initialArtisans.map(a => ({ ...a, approved: true, createdBy: 'admin', createdById: 'admin-001' })));
  const [selectedArtisan, setSelectedArtisan] = useState(artisans[0]);
  const [activeTab, setActiveTab] = useState<'story' | 'products' | 'gallery'>('story');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check if user can create artisans
  const canCreate = user?.role === 'admin' || user?.role === 'seller';
  // Check if user can delete artisans
  const canDelete = (artisan: any) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'seller' && artisan.createdById === user?.id) return true;
    return false;
  };
  // Check if user can view artisans (all approved, or own pending)
  const canView = (artisan: any) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'seller' && artisan.createdById === user?.id) return true;
    if (artisan.approved !== false) return true;
    return false;
  };
  // Filter artisans based on view permissions
  const viewableArtisans = artisans.filter(canView);

  const elevenLabsConfigured = isElevenLabsConfigured();

  useEffect(() => {
    const fetchProducts = async () => {
      if (activeTab === 'products') {
        setIsLoadingProducts(true);
        try {
          const response = await api.getProducts();
          if (response.success && response.data) {
            // Filter only approved products
            setApprovedProducts(response.data.filter((p: any) => p.approved !== false));
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setIsLoadingProducts(false);
        }
      }
    };
    fetchProducts();
  }, [activeTab]);

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      voiceService.stopPlayback();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      if (elevenLabsConfigured) {
        const result = await voiceService.textToSpeech(text, {
          language: 'en'
        });
        if (result.audioUrl) {
          await voiceService.playAudio(result.audioUrl);
          setIsSpeaking(false);
        }
      } else {
        voiceService.speakWithBrowserTTS(text, 'en');
        const words = text.split(' ').length;
        const duration = (words / 150) * 60 * 1000;
        setTimeout(() => setIsSpeaking(false), duration);
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const toggleFavorite = (artisanId: string) => {
    setFavorites(prev => 
      prev.includes(artisanId) 
        ? prev.filter(id => id !== artisanId)
        : [...prev, artisanId]
    );
  };

  const currentStory = selectedArtisan.story;

  return (
    <div className="space-y-8">
      {/* Header */}
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-kolkata-terracotta to-heritage-500 rounded-2xl flex items-center justify-center shadow-lg">
              <TerracottaIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
                Artisan{' '}
                <AnimatedGradientText className="text-3xl">Chronicles</AnimatedGradientText>
                {' '}🎨
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Preserving stories of Bengal's master craftspeople
              </p>
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Header Actions */}
      <BlurFade delay={0.15} inView>
        <div className="flex justify-end">
          {canCreate && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-kolkata-terracotta to-heritage-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Artisan</span>
            </motion.button>
          )}
        </div>
      </BlurFade>

      {/* Artisan Cards Grid */}
      <BlurFade delay={0.2} inView>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {viewableArtisans.map((artisan) => {
            const isSelected = selectedArtisan.id === artisan.id;
            const isFavorite = favorites.includes(artisan.id);

            return (
              <motion.div
                key={artisan.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedArtisan(artisan)}
                className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all ${
                  isSelected ? 'ring-4 ring-kolkata-terracotta shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="relative h-40">
                  <img
                    src={artisan.image}
                    alt={artisan.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(artisan.id);
                      }}
                      className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    {/* Delete Button - Visible to admin and artisan creator */}
                    {canDelete(artisan) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this artisan?')) {
                            setArtisans(artisans.filter(a => a.id !== artisan.id));
                            if (selectedArtisan.id === artisan.id && viewableArtisans.length > 1) {
                              setSelectedArtisan(viewableArtisans.find(a => a.id !== artisan.id) || viewableArtisans[0]);
                            }
                          }
                        }}
                        className="p-1.5 rounded-full bg-red-500/80 backdrop-blur-sm hover:bg-red-600/80 text-white"
                        title="Delete artisan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {artisan.featured && (
                      <div className="px-2 py-0.5 bg-kolkata-yellow text-gray-900 rounded-full text-xs font-bold">
                        Featured
                      </div>
                    )}
                    {/* Approval Status */}
                    {user?.role === 'admin' && artisan.approved === false && (
                      <div className="px-2 py-0.5 bg-yellow-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </div>
                    )}
                    {artisan.approved === true && (
                      <div className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm">{artisan.name}</h3>
                    <p className="text-white/70 text-xs mt-1">{artisan.craft}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </BlurFade>

      {/* Selected Artisan Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <MagicCard gradientColor="#C45C26" gradientOpacity={0.15}>
            <div className="relative">
              <BorderBeam size={300} duration={20} colorFrom="#C45C26" colorTo="#D4A015" />

              {/* Cover Image */}
              <div className="relative h-48 rounded-t-xl overflow-hidden">
                <img
                  src={selectedArtisan.coverImage}
                  alt={selectedArtisan.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Profile */}
                <div className="absolute bottom-4 left-6 flex items-end gap-4">
                  <img
                    src={selectedArtisan.image}
                    alt={selectedArtisan.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-white font-heritage">{selectedArtisan.name}</h2>
                  </div>
                </div>

                {/* Voice Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSpeak(currentStory.intro + ' ' + currentStory.journey)}
                  className={`absolute top-4 right-4 p-3 rounded-full shadow-lg ${
                    isSpeaking 
                      ? 'bg-durga-500 text-white' 
                      : 'bg-white/90 text-kolkata-terracotta hover:bg-white'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 text-kolkata-terracotta" />
                    {selectedArtisan.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-kolkata-terracotta" />
                    {selectedArtisan.experience}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 text-kolkata-terracotta" />
                    {selectedArtisan.generation}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Star className="w-4 h-4 fill-kolkata-yellow text-kolkata-yellow" />
                    {selectedArtisan.rating} ({selectedArtisan.reviews})
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  {(['story', 'products', 'gallery'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                        activeTab === tab
                          ? 'bg-gradient-to-r from-kolkata-terracotta to-heritage-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'story' && (
                    <motion.div
                      key="story"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentStory.intro}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentStory.journey}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentStory.philosophy}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentStory.legacy}
                        </p>
                      </div>

                      {/* Quote */}
                      <div className="bg-gradient-to-r from-kolkata-yellow/20 to-kolkata-terracotta/10 rounded-xl p-6 border-l-4 border-kolkata-terracotta">
                        <p className="text-xl italic text-kolkata-terracotta dark:text-kolkata-gold font-heritage">
                          "{currentStory.quote}"
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          — {selectedArtisan.name}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'products' && (
                    <motion.div
                      key="products"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {isLoadingProducts ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-kolkata-terracotta" />
                        </div>
                      ) : approvedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {approvedProducts.map((product, index) => (
                            <motion.div
                              key={product.id || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {product.imageUrl || product.image ? (
                                  <img
                                    src={product.imageUrl || product.image}
                                    alt={product.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                ) : null}
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                    {product.description || 'Handcrafted • Authentic'}
                                  </p>
                                  {product.category && (
                                    <span className="text-xs text-kolkata-terracotta mt-1 inline-block">
                                      {product.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-lg font-bold text-kolkata-terracotta">₹{product.price?.toLocaleString() || '0'}</p>
                                <ShimmerButton 
                                  className="text-xs py-1 px-3 mt-1" 
                                  background="linear-gradient(135deg, #C45C26 0%, #D4A015 100%)"
                                  onClick={() => {
                                    // Navigate to product details or marketplace
                                    window.open(`/marketplace?product=${product.id}`, '_blank');
                                  }}
                                >
                                  View Details
                                </ShimmerButton>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No approved products available yet</p>
                          <p className="text-sm mt-2">Check back soon for artisan crafts!</p>
                        </div>
                      )}
                      {/* Show hardcoded products as fallback if no API products */}
                      {approvedProducts.length === 0 && !isLoadingProducts && selectedArtisan.products && (
                        <div className="space-y-4">
                          {selectedArtisan.products.map((product, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                            >
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Handcrafted • Authentic</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-kolkata-terracotta">₹{product.price.toLocaleString()}</p>
                                <ShimmerButton className="text-xs py-1 px-3 mt-1" background="linear-gradient(135deg, #C45C26 0%, #D4A015 100%)">
                                  Inquire
                                </ShimmerButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'gallery' && (
                    <motion.div
                      key="gallery"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-400" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </MagicCard>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Awards */}
            <MagicCard gradientColor="#D4A015" gradientOpacity={0.1}>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-kolkata-yellow" />
                  Awards & Recognition
                </h3>
                <div className="space-y-3">
                  {selectedArtisan.awards.map((award, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="w-8 h-8 bg-kolkata-yellow/20 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-kolkata-yellow" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{award}</span>
                    </div>
                  ))}
                </div>
              </div>
            </MagicCard>

            {/* Verification */}
            <MagicCard gradientColor="#22c55e" gradientOpacity={0.1}>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  Authenticity Verification
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified Artisan</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    Hash: {selectedArtisan.verificationHash}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Future: Blockchain verification coming soon
                  </p>
                </div>
              </div>
            </MagicCard>

            {/* Contact */}
            <ShimmerButton
              className="w-full py-3"
              background="linear-gradient(135deg, #C45C26 0%, #D4A015 100%)"
            >
              <BookOpen className="w-4 h-4" />
              <span>Contact Artisan</span>
            </ShimmerButton>

            {/* Admin Approval Actions */}
            {user?.role === 'admin' && selectedArtisan.approved === false && (
              <MagicCard gradientColor="#f59e0b" gradientOpacity={0.1}>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                    Pending Approval
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setArtisans(artisans.map(a => 
                          a.id === selectedArtisan.id ? { ...a, approved: true } : a
                        ));
                        setSelectedArtisan({ ...selectedArtisan, approved: true });
                        alert('Artisan approved');
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Reject this artisan?')) {
                          setArtisans(artisans.filter(a => a.id !== selectedArtisan.id));
                          alert('Artisan rejected');
                        }
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <XCircle className="w-4 h-4 inline mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </MagicCard>
            )}
          </div>
        </div>
      </div>

      {/* Create Artisan Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateArtisanModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(artisanData) => {
              const newArtisan = {
                ...artisanData,
                id: `artisan-${Date.now()}`,
                approved: user?.role === 'admin' ? true : false,
                createdBy: user?.name || 'Unknown',
                createdById: user?.id || '',
                rating: 0,
                reviews: 0,
                featured: false,
                awards: [],
                products: [],
                verificationHash: '0x' + Math.random().toString(16).substr(2, 12) + '...'
              };
              setArtisans([...artisans, newArtisan]);
              setSelectedArtisan(newArtisan);
              setShowCreateModal(false);
              alert(user?.role === 'admin' 
                ? 'Artisan created and approved!' 
                : 'Artisan created! Waiting for admin approval.');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Create Artisan Modal Component
const CreateArtisanModal: React.FC<{ onClose: () => void; onCreate: (data: any) => void }> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    craft: '',
    image: '',
    coverImage: '',
    location: '',
    experience: '',
    generation: '',
    story: {
      intro: '',
      journey: '',
      philosophy: '',
      legacy: '',
      quote: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.craft || !formData.image) {
      alert('Please fill in all required fields');
      return;
    }
    onCreate(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Artisan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Craft *</label>
              <input
                type="text"
                value={formData.craft}
                onChange={(e) => setFormData({ ...formData, craft: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Image URL *</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cover Image URL</label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g., 45 years"
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Story Intro</label>
            <textarea
              value={formData.story.intro}
              onChange={(e) => setFormData({
                ...formData,
                story: { ...formData.story, intro: e.target.value }
              })}
              rows={3}
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-kolkata-terracotta to-heritage-500 text-white rounded-xl"
            >
              Create Artisan
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ArtisanChronicles;
