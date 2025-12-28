import React, { useState, useEffect } from 'react';
import { 
  ChefHat, Clock, Users, Heart, Share2, BookOpen, 
  Play, Volume2, VolumeX, Star, Filter, Search,
  Flame, Sparkles, Globe, Camera, Plus, Bookmark, Trash2, Edit, CheckCircle2, XCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard } from '../../magicui/MagicCard';
import { BorderBeam } from '../../magicui/BorderBeam';
import { ShimmerButton } from '../../magicui/ShimmerButton';
import { AnimatedGradientText } from '../../magicui/AnimatedGradientText';
import { BlurFade } from '../../magicui/BlurFade';
import { RosogollaIcon, FishCurryIcon } from '../../kolkata/KolkataIcons';
import { voiceService, isElevenLabsConfigured } from '../../../lib/services';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

// Heritage Recipes with Family Stories (will be replaced with API data)
const initialRecipes = [
  {
    id: 'recipe-001',
    name: 'Kosha Mangsho',
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&h=500&q=80',
    cookTime: '90 mins',
    servings: 4,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 342,
    heritage: 'Traditional Bengali',
    featured: true,
    familyStory: {
      title: "From Dida's Kitchen",
      storyteller: "Ananya Mukherjee, 34, Kolkata",
      story: "This Kosha Mangsho recipe has been in our family for five generations. My great-great-grandmother first made it during the 1920s in our ancestral home in Murshidabad. The secret, she always said, was patience – the meat must be cooked slowly until it absorbs every drop of the masala. When my grandmother married and moved to Kolkata, she carried this recipe like a treasure. Now, every Sunday, when the aroma of kosha mangsho fills my kitchen, I feel connected to the women who came before me. My daughter, just 8, already knows to check the 'koshano' – the caramelization. The recipe will continue.",
      memories: "I remember Dida saying, 'The best kosha mangsho should be so tender, it falls off the bone when you look at it lovingly.'"
    },
    ingredients: [
      { item: 'Mutton', amount: '750g' },
      { item: 'Onions', amount: '4 large' },
      { item: 'Yogurt', amount: '1 cup' },
      { item: 'Ginger-garlic paste', amount: '3 tbsp' },
      { item: 'Kashmiri red chili', amount: '2 tbsp' },
      { item: 'Garam masala', amount: '1 tsp' },
      { item: 'Mustard oil', amount: '½ cup' }
    ],
    steps: [
      { step: 1, instruction: 'Marinate mutton with yogurt, ginger-garlic paste, and salt for 2 hours' },
      { step: 2, instruction: 'Heat mustard oil until smoking, then cool slightly' },
      { step: 3, instruction: 'Fry sliced onions until deep brown (this is key!)' },
      { step: 4, instruction: 'Add marinated mutton and cook on high for 10 minutes' },
      { step: 5, instruction: 'Lower heat and slow cook for 1 hour until oil separates' }
    ],
    tips: 'The secret is in the "koshano" – the slow caramelization. Never rush this dish.'
  },
  {
    id: 'recipe-002',
    name: 'Rosogolla',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1666190077490-67d0c72a8d37?auto=format&fit=crop&w=800&h=500&q=80',
    cookTime: '45 mins',
    servings: 12,
    difficulty: 'Hard',
    rating: 5.0,
    reviews: 567,
    heritage: 'Kolkata Original',
    featured: true,
    familyStory: {
      title: "The Sweet Memory",
      storyteller: "Debashish Das, 56, North Kolkata",
      story: "My father worked at K.C. Das for 40 years. Growing up, I would visit him at the shop and watch the magic – fresh chhena being kneaded, shaped into balls, and dropped into boiling sugar syrup. The hissing sound, the rising of the rosogollas, the first bite of a fresh one – these are my childhood. When he retired, he taught me the exact technique. 'The chhena must be like a baby's cheek,' he would say, 'soft, smooth, without any grain.' Now I make them for my grandchildren, and they call them 'Dadu's magic balls.'",
      memories: "Father always said, 'A true rosogolla must be spongy enough to squeeze and spring back immediately.'"
    },
    ingredients: [
      { item: 'Full cream milk', amount: '2 liters' },
      { item: 'Lemon juice', amount: '4 tbsp' },
      { item: 'Sugar', amount: '2 cups' },
      { item: 'Water', amount: '6 cups' },
      { item: 'Cardamom', amount: '2-3 pods' },
      { item: 'Rose water', amount: '1 tsp (optional)' }
    ],
    steps: [
      { step: 1, instruction: 'Boil milk, add lemon juice to curdle, strain through muslin' },
      { step: 2, instruction: 'Knead chhena for 8-10 minutes until completely smooth' },
      { step: 3, instruction: 'Make small balls, ensure no cracks' },
      { step: 4, instruction: 'Prepare sugar syrup with cardamom, bring to rolling boil' },
      { step: 5, instruction: 'Add balls, cover and cook for 15 mins on high heat' }
    ],
    tips: 'The kneading is crucial. Under-kneaded chhena will crack; over-kneaded will become hard.'
  },
  {
    id: 'recipe-003',
    name: 'Shorshe Ilish',
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=800&h=500&q=80',
    cookTime: '30 mins',
    servings: 4,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 423,
    heritage: 'Monsoon Delicacy',
    featured: true,
    familyStory: {
      title: "Monsoon Memories",
      storyteller: "Supriya Banerjee, 62, Behala",
      story: "In Bengal, ilish and monsoon are inseparable. My mother would wait for the first big ilish of the season – always bought from our trusted fishmonger who knew exactly which fish had the right amount of fat. The ritual was sacred: fresh ilish, stone-ground mustard, green chilies from our own plant, and the steam rising from the covered pan. When I smell shorshe ilish now, I'm instantly transported to those monsoon afternoons, rain pattering on the window, Ma in the kitchen, and the promise of that first bite.",
      memories: "Ma always said, 'The ilish tells you when it's done – the mustard will glisten like gold.'"
    },
    ingredients: [
      { item: 'Hilsa fish', amount: '4 pieces' },
      { item: 'Mustard seeds', amount: '4 tbsp' },
      { item: 'Green chilies', amount: '6-8' },
      { item: 'Mustard oil', amount: '4 tbsp' },
      { item: 'Turmeric', amount: '1 tsp' },
      { item: 'Salt', amount: 'to taste' }
    ],
    steps: [
      { step: 1, instruction: 'Soak mustard seeds for 30 mins, grind to smooth paste' },
      { step: 2, instruction: 'Marinate fish with turmeric and salt' },
      { step: 3, instruction: 'Lightly fry fish in mustard oil and set aside' },
      { step: 4, instruction: 'Mix mustard paste with water, green chilies, and oil' },
      { step: 5, instruction: 'Add fish, cover and cook on low heat for 10 minutes' }
    ],
    tips: 'Never overcook ilish – it should be just done, flaky and moist.'
  },
  {
    id: 'recipe-004',
    name: 'Mishti Doi',
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&h=500&q=80',
    cookTime: '8 hours (set)',
    servings: 6,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 289,
    heritage: 'Bengali Classic',
    featured: false,
    familyStory: {
      title: "Clay Pot Magic",
      storyteller: "Bimal Ghosh, 70, Shantiniketan",
      story: "My grandmother's mishti doi was legendary in our para (neighborhood). Her secret? The earthen pot. 'The pot breathes,' she would explain, 'it takes the excess water and gives the doi its creamy texture.' Every evening, she would set the doi near the kitchen fire, wrapped in an old shawl. By morning, magic. I still use her 50-year-old recipe and her technique of caramelizing the sugar until it's just copper-colored – not too light, not burnt.",
      memories: "Thamma said, 'The best mishti doi should be so set, you can turn the pot upside down and it won't fall.'"
    },
    ingredients: [
      { item: 'Full cream milk', amount: '1 liter' },
      { item: 'Sugar', amount: '½ cup' },
      { item: 'Yogurt culture', amount: '2 tbsp' },
      { item: 'Cardamom powder', amount: '¼ tsp' }
    ],
    steps: [
      { step: 1, instruction: 'Reduce milk to half by slow boiling' },
      { step: 2, instruction: 'Caramelize sugar until copper colored' },
      { step: 3, instruction: 'Add caramel to hot milk, mix well' },
      { step: 4, instruction: 'Cool to lukewarm, add yogurt culture' },
      { step: 5, instruction: 'Set in earthen pots for 6-8 hours' }
    ],
    tips: 'The earthen pot is essential – it absorbs excess moisture and gives the characteristic texture.'
  }
];

const RecipeVault: React.FC = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState(initialRecipes.map(r => ({ ...r, approved: true, createdBy: 'admin', createdById: 'admin-001' })));
  const [selectedRecipe, setSelectedRecipe] = useState(recipes[0]);
  const [activeTab, setActiveTab] = useState<'story' | 'recipe' | 'video'>('story');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const elevenLabsConfigured = isElevenLabsConfigured();

  // Check if user can create recipes
  const canCreate = user?.role === 'tourist' || user?.role === 'admin';
  // Check if user can delete recipes
  const canDelete = (recipe: any) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'tourist' && recipe.createdById === user?.id) return true;
    return false;
  };
  // Check if user can view recipes (all approved, or own pending)
  const canView = (recipe: any) => {
    if (user?.role === 'admin') return true;
    if (recipe.approved !== false) return true;
    if (recipe.createdById === user?.id) return true;
    return false;
  };
  // Filter recipes based on view permissions
  const viewableRecipes = recipes.filter(canView);

  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      voiceService.stopAudio();
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
          voiceService.playAudio(result.audioUrl, `recipe-${selectedRecipe.id}`, () => setIsSpeaking(false));
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

  const toggleSaved = (recipeId: string) => {
    setSavedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const currentStory = selectedRecipe.familyStory;

  const filteredRecipes = viewableRecipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe || !canDelete(recipe)) {
      alert('You do not have permission to delete this recipe');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Call API to delete recipe
      // await api.deleteRecipe(recipeId);
      setRecipes(recipes.filter(r => r.id !== recipeId));
      if (selectedRecipe.id === recipeId && filteredRecipes.length > 1) {
        setSelectedRecipe(filteredRecipes.find(r => r.id !== recipeId) || filteredRecipes[0]);
      }
      alert('Recipe deleted successfully');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-durga-500 to-kolkata-yellow rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heritage">
                Recipe Heritage{' '}
                <AnimatedGradientText className="text-3xl">Vault</AnimatedGradientText>
                {' '}🍛
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Preserving family recipes & stories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-kolkata-yellow"
              />
            </div>
            {/* Create Button - Visible to tourist and admin */}
            {canCreate && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-durga-500 to-kolkata-yellow text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Recipe</span>
              </motion.button>
            )}
          </div>
        </div>
      </BlurFade>

      {/* Recipe Cards */}
      <BlurFade delay={0.2} inView>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredRecipes.map((recipe) => {
            const isSelected = selectedRecipe.id === recipe.id;
            const isSaved = savedRecipes.includes(recipe.id);

            return (
              <motion.div
                key={recipe.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRecipe(recipe)}
                className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all ${
                  isSelected ? 'ring-4 ring-durga-500 shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="relative h-40">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {/* Save Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaved(recipe.id);
                      }}
                      className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-kolkata-yellow text-kolkata-yellow' : 'text-white'}`} />
                    </button>
                    {/* Delete Button - Visible to admin and recipe creator */}
                    {canDelete(recipe) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(recipe.id);
                        }}
                        className="p-1.5 rounded-full bg-red-500/80 backdrop-blur-sm hover:bg-red-600/80 text-white"
                        title="Delete recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {recipe.featured && (
                      <div className="px-2 py-0.5 bg-durga-500 text-white rounded-full text-xs font-bold">
                        Heritage
                      </div>
                    )}
                    {/* Approval Status */}
                    {user?.role === 'admin' && recipe.approved === false && (
                      <div className="px-2 py-0.5 bg-yellow-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </div>
                    )}
                    {recipe.approved === true && (
                      <div className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm">{recipe.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-white/80 text-xs">
                        <Clock className="w-3 h-3" />
                        {recipe.cookTime}
                      </div>
                      <div className="flex items-center gap-1 text-white/80 text-xs">
                        <Star className="w-3 h-3 fill-kolkata-yellow text-kolkata-yellow" />
                        {recipe.rating}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </BlurFade>

      {/* Selected Recipe Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <MagicCard gradientColor="#E23D28" gradientOpacity={0.15}>
            <div className="relative">
              <BorderBeam size={300} duration={20} colorFrom="#E23D28" colorTo="#FFB800" />

              {/* Cover Image */}
              <div className="relative h-56 rounded-t-xl overflow-hidden">
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                
                <div className="absolute bottom-4 left-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-durga-500 text-white rounded-full text-xs font-medium">
                      {selectedRecipe.category}
                    </span>
                    <span className="px-3 py-1 bg-kolkata-yellow/90 text-gray-900 rounded-full text-xs font-medium">
                      {selectedRecipe.heritage}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white font-heritage">{selectedRecipe.name}</h2>
                </div>

                {/* Voice Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSpeak(currentStory.story)}
                  className={`absolute top-4 right-4 p-3 rounded-full shadow-lg ${
                    isSpeaking 
                      ? 'bg-durga-500 text-white' 
                      : 'bg-white/90 text-durga-500 hover:bg-white'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </motion.button>
              </div>

              <div className="p-6">
                {/* Meta */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Clock className="w-4 h-4 text-durga-500" />
                    <span className="text-sm">{selectedRecipe.cookTime}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Users className="w-4 h-4 text-durga-500" />
                    <span className="text-sm">{selectedRecipe.servings} servings</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Flame className="w-4 h-4 text-durga-500" />
                    <span className="text-sm">{selectedRecipe.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Star className="w-4 h-4 fill-kolkata-yellow text-kolkata-yellow" />
                    <span className="text-sm">{selectedRecipe.rating} ({selectedRecipe.reviews})</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  {(['story', 'recipe', 'video'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                        activeTab === tab
                          ? 'bg-gradient-to-r from-durga-500 to-kolkata-yellow text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {tab === 'story' ? 'Story' : tab === 'recipe' ? 'Recipe' : 'Video'}
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
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-heritage">
                        {currentStory.title}
                      </h3>
                      <p className="text-sm text-durga-500 dark:text-durga-400">
                        — {currentStory.storyteller}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentStory.story}
                      </p>

                      {/* Memory Quote */}
                      <div className="bg-gradient-to-r from-durga-50 to-kolkata-yellow/10 dark:from-durga-900/20 dark:to-kolkata-yellow/5 rounded-xl p-6 border-l-4 border-durga-500">
                        <p className="text-lg italic text-durga-600 dark:text-durga-400">
                          "{currentStory.memories}"
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'recipe' && (
                    <motion.div
                      key="recipe"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Ingredients */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-kolkata-yellow" />
                          Ingredients
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedRecipe.ingredients.map((ing, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <span className="text-gray-700 dark:text-gray-300">
                                {ing.item}
                              </span>
                              <span className="text-sm text-durga-500 font-medium">{ing.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Steps */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-kolkata-yellow" />
                          Instructions
                        </h3>
                        <div className="space-y-4">
                          {selectedRecipe.steps.map((step) => (
                            <div key={step.step} className="flex gap-4">
                              <div className="w-8 h-8 bg-durga-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                {step.step}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">
                                {step.instruction}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="bg-kolkata-yellow/10 rounded-xl p-4 border border-kolkata-yellow/30">
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <Flame className="w-4 h-4 text-durga-500 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Pro Tip:</strong>{' '}
                            {selectedRecipe.tips}
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'video' && (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center"
                    >
                      <div className="text-center">
                        <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Video coming soon</p>
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
            {/* Share - Only show to users who can create */}
            {canCreate && (
              <MagicCard gradientColor="#22c55e" gradientOpacity={0.1}>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Share Your Story
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Help preserve heritage by adding your family recipe and story to the vault.
                  </p>
                  <ShimmerButton
                    className="w-full"
                    background="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Recipe</span>
                  </ShimmerButton>
                </div>
              </MagicCard>
            )}
            
            {/* Admin Approval Actions */}
            {user?.role === 'admin' && selectedRecipe.approved === false && (
              <MagicCard gradientColor="#f59e0b" gradientOpacity={0.1}>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                    Pending Approval
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This recipe is waiting for admin approval.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          // TODO: Call API to approve recipe
                          // await api.approveRecipe(selectedRecipe.id, true);
                          setRecipes(recipes.map(r => 
                            r.id === selectedRecipe.id ? { ...r, approved: true } : r
                          ));
                          setSelectedRecipe({ ...selectedRecipe, approved: true });
                          alert('Recipe approved successfully');
                        } catch (error) {
                          alert('Failed to approve recipe');
                        }
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Reject this recipe?')) {
                          try {
                            // TODO: Call API to reject recipe
                            // await api.approveRecipe(selectedRecipe.id, false);
                            setRecipes(recipes.filter(r => r.id !== selectedRecipe.id));
                            alert('Recipe rejected');
                          } catch (error) {
                            alert('Failed to reject recipe');
                          }
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

            {/* Preservation Badge */}
            <MagicCard gradientColor="#D4A015" gradientOpacity={0.1}>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-kolkata-yellow to-heritage-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Digital Preservation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These recipes are being preserved for future generations.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Globe className="w-4 h-4" />
                  <span>{recipes.length} recipes preserved</span>
                </div>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>

      {/* Create Recipe Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateRecipeModal
            onClose={() => setShowCreateModal(false)}
            onCreate={async (recipeData) => {
              try {
                setIsLoading(true);
                // TODO: Call API to create recipe
                // const response = await api.createRecipe(recipeData);
                const newRecipe = {
                  ...recipeData,
                  id: `recipe-${Date.now()}`,
                  approved: user?.role === 'admin' ? true : false, // Auto-approve for admin
                  createdBy: user?.name || 'Unknown',
                  createdById: user?.id || '',
                  rating: 0,
                  reviews: 0,
                };
                setRecipes([...recipes, newRecipe]);
                setSelectedRecipe(newRecipe);
                setShowCreateModal(false);
                alert(user?.role === 'admin' 
                  ? 'Recipe created and approved!' 
                  : 'Recipe created! Waiting for admin approval.');
              } catch (error) {
                console.error('Error creating recipe:', error);
                alert('Failed to create recipe');
              } finally {
                setIsLoading(false);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Create Recipe Modal Component
const CreateRecipeModal: React.FC<{ onClose: () => void; onCreate: (data: any) => void }> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    image: '',
    cookTime: '',
    servings: '',
    difficulty: 'Medium',
    heritage: 'Traditional Bengali',
    ingredients: [{ item: '', amount: '' }],
    steps: [{ step: 1, instruction: '' }],
    tips: '',
    familyStory: {
      title: '',
      storyteller: '',
      story: '',
      memories: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.image || !formData.cookTime) {
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Recipe</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipe Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl"
              >
                <option>Main Course</option>
                <option>Dessert</option>
                <option>Appetizer</option>
                <option>Beverage</option>
              </select>
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cook Time *</label>
              <input
                type="text"
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                placeholder="90 mins"
                className="w-full px-4 py-2 border rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Servings</label>
              <input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2 border rounded-xl"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Family Story Title</label>
            <input
              type="text"
              value={formData.familyStory.title}
              onChange={(e) => setFormData({
                ...formData,
                familyStory: { ...formData.familyStory, title: e.target.value }
              })}
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Story</label>
            <textarea
              value={formData.familyStory.story}
              onChange={(e) => setFormData({
                ...formData,
                familyStory: { ...formData.familyStory, story: e.target.value }
              })}
              rows={4}
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-durga-500 to-kolkata-yellow text-white rounded-xl"
            >
              Create Recipe
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default RecipeVault;


