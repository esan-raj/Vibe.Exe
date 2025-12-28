import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  Train,
  Bus,
  Navigation,
  Utensils,
  Star,
  Users,
  DollarSign,
  Search,
  Route,
  Calculator,
  TrendingDown,
  Zap,
  Loader
} from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import NearbyServicesMap from './NearbyServicesMap';
import BudgetOptimizer from './BudgetOptimizer';
import { costEstimationService, CostEstimationResponse } from '../../../lib/services/costEstimationService';

interface TravelPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  destinations: TravelDestination[];
  budget: number;
  status: 'draft' | 'confirmed' | 'completed';
  createdAt: string;
}

interface TravelDestination {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  visitDate: string;
  visitTime: string;
  duration: number; // in hours
  category: 'heritage' | 'temple' | 'food' | 'shopping' | 'nature';
  priority: 'high' | 'medium' | 'low';
  notes: string;
  nearbyServices: NearbyService[];
  estimatedCost: number;
  photos: string[];
  isVisited: boolean;
}

interface NearbyService {
  id: string;
  name: string;
  type: 'metro' | 'bus' | 'restaurant' | 'hotel' | 'atm' | 'hospital';
  distance: number; // in meters
  rating: number;
  address: string;
  coordinates: { lat: number; lng: number };
  operatingHours: string;
  contact?: string;
}

const TravelPlanningDashboard: React.FC = () => {
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showNearbyServices, setShowNearbyServices] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<TravelDestination | null>(null);
  const [activeView, setActiveView] = useState<'planning' | 'budget'>('planning');
  const [editingDestination, setEditingDestination] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TravelDestination>>({});
  const [editingPlan, setEditingPlan] = useState(false);
  const [planEditForm, setPlanEditForm] = useState<Partial<TravelPlan>>({});
  const [isEstimatingCost, setIsEstimatingCost] = useState(false);
  const [costEstimation, setCostEstimation] = useState<CostEstimationResponse | null>(null);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockPlans: TravelPlan[] = [
      {
        id: '1',
        title: 'Kolkata Heritage Tour',
        description: 'Explore the rich heritage and culture of Kolkata',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        budget: 15000,
        status: 'confirmed',
        createdAt: '2024-01-01',
        destinations: [
          {
            id: '1',
            name: 'Victoria Memorial',
            address: 'Queens Way, Maidan, Kolkata, West Bengal 700071',
            coordinates: { lat: 22.5448, lng: 88.3426 },
            visitDate: '2024-01-15',
            visitTime: '09:00',
            duration: 3,
            category: 'heritage',
            priority: 'high',
            notes: 'Must visit the museum inside. Best time for photography is morning.',
            estimatedCost: 500,
            photos: ['https://images.unsplash.com/photo-1558431382-27e303142255?w=400'],
            isVisited: false,
            nearbyServices: [
              {
                id: '1',
                name: 'Maidan Metro Station',
                type: 'metro',
                distance: 800,
                rating: 4.2,
                address: 'Maidan, Kolkata',
                coordinates: { lat: 22.5448, lng: 88.3426 },
                operatingHours: '06:00 - 22:00',
                contact: '+91-33-2248-3271'
              },
              {
                id: '2',
                name: 'Flurys',
                type: 'restaurant',
                distance: 1200,
                rating: 4.5,
                address: '18, Park St, Kolkata',
                coordinates: { lat: 22.5512, lng: 88.3579 },
                operatingHours: '07:30 - 22:30',
                contact: '+91-33-2249-7664'
              }
            ]
          },
          {
            id: '2',
            name: 'Howrah Bridge',
            address: 'Howrah Bridge, Kolkata, West Bengal',
            coordinates: { lat: 22.5851, lng: 88.3468 },
            visitDate: '2024-01-15',
            visitTime: '16:00',
            duration: 2,
            category: 'heritage',
            priority: 'high',
            notes: 'Best sunset views. Take photos from both sides.',
            estimatedCost: 0,
            photos: ['https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?w=400'],
            isVisited: false,
            nearbyServices: [
              {
                id: '3',
                name: 'Howrah Station',
                type: 'metro',
                distance: 500,
                rating: 4.0,
                address: 'Howrah Station, Howrah',
                coordinates: { lat: 22.5851, lng: 88.3468 },
                operatingHours: '24 hours',
                contact: '+91-33-2660-2222'
              }
            ]
          }
        ]
      }
    ];
    setTravelPlans(mockPlans);
    setSelectedPlan(mockPlans[0]);
  }, []);

  const handleCreatePlan = () => {
    setIsCreating(true);
    setSelectedPlan({
      id: Date.now().toString(),
      title: '',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      budget: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      destinations: []
    });
  };

  const handleSavePlan = () => {
    if (selectedPlan && (isCreating || isEditing || editingPlan)) {
      const updatedPlan = { ...selectedPlan, ...planEditForm };
      
      if (isCreating) {
        setTravelPlans(prev => [...prev, updatedPlan]);
        setIsCreating(false);
      } else {
        setTravelPlans(prev => prev.map(plan => 
          plan.id === selectedPlan.id ? updatedPlan : plan
        ));
        setSelectedPlan(updatedPlan);
      }
      
      setIsEditing(false);
      setEditingPlan(false);
      setPlanEditForm({});
    }
  };

  const handleAddDestination = () => {
    if (selectedPlan) {
      const newDestination: TravelDestination = {
        id: Date.now().toString(),
        name: '',
        address: '',
        coordinates: { lat: 0, lng: 0 },
        visitDate: selectedPlan.startDate,
        visitTime: '09:00',
        duration: 2,
        category: 'heritage',
        priority: 'medium',
        notes: '',
        estimatedCost: 0,
        photos: [],
        isVisited: false,
        nearbyServices: []
      };
      
      setSelectedPlan({
        ...selectedPlan,
        destinations: [...selectedPlan.destinations, newDestination]
      });
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'metro': return <Train className="w-4 h-4" />;
      case 'bus': return <Bus className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'heritage': return 'bg-kolkata-gold text-white';
      case 'temple': return 'bg-durga-500 text-white';
      case 'food': return 'bg-orange-500 text-white';
      case 'shopping': return 'bg-purple-500 text-white';
      case 'nature': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const handleOptimizationApply = (optimization: any) => {
    console.log('Applying optimization:', optimization);
    // Here you would update the travel plan with the optimization
    // For now, just show a success message
    alert(`Optimization applied! You'll save ₹${optimization.savings.toLocaleString()}`);
  };

  // Handle destination editing
  const handleEditDestination = (destination: TravelDestination) => {
    setEditingDestination(destination.id);
    setEditForm({
      name: destination.name,
      address: destination.address,
      visitDate: destination.visitDate,
      visitTime: destination.visitTime,
      duration: destination.duration,
      category: destination.category,
      priority: destination.priority,
      notes: destination.notes,
      estimatedCost: destination.estimatedCost
    });
  };

  const handleSaveDestination = () => {
    if (selectedPlan && editingDestination) {
      const updatedDestinations = selectedPlan.destinations.map(dest => {
        if (dest.id === editingDestination) {
          return { ...dest, ...editForm };
        }
        return dest;
      });

      setSelectedPlan({
        ...selectedPlan,
        destinations: updatedDestinations
      });

      // Update the travel plans list
      setTravelPlans(prev => prev.map(plan => 
        plan.id === selectedPlan.id 
          ? { ...plan, destinations: updatedDestinations }
          : plan
      ));

      setEditingDestination(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingDestination(null);
    setEditForm({});
  };

  const handleDeleteDestination = (destinationId: string) => {
    if (selectedPlan && window.confirm('Are you sure you want to delete this destination?')) {
      const updatedDestinations = selectedPlan.destinations.filter(dest => dest.id !== destinationId);
      
      setSelectedPlan({
        ...selectedPlan,
        destinations: updatedDestinations
      });

      // Update the travel plans list
      setTravelPlans(prev => prev.map(plan => 
        plan.id === selectedPlan.id 
          ? { ...plan, destinations: updatedDestinations }
          : plan
      ));
    }
  };

  // Handle plan editing
  const handleEditPlan = () => {
    if (selectedPlan) {
      setEditingPlan(true);
      setPlanEditForm({
        title: selectedPlan.title,
        description: selectedPlan.description,
        startDate: selectedPlan.startDate,
        endDate: selectedPlan.endDate,
        budget: selectedPlan.budget
      });
    }
  };

  const handleCancelPlanEdit = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingPlan(false);
    setPlanEditForm({});
  };

  // AI Cost Estimation
  const handleEstimateCost = async () => {
    if (!editForm.name || !editForm.category || !editForm.duration) {
      alert('Please fill in destination name, category, and duration for cost estimation.');
      return;
    }

    setIsEstimatingCost(true);
    setCostEstimation(null);

    try {
      const estimation = await costEstimationService.estimateCost({
        destinationName: editForm.name || '',
        address: editForm.address || '',
        category: editForm.category || 'heritage',
        duration: editForm.duration || 2,
        visitTime: editForm.visitTime || '09:00',
        priority: editForm.priority || 'medium',
        groupSize: 2, // Default group size
        travelStyle: 'mid-range' // Default travel style
      });

      setCostEstimation(estimation);
      setEditForm(prev => ({ ...prev, estimatedCost: estimation.estimatedCost }));
      setShowCostBreakdown(true);
    } catch (error) {
      console.error('Cost estimation failed:', error);
      alert('Failed to estimate cost. Please try again or enter manually.');
    } finally {
      setIsEstimatingCost(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Travel Planning Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Plan your perfect journey with detailed itineraries and budget optimization
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreatePlan}
                className="bg-kolkata-yellow hover:bg-kolkata-gold text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New Plan
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
              <button
                onClick={() => setActiveView('planning')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  activeView === 'planning'
                    ? 'bg-white dark:bg-gray-700 text-kolkata-terracotta shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Trip Planning
              </button>
              <button
                onClick={() => setActiveView('budget')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  activeView === 'budget'
                    ? 'bg-white dark:bg-gray-700 text-kolkata-terracotta shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Budget Optimizer
              </button>
            </div>
            
            {selectedPlan && activeView === 'planning' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign className="w-4 h-4" />
                <span>Budget: ₹{selectedPlan.budget.toLocaleString()}</span>
                <button
                  onClick={() => setActiveView('budget')}
                  className="text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <TrendingDown className="w-4 h-4" />
                  Optimize
                </button>
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search travel plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="heritage">Heritage</option>
              <option value="temple">Temples</option>
              <option value="food">Food</option>
              <option value="shopping">Shopping</option>
              <option value="nature">Nature</option>
            </select>
          </div>
        </div>

        {activeView === 'planning' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Travel Plans List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Your Travel Plans
                </h2>
                <div className="space-y-4">
                  {travelPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPlan?.id === plan.id
                          ? 'border-kolkata-yellow bg-kolkata-yellow/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-kolkata-yellow/50'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {plan.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          plan.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {plan.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {plan.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{format(parseISO(plan.startDate), 'MMM dd')} - {format(parseISO(plan.endDate), 'MMM dd')}</span>
                        <span>₹{plan.budget.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Plan Details and Nearby Services */}
            <div className="lg:col-span-2 space-y-6">
              {selectedPlan && (
                <>
                  {/* Plan Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    {editingPlan || isCreating ? (
                      /* Edit Mode for Plan */
                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isCreating ? 'Create New Travel Plan' : 'Edit Travel Plan'}
                          </h2>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSavePlan}
                              className="p-2 text-green-600 hover:text-green-700 transition-colors"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleCancelPlanEdit}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Plan Title
                            </label>
                            <input
                              type="text"
                              value={planEditForm.title || ''}
                              onChange={(e) => setPlanEditForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter plan title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Budget (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={planEditForm.budget || ''}
                              onChange={(e) => setPlanEditForm(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter budget"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={planEditForm.startDate || ''}
                              onChange={(e) => setPlanEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={planEditForm.endDate || ''}
                              onChange={(e) => setPlanEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <textarea
                            value={planEditForm.description || ''}
                            onChange={(e) => setPlanEditForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Describe your travel plan..."
                          />
                        </div>
                      </div>
                    ) : (
                      /* View Mode for Plan */
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {selectedPlan.title || 'New Travel Plan'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                              {selectedPlan.description}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleEditPlan}
                              className="p-2 text-gray-600 hover:text-kolkata-yellow transition-colors"
                              title="Edit Plan"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Plan Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-5 h-5 text-kolkata-yellow" />
                              <span className="font-semibold text-gray-900 dark:text-white">Duration</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              {format(parseISO(selectedPlan.startDate), 'MMM dd')} - {format(parseISO(selectedPlan.endDate), 'MMM dd')}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-5 h-5 text-kolkata-yellow" />
                              <span className="font-semibold text-gray-900 dark:text-white">Budget</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              ₹{selectedPlan.budget.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-5 h-5 text-kolkata-yellow" />
                              <span className="font-semibold text-gray-900 dark:text-white">Destinations</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              {selectedPlan.destinations.length} places
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Destinations Section - Only show in view mode */}
                    {!editingPlan && !isCreating && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Destinations
                          </h3>
                          <button
                            onClick={handleAddDestination}
                            className="bg-kolkata-yellow hover:bg-kolkata-gold text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add Destination
                          </button>
                        </div>

                      <div className="space-y-4">
                        {selectedPlan.destinations.map((destination, index) => (
                          <motion.div
                            key={destination.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                          >
                            {editingDestination === destination.id ? (
                              /* Edit Mode */
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                  <span className="bg-kolkata-yellow text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={editForm.name || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="flex-1 text-lg font-semibold bg-transparent border-b-2 border-kolkata-yellow focus:outline-none text-gray-900 dark:text-white"
                                    placeholder="Destination name"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Address
                                    </label>
                                    <input
                                      type="text"
                                      value={editForm.address || ''}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      placeholder="Enter address"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Category
                                    </label>
                                    <select
                                      value={editForm.category || 'heritage'}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value as any }))}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                      <option value="heritage">Heritage</option>
                                      <option value="temple">Temple</option>
                                      <option value="food">Food</option>
                                      <option value="shopping">Shopping</option>
                                      <option value="nature">Nature</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Visit Date
                                    </label>
                                    <input
                                      type="date"
                                      value={editForm.visitDate || ''}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, visitDate: e.target.value }))}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Visit Time
                                    </label>
                                    <input
                                      type="time"
                                      value={editForm.visitTime || ''}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, visitTime: e.target.value }))}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Duration (hours)
                                    </label>
                                    <input
                                      type="number"
                                      min="0.5"
                                      step="0.5"
                                      value={editForm.duration || ''}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Priority
                                    </label>
                                    <select
                                      value={editForm.priority || 'medium'}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as any }))}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                      <option value="high">High Priority</option>
                                      <option value="medium">Medium Priority</option>
                                      <option value="low">Low Priority</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Estimated Cost (₹)
                                    </label>
                                    <div className="flex gap-2">
                                      <input
                                        type="number"
                                        min="0"
                                        value={editForm.estimatedCost || ''}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) }))}
                                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter cost or use AI estimation"
                                      />
                                      <button
                                        type="button"
                                        onClick={handleEstimateCost}
                                        disabled={isEstimatingCost}
                                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                                        title="AI Cost Estimation"
                                      >
                                        {isEstimatingCost ? (
                                          <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Zap className="w-4 h-4" />
                                        )}
                                        AI
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes
                                  </label>
                                  <textarea
                                    value={editForm.notes || ''}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Add notes about this destination..."
                                  />
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                  <button
                                    onClick={handleSaveDestination}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                  >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* View Mode */
                              <>
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="bg-kolkata-yellow text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                      </span>
                                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {destination.name || 'New Destination'}
                                      </h4>
                                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(destination.category)}`}>
                                        {destination.category}
                                      </span>
                                      <Star className={`w-4 h-4 ${getPriorityColor(destination.priority)}`} />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                      {destination.address}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {format(parseISO(destination.visitDate), 'MMM dd')}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {destination.visitTime}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {destination.duration}h
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        ₹{destination.estimatedCost}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditDestination(destination)}
                                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                      title="Edit Destination"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedDestination(destination);
                                        setShowNearbyServices(true);
                                      }}
                                      className="p-2 text-gray-600 hover:text-kolkata-yellow transition-colors"
                                      title="View Nearby Services"
                                    >
                                      <Navigation className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedDestination(destination);
                                      }}
                                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                      title="Plan Route"
                                    >
                                      <Route className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteDestination(destination.id)}
                                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                      title="Delete Destination"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {destination.notes && (
                                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {destination.notes}
                                    </p>
                                  </div>
                                )}

                                {/* Quick Nearby Services Preview */}
                                {destination.nearbyServices.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {destination.nearbyServices.slice(0, 3).map((service) => (
                                      <div
                                        key={service.id}
                                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                                      >
                                        {getServiceIcon(service.type)}
                                        <span className="text-gray-700 dark:text-gray-300">
                                          {service.name}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                          {service.distance}m
                                        </span>
                                      </div>
                                    ))}
                                    {destination.nearbyServices.length > 3 && (
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        +{destination.nearbyServices.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    )}
                  </div>

                  {/* Nearby Services for Selected Destination */}
                  {selectedDestination && (
                    <NearbyServicesMap
                      location={selectedDestination.coordinates}
                      locationName={selectedDestination.name}
                      onServiceSelect={(service) => {
                        console.log('Selected service:', service);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Budget Optimizer View */
          selectedPlan && (
            <BudgetOptimizer
              totalBudget={selectedPlan.budget}
              onOptimizationApply={handleOptimizationApply}
            />
          )
        )}

        {/* Nearby Services Modal */}
        <AnimatePresence>
          {showNearbyServices && selectedDestination && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowNearbyServices(false)}
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
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Nearby Services - {selectedDestination.name}
                    </h3>
                    <button
                      onClick={() => setShowNearbyServices(false)}
                      className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDestination.nearbyServices.map((service) => (
                      <div
                        key={service.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-kolkata-yellow/10 rounded-lg">
                              {getServiceIcon(service.type)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {service.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {service.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {service.rating}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {service.address}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {service.distance}m away
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {service.operatingHours}
                          </span>
                        </div>

                        {service.contact && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📞 {service.contact}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Cost Estimation Breakdown Modal */}
        <AnimatePresence>
          {showCostBreakdown && costEstimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCostBreakdown(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          AI Cost Estimation
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Powered by Gemini AI • Confidence: {costEstimation.confidence}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCostBreakdown(false)}
                      className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {/* Total Cost */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Estimated Cost</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{costEstimation.estimatedCost.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        For {editForm.duration} hours • {editForm.category} category
                      </p>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Cost Breakdown</h4>
                    <div className="space-y-3">
                      {Object.entries(costEstimation.breakdown).map(([category, amount]) => {
                        if (!amount || amount === 0) return null;
                        
                        const percentage = ((amount / costEstimation.estimatedCost) * 100).toFixed(1);
                        const categoryIcons: Record<string, any> = {
                          entryFee: MapPin,
                          transportation: Train,
                          food: Utensils,
                          shopping: DollarSign,
                          guide: Users,
                          miscellaneous: Star
                        };
                        
                        const IconComponent = categoryIcons[category] || DollarSign;
                        
                        return (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <IconComponent className="w-5 h-5 text-blue-500" />
                              <span className="font-medium text-gray-900 dark:text-white capitalize">
                                {category.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                ₹{amount.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cost Analysis</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {costEstimation.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Money-Saving Tips */}
                  {costEstimation.tips.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Money-Saving Tips</h4>
                      <div className="space-y-2">
                        {costEstimation.tips.map((tip: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowCostBreakdown(false);
                        // Cost is already set in editForm
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      Use This Estimate
                    </button>
                    <button
                      onClick={() => setShowCostBreakdown(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TravelPlanningDashboard;