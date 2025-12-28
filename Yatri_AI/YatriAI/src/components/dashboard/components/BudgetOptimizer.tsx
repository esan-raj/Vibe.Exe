import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingDown, 
  PieChart, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Calculator,
  Percent,
  ArrowRight,
  Zap,
  Star,
  Clock,
  Utensils,
  Train,
  Hotel,
  Camera,
  X,
  Settings,
  User,
  Sparkles,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Heart
} from 'lucide-react';

interface UserPreferences {
  transportation: {
    preferred: 'metro' | 'taxi' | 'bus' | 'walking' | 'mixed';
    budget: 'low' | 'medium' | 'high';
    comfort: 'basic' | 'standard' | 'premium';
    speed: 'slow' | 'moderate' | 'fast';
  };
  accommodation: {
    type: 'hostel' | 'budget-hotel' | 'mid-range' | 'luxury' | 'homestay';
    location: 'central' | 'outskirts' | 'heritage-area' | 'business-district';
    amenities: string[];
    budget: 'low' | 'medium' | 'high';
  };
  dining: {
    style: 'street-food' | 'local-restaurants' | 'fine-dining' | 'mixed';
    cuisine: 'bengali' | 'north-indian' | 'international' | 'mixed';
    budget: 'low' | 'medium' | 'high';
    dietary: string[];
  };
  activities: {
    interests: string[];
    budget: 'low' | 'medium' | 'high';
    groupSize: number;
    pace: 'relaxed' | 'moderate' | 'intensive';
  };
  general: {
    travelStyle: 'budget' | 'mid-range' | 'luxury';
    prioritySavings: boolean;
    sustainabilityFocus: boolean;
    localExperience: boolean;
  };
}

interface AIRecommendation {
  id: string;
  category: 'transportation' | 'accommodation' | 'dining' | 'activities' | 'general';
  title: string;
  description: string;
  reasoning: string;
  currentCost: number;
  recommendedCost: number;
  savings: number;
  confidence: number;
  userMatch: number;
  alternatives: RecommendationAlternative[];
  pros: string[];
  cons: string[];
  tips: string[];
}

interface RecommendationAlternative {
  id: string;
  name: string;
  cost: number;
  rating: number;
  description: string;
  matchScore: number;
  availability: 'high' | 'medium' | 'low';
  bookingRequired: boolean;
}

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  estimated: number;
  icon: React.ComponentType<any>;
  color: string;
}



interface OptimizationRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  currentCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercent: number;
  type: 'transport' | 'food' | 'accommodation' | 'activities' | 'shopping';
  priority: 'high' | 'medium' | 'low';
  alternatives: Alternative[];
}

interface Alternative {
  id: string;
  name: string;
  cost: number;
  rating: number;
  description: string;
  pros: string[];
  cons: string[];
}

interface BudgetOptimizerProps {
  totalBudget: number;
  onOptimizationApply: (optimization: OptimizationRecommendation) => void;
}

const BudgetOptimizer: React.FC<BudgetOptimizerProps> = ({
  totalBudget,
  onOptimizationApply
}) => {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationRecommendation[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    transportation: {
      preferred: 'mixed',
      budget: 'medium',
      comfort: 'standard',
      speed: 'moderate'
    },
    accommodation: {
      type: 'mid-range',
      location: 'central',
      amenities: ['wifi', 'breakfast'],
      budget: 'medium'
    },
    dining: {
      style: 'mixed',
      cuisine: 'mixed',
      budget: 'medium',
      dietary: []
    },
    activities: {
      interests: ['heritage', 'culture', 'food'],
      budget: 'medium',
      groupSize: 2,
      pace: 'moderate'
    },
    general: {
      travelStyle: 'mid-range',
      prioritySavings: true,
      sustainabilityFocus: false,
      localExperience: true
    }
  });
  const [showOptimizations, setShowOptimizations] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [budgetHealth, setBudgetHealth] = useState<'good' | 'warning' | 'danger'>('good');
  const [totalSavings, setTotalSavings] = useState(0);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [isAutoOptimizing, setIsAutoOptimizing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [appliedOptimizations, setAppliedOptimizations] = useState<string[]>([]);
  const [savedOptimizations, setSavedOptimizations] = useState<string[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'warning'} | null>(null);

  // Initialize budget categories with mock data
  useEffect(() => {
    const categories: BudgetCategory[] = [
      {
        id: 'transport',
        name: 'Transportation',
        icon: Train,
        allocated: 3000,
        spent: 1200,
        estimated: 2800,
        color: 'bg-blue-500'
      },
      {
        id: 'food',
        name: 'Food & Dining',
        icon: Utensils,
        allocated: 4000,
        spent: 2100,
        estimated: 4500,
        color: 'bg-orange-500'
      },
      {
        id: 'accommodation',
        name: 'Accommodation',
        icon: Hotel,
        allocated: 6000,
        spent: 0,
        estimated: 5500,
        color: 'bg-purple-500'
      },
      {
        id: 'activities',
        name: 'Activities & Tours',
        icon: Camera,
        allocated: 2000,
        spent: 500,
        estimated: 1800,
        color: 'bg-green-500'
      }
    ];

    setBudgetCategories(categories);

    // Calculate budget health
    const totalEstimated = categories.reduce((sum, cat) => sum + cat.estimated, 0);
    if (totalEstimated > totalBudget * 1.1) {
      setBudgetHealth('danger');
    } else if (totalEstimated > totalBudget) {
      setBudgetHealth('warning');
    } else {
      setBudgetHealth('good');
    }

    // Calculate total potential savings from optimization recommendations
    const savings = optimizations.reduce((sum: number, rec: OptimizationRecommendation) => sum + rec.savings, 0);
    setTotalSavings(savings);
  }, [totalBudget]);

  // Generate optimization recommendations
  useEffect(() => {
    const recommendations: OptimizationRecommendation[] = [
      {
        id: '1',
        category: 'Transport',
        title: 'Switch to Metro + Walking',
        description: 'Use metro for long distances and walk for nearby attractions',
        currentCost: 2800,
        optimizedCost: 1800,
        savings: 1000,
        savingsPercent: 36,
        type: 'transport',
        priority: 'high',
        alternatives: [
          {
            id: '1a',
            name: 'Metro Day Pass',
            cost: 100,
            rating: 4.5,
            description: 'Unlimited metro rides for one day',
            pros: ['Air conditioned', 'Fast', 'Reliable'],
            cons: ['Limited routes', 'Crowded during peak hours']
          },
          {
            id: '1b',
            name: 'Tram Heritage Pass',
            cost: 150,
            rating: 4.2,
            description: 'Heritage tram routes with audio guide',
            pros: ['Historic experience', 'Scenic routes', 'Audio guide included'],
            cons: ['Slower than metro', 'Limited routes']
          }
        ]
      },
      {
        id: '2',
        category: 'Food',
        title: 'Mix Fine Dining with Street Food',
        description: 'Balance expensive restaurants with authentic street food experiences',
        currentCost: 4500,
        optimizedCost: 3200,
        savings: 1300,
        savingsPercent: 29,
        type: 'food',
        priority: 'high',
        alternatives: [
          {
            id: '2a',
            name: 'Street Food Tour',
            cost: 800,
            rating: 4.7,
            description: 'Guided street food tour covering 8-10 local delicacies',
            pros: ['Authentic experience', 'Multiple dishes', 'Local guide'],
            cons: ['May not suit all palates', 'Hygiene concerns for some']
          },
          {
            id: '2b',
            name: 'Local Bengali Thali',
            cost: 300,
            rating: 4.4,
            description: 'Traditional Bengali thali at local restaurants',
            pros: ['Complete meal', 'Authentic taste', 'Good value'],
            cons: ['Limited variety', 'May be too spicy']
          }
        ]
      }
    ];

    setOptimizations(recommendations);
  }, []);

  // Generate AI-powered recommendations based on user preferences
  const generateAIRecommendations = async () => {
    setIsGeneratingAI(true);
    
    try {
      // Generate mock AI recommendations based on preferences
      const mockRecommendations: AIRecommendation[] = [
        {
          id: 'ai-1',
          category: 'transportation',
          title: 'Smart Metro + Walking Combination',
          description: 'Use metro for long distances and walk for nearby attractions to save money while experiencing local life',
          reasoning: 'Matches your preference for mixed transportation and moderate comfort while prioritizing savings',
          currentCost: 2800,
          recommendedCost: 1600,
          savings: 1200,
          confidence: 92,
          userMatch: 88,
          alternatives: [
            {
              id: 'alt-1',
              name: 'Metro Day Pass + Heritage Walk',
              cost: 150,
              rating: 4.6,
              description: 'Unlimited metro rides plus guided heritage walking tours',
              matchScore: 90,
              availability: 'high',
              bookingRequired: false
            },
            {
              id: 'alt-2',
              name: 'Tram Heritage Circuit',
              cost: 200,
              rating: 4.4,
              description: 'Historic tram routes covering major heritage sites',
              matchScore: 85,
              availability: 'medium',
              bookingRequired: true
            }
          ],
          pros: ['Significant cost savings', 'Local experience', 'Good exercise', 'Eco-friendly'],
          cons: ['More time consuming', 'Weather dependent'],
          tips: ['Download metro map offline', 'Carry water bottle', 'Wear comfortable shoes']
        },
        {
          id: 'ai-2',
          category: 'dining',
          title: 'Bengali Food Trail Experience',
          description: 'Mix authentic street food with traditional Bengali restaurants for the best cultural and culinary experience',
          reasoning: 'Perfect for your mixed dining preference and local experience focus while staying within medium budget',
          currentCost: 4500,
          recommendedCost: 3200,
          savings: 1300,
          confidence: 89,
          userMatch: 94,
          alternatives: [
            {
              id: 'alt-3',
              name: 'Street Food Walking Tour',
              cost: 800,
              rating: 4.8,
              description: 'Guided tour covering 10+ authentic Bengali street foods',
              matchScore: 95,
              availability: 'high',
              bookingRequired: true
            },
            {
              id: 'alt-4',
              name: 'Traditional Bengali Thali',
              cost: 350,
              rating: 4.5,
              description: 'Complete Bengali meal at local family restaurants',
              matchScore: 88,
              availability: 'high',
              bookingRequired: false
            }
          ],
          pros: ['Authentic experience', 'Great value', 'Cultural immersion', 'Variety of flavors'],
          cons: ['May be spicy', 'Hygiene concerns for some'],
          tips: ['Start with mild dishes', 'Carry hand sanitizer', 'Ask locals for recommendations']
        },
        {
          id: 'ai-3',
          category: 'accommodation',
          title: 'Heritage Homestay in Central Kolkata',
          description: 'Stay with Bengali families in heritage areas for authentic cultural immersion',
          reasoning: 'Aligns with your local experience preference and central location choice while offering significant savings',
          currentCost: 5500,
          recommendedCost: 3800,
          savings: 1700,
          confidence: 85,
          userMatch: 91,
          alternatives: [
            {
              id: 'alt-5',
              name: 'Bengali Heritage Homestay',
              cost: 1200,
              rating: 4.7,
              description: 'Traditional Bengali home with cultural activities and home-cooked meals',
              matchScore: 95,
              availability: 'medium',
              bookingRequired: true
            },
            {
              id: 'alt-6',
              name: 'Colonial Era Guesthouse',
              cost: 1800,
              rating: 4.3,
              description: 'Historic building converted to budget accommodation',
              matchScore: 82,
              availability: 'high',
              bookingRequired: true
            }
          ],
          pros: ['Cultural immersion', 'Home-cooked meals', 'Local insights', 'Great value'],
          cons: ['Less privacy', 'Basic amenities', 'Language barrier possible'],
          tips: ['Learn basic Bengali phrases', 'Respect local customs', 'Participate in family activities']
        }
      ];

      setAiRecommendations(mockRecommendations);
      setShowAIRecommendations(true);
      showNotification('AI recommendations generated based on your preferences!', 'success');
      
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      showNotification('Failed to generate AI recommendations. Please try again.', 'warning');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Update preferences
  const updatePreferences = (category: keyof UserPreferences, updates: any) => {
    setUserPreferences(prev => ({
      ...prev,
      [category]: { ...prev[category], ...updates }
    }));
  };

  const getBudgetHealthColor = () => {
    switch (budgetHealth) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getBudgetHealthIcon = () => {
    switch (budgetHealth) {
      case 'good': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'danger': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const totalEstimated = budgetCategories.reduce((sum, cat) => sum + cat.estimated, 0);
  const budgetUtilization = (totalEstimated / totalBudget) * 100;

  // Show notification
  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Auto-optimize function
  const handleAutoOptimize = async () => {
    setIsAutoOptimizing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Apply all high-priority optimizations automatically
    const highPriorityOptimizations = optimizations.filter(opt => opt.priority === 'high');
    const autoAppliedIds = highPriorityOptimizations.map(opt => opt.id);
    
    setAppliedOptimizations(prev => [...prev, ...autoAppliedIds]);
    
    // Update budget categories with optimized values
    const updatedCategories = budgetCategories.map(category => {
      const categoryOptimizations = highPriorityOptimizations.filter(opt => 
        opt.category.toLowerCase() === category.name.toLowerCase()
      );
      
      if (categoryOptimizations.length > 0) {
        const totalSavings = categoryOptimizations.reduce((sum, opt) => sum + opt.savings, 0);
        return {
          ...category,
          estimated: Math.max(category.estimated - totalSavings, 0)
        };
      }
      return category;
    });
    
    setBudgetCategories(updatedCategories);
    setIsAutoOptimizing(false);
    
    // Show success notification
    const totalAutoSavings = highPriorityOptimizations.reduce((sum, opt) => sum + opt.savings, 0);
    showNotification(
      `Auto-optimization complete! Applied ${highPriorityOptimizations.length} optimizations and saved ₹${totalAutoSavings.toLocaleString()}`,
      'success'
    );
  };

  // Detailed breakdown function
  const handleDetailedBreakdown = () => {
    setShowDetailedBreakdown(!showDetailedBreakdown);
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Budget Optimizer
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Smart recommendations to optimize your travel budget with personalized preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getBudgetHealthIcon()}
            <span className={`font-semibold ${getBudgetHealthColor()}`}>
              {budgetHealth === 'good' ? 'On Track' : 
               budgetHealth === 'warning' ? 'Over Budget' : 'Significantly Over'}
            </span>
          </div>
        </div>

        {/* Budget Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Total Budget</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{totalBudget.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Estimated Cost</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{totalEstimated.toLocaleString()}
            </p>
            <p className={`text-sm ${getBudgetHealthColor()}`}>
              {budgetUtilization.toFixed(1)}% of budget
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Potential Savings</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              ₹{totalSavings.toLocaleString()}
            </p>
            <p className="text-sm text-green-600">
              {((totalSavings / totalEstimated) * 100).toFixed(1)}% reduction
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Optimized Budget</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              ₹{(totalEstimated - totalSavings).toLocaleString()}
            </p>
            <p className="text-sm text-purple-600">
              {(((totalEstimated - totalSavings) / totalBudget) * 100).toFixed(1)}% of budget
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Budget Utilization
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ₹{totalEstimated.toLocaleString()} / ₹{totalBudget.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                budgetHealth === 'good' ? 'bg-green-500' :
                budgetHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            {showPreferences ? 'Hide' : 'Set'} Preferences
          </button>
          <button
            onClick={generateAIRecommendations}
            disabled={isGeneratingAI}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Brain className="w-4 h-4" />
            {isGeneratingAI ? 'Generating...' : 'AI Recommendations'}
          </button>
          <button
            onClick={() => setShowOptimizations(!showOptimizations)}
            className="bg-kolkata-yellow hover:bg-kolkata-gold text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            {showOptimizations ? 'Hide' : 'Show'} Optimizations
          </button>
          <button 
            onClick={handleDetailedBreakdown}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PieChart className="w-4 h-4" />
            Detailed Breakdown
          </button>
          <button 
            onClick={handleAutoOptimize}
            disabled={isAutoOptimizing}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Zap className="w-4 h-4" />
            {isAutoOptimizing ? 'Optimizing...' : 'Auto-Optimize'}
          </button>
        </div>

        {/* Optimizations Display */}
        <AnimatePresence>
          {showOptimizations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Budget Optimization Suggestions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Smart recommendations to optimize your travel budget
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Train className="w-4 h-4 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Transportation</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Switch to metro + walking combination to save ₹3,500
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 font-medium">High Impact</span>
                    <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Hotel className="w-4 h-4 text-purple-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Accommodation</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Consider heritage homestays for authentic experience and ₹6,000 savings
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yellow-600 font-medium">Medium Impact</span>
                    <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="w-4 h-4 text-orange-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Dining</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Mix street food with local restaurants to save ₹2,000
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600 font-medium">High Impact</span>
                    <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-green-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Activities</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Book group tours for popular attractions to save ₹1,500
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600 font-medium">Low Impact</span>
                    <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      Total Potential Savings: ₹13,000
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Apply all suggestions to optimize your budget by 22%
                    </p>
                  </div>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Apply All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detailed Breakdown Modal */}
        <AnimatePresence>
          {showDetailedBreakdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetailedBreakdown(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <PieChart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Detailed Budget Breakdown
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Comprehensive analysis of your travel budget
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetailedBreakdown(false)}
                      className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Budget Summary */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Summary</h4>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Budget:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">₹{totalBudget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Allocated:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">₹{budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Spent:</span>
                            <span className="font-semibold text-orange-600">₹{budgetCategories.reduce((sum, cat) => sum + cat.spent, 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                            <span className="font-semibold text-green-600">₹{(totalBudget - budgetCategories.reduce((sum, cat) => sum + cat.spent, 0)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600 dark:text-gray-400">Budget Utilization:</span>
                            <span className={`font-semibold ${budgetUtilization > 90 ? 'text-red-600' : budgetUtilization > 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {budgetUtilization.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Category Analysis</h4>
                      
                      <div className="space-y-3">
                        {budgetCategories.map((category) => {
                          const IconComponent = category.icon;
                          const spentPercentage = (category.spent / category.allocated) * 100;
                          
                          return (
                            <div key={category.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 bg-gradient-to-r ${category.color} rounded-lg`}>
                                  <IconComponent className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 dark:text-white">{category.name}</h5>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      ₹{category.spent.toLocaleString()} / ₹{category.allocated.toLocaleString()}
                                    </span>
                                    <span className={`font-medium ${spentPercentage > 90 ? 'text-red-600' : spentPercentage > 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                                      {spentPercentage.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-300`}
                                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Smart Recommendations</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-green-800 dark:text-green-200">On Track</span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your spending is within healthy limits. Continue monitoring to stay on budget.
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-blue-800 dark:text-blue-200">Optimize</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Consider our AI recommendations to save up to ₹13,000 on your trip.
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold text-purple-800 dark:text-purple-200">Enhance</span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Set your preferences to get personalized budget optimization suggestions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDetailedBreakdown(false)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Export Report
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreferences(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Travel Preferences
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Customize your preferences for personalized budget optimization
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Transportation Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Transportation</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Mode
                      </label>
                      <select
                        value={userPreferences.transportation.preferred}
                        onChange={(e) => updatePreferences('transportation', { preferred: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="metro">Metro Only</option>
                        <option value="taxi">Taxi/Cab</option>
                        <option value="bus">Bus</option>
                        <option value="walking">Walking + Public Transport</option>
                        <option value="mixed">Mixed (Recommended)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Budget Level
                      </label>
                      <select
                        value={userPreferences.transportation.budget}
                        onChange={(e) => updatePreferences('transportation', { budget: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="low">Low (₹500-1000)</option>
                        <option value="medium">Medium (₹1000-2500)</option>
                        <option value="high">High (₹2500+)</option>
                      </select>
                    </div>
                  </div>

                  {/* Accommodation Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Hotel className="w-5 h-5 text-purple-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Accommodation</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Accommodation Type
                      </label>
                      <select
                        value={userPreferences.accommodation.type}
                        onChange={(e) => updatePreferences('accommodation', { type: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="hostel">Hostel/Backpacker</option>
                        <option value="budget-hotel">Budget Hotel</option>
                        <option value="mid-range">Mid-range Hotel</option>
                        <option value="luxury">Luxury Hotel</option>
                        <option value="homestay">Homestay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Location
                      </label>
                      <select
                        value={userPreferences.accommodation.location}
                        onChange={(e) => updatePreferences('accommodation', { location: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="central">Central Kolkata</option>
                        <option value="heritage-area">Heritage Area</option>
                        <option value="business-district">Business District</option>
                        <option value="outskirts">Outskirts (Budget)</option>
                      </select>
                    </div>
                  </div>

                  {/* Dining Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Utensils className="w-5 h-5 text-orange-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Dining</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dining Style
                      </label>
                      <select
                        value={userPreferences.dining.style}
                        onChange={(e) => updatePreferences('dining', { style: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="street-food">Street Food Focus</option>
                        <option value="local-restaurants">Local Restaurants</option>
                        <option value="fine-dining">Fine Dining</option>
                        <option value="mixed">Mixed Experience</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cuisine Preference
                      </label>
                      <select
                        value={userPreferences.dining.cuisine}
                        onChange={(e) => updatePreferences('dining', { cuisine: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="bengali">Bengali Traditional</option>
                        <option value="north-indian">North Indian</option>
                        <option value="international">International</option>
                        <option value="mixed">Mixed Cuisines</option>
                      </select>
                    </div>
                  </div>

                  {/* General Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="w-5 h-5 text-gray-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">General</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Travel Style
                      </label>
                      <select
                        value={userPreferences.general.travelStyle}
                        onChange={(e) => updatePreferences('general', { travelStyle: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="budget">Budget Traveler</option>
                        <option value="mid-range">Mid-range Comfort</option>
                        <option value="luxury">Luxury Experience</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userPreferences.general.prioritySavings}
                          onChange={(e) => updatePreferences('general', { prioritySavings: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Priority on savings</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userPreferences.general.localExperience}
                          onChange={(e) => updatePreferences('general', { localExperience: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Focus on local experiences</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userPreferences.general.sustainabilityFocus}
                          onChange={(e) => updatePreferences('general', { sustainabilityFocus: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sustainability focus</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    onClick={() => {
                      setShowPreferences(false);
                      showNotification('Preferences saved! Generate AI recommendations for personalized suggestions.', 'success');
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}>
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {notification.type === 'info' && <Clock className="w-5 h-5" />}
              <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreferences(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Travel Preferences
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Customize your preferences for personalized budget optimization
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Transportation Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Transportation</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Mode
                      </label>
                      <select
                        value={userPreferences.transportation.preferred}
                        onChange={(e) => updatePreferences('transportation', { preferred: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="metro">Metro Only</option>
                        <option value="taxi">Taxi/Cab</option>
                        <option value="bus">Bus</option>
                        <option value="walking">Walking + Public Transport</option>
                        <option value="mixed">Mixed (Recommended)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Budget Level
                      </label>
                      <select
                        value={userPreferences.transportation.budget}
                        onChange={(e) => updatePreferences('transportation', { budget: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="low">Low (₹500-1000)</option>
                        <option value="medium">Medium (₹1000-2500)</option>
                        <option value="high">High (₹2500+)</option>
                      </select>
                    </div>
                  </div>

                  {/* Accommodation Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Hotel className="w-5 h-5 text-purple-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Accommodation</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Accommodation Type
                      </label>
                      <select
                        value={userPreferences.accommodation.type}
                        onChange={(e) => updatePreferences('accommodation', { type: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="hostel">Hostel/Backpacker</option>
                        <option value="budget-hotel">Budget Hotel</option>
                        <option value="mid-range">Mid-range Hotel</option>
                        <option value="luxury">Luxury Hotel</option>
                        <option value="homestay">Homestay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Location
                      </label>
                      <select
                        value={userPreferences.accommodation.location}
                        onChange={(e) => updatePreferences('accommodation', { location: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="central">Central Kolkata</option>
                        <option value="heritage-area">Heritage Area</option>
                        <option value="business-district">Business District</option>
                        <option value="outskirts">Outskirts (Budget)</option>
                      </select>
                    </div>
                  </div>

                  {/* Dining Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Utensils className="w-5 h-5 text-orange-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Dining</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dining Style
                      </label>
                      <select
                        value={userPreferences.dining.style}
                        onChange={(e) => updatePreferences('dining', { style: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="street-food">Street Food Focus</option>
                        <option value="local-restaurants">Local Restaurants</option>
                        <option value="fine-dining">Fine Dining</option>
                        <option value="mixed">Mixed Experience</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cuisine Preference
                      </label>
                      <select
                        value={userPreferences.dining.cuisine}
                        onChange={(e) => updatePreferences('dining', { cuisine: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="bengali">Bengali Traditional</option>
                        <option value="north-indian">North Indian</option>
                        <option value="international">International</option>
                        <option value="mixed">Mixed Cuisines</option>
                      </select>
                    </div>
                  </div>

                  {/* General Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="w-5 h-5 text-gray-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">General</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Travel Style
                      </label>
                      <select
                        value={userPreferences.general.travelStyle}
                        onChange={(e) => updatePreferences('general', { travelStyle: e.target.value })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="budget">Budget Traveler</option>
                        <option value="mid-range">Mid-range Comfort</option>
                        <option value="luxury">Luxury Experience</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userPreferences.general.prioritySavings}
                          onChange={(e) => updatePreferences('general', { prioritySavings: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Priority on savings</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userPreferences.general.localExperience}
                          onChange={(e) => updatePreferences('general', { localExperience: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Focus on local experiences</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={userPreferences.general.sustainabilityFocus}
                          onChange={(e) => updatePreferences('general', { sustainabilityFocus: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sustainability focus</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    onClick={() => {
                      setShowPreferences(false);
                      showNotification('Preferences saved! Generate AI recommendations for personalized suggestions.', 'success');
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Recommendations Section */}
      <AnimatePresence>
        {showAIRecommendations && aiRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    AI-Powered Recommendations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Personalized suggestions based on your preferences
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <Brain className="w-5 h-5" />
                <span className="font-semibold">
                  Total Potential Savings: ₹{aiRecommendations.reduce((sum, rec) => sum + rec.savings, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {aiRecommendations.map((recommendation) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recommendation.category === 'transportation' ? 'bg-blue-100 text-blue-800' :
                          recommendation.category === 'accommodation' ? 'bg-purple-100 text-purple-800' :
                          recommendation.category === 'dining' ? 'bg-orange-100 text-orange-800' :
                          recommendation.category === 'activities' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {recommendation.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Match:</span>
                          <div className="flex items-center gap-1">
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-green-500 h-1 rounded-full"
                                style={{ width: `${recommendation.userMatch}%` }}
                              />
                            </div>
                            <span className="text-xs text-green-600 font-medium">{recommendation.userMatch}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <span className="text-xs text-blue-600 font-medium">{recommendation.confidence}%</span>
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {recommendation.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {recommendation.description}
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Why this works for you:</strong> {recommendation.reasoning}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500 line-through">
                          ₹{recommendation.currentCost.toLocaleString()}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="text-lg font-bold text-green-600">
                          ₹{recommendation.recommendedCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="font-semibold">
                          ₹{recommendation.savings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alternatives */}
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                      Recommended Options:
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendation.alternatives.map((alternative) => (
                        <div
                          key={alternative.id}
                          className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium text-gray-900 dark:text-white">
                              {alternative.name}
                            </h6>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {alternative.rating}
                                </span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                alternative.availability === 'high' ? 'bg-green-100 text-green-800' :
                                alternative.availability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {alternative.availability} availability
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {alternative.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-green-600">
                              ₹{alternative.cost.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Match:</span>
                              <span className="text-xs text-green-600 font-medium">{alternative.matchScore}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h6 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        Advantages
                      </h6>
                      <ul className="space-y-1">
                        {recommendation.pros.map((pro, index) => (
                          <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4 text-red-500" />
                        Considerations
                      </h6>
                      <ul className="space-y-1">
                        {recommendation.cons.map((con, index) => (
                          <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                            <div className="w-1 h-1 bg-red-500 rounded-full" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tips */}
                  {recommendation.tips.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mb-4">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Pro Tips
                      </h6>
                      <ul className="space-y-1">
                        {recommendation.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                            <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Apply the recommendation
                        const updatedCategories = budgetCategories.map(category => {
                          if (category.name.toLowerCase().includes(recommendation.category)) {
                            return {
                              ...category,
                              estimated: Math.max(category.estimated - recommendation.savings, 0)
                            };
                          }
                          return category;
                        });
                        setBudgetCategories(updatedCategories);
                        showNotification(`Applied AI recommendation! Saved ₹${recommendation.savings.toLocaleString()}`, 'success');
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Apply Recommendation
                    </button>
                    <button 
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      Save for Later
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetOptimizer;