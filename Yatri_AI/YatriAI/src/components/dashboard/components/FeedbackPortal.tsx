import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, MessageSquare, ThumbsUp, ThumbsDown, Loader2, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

const FeedbackPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'submit' | 'analytics' | 'history'>('submit');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('platform');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [myFeedbackHistory, setMyFeedbackHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  const feedbackCategories = [
    { id: 'guide', label: 'Guide Service', icon: '👨‍🏫' },
    { id: 'accommodation', label: 'Accommodation', icon: '🏠' },
    { id: 'transport', label: 'Transportation', icon: '🚗' },
    { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
    { id: 'platform', label: 'Platform Experience', icon: '💻' }
  ];

  const sentimentAnalytics = {
    overall: {
      positive: 78,
      neutral: 15,
      negative: 7
    },
    categories: [
      { name: 'Guide Services', positive: 85, negative: 8, trend: 'up' },
      { name: 'Accommodations', positive: 72, negative: 12, trend: 'up' },
      { name: 'Transportation', positive: 68, negative: 15, trend: 'down' },
      { name: 'Marketplace', positive: 80, negative: 10, trend: 'up' },
      { name: 'Platform', positive: 75, negative: 11, trend: 'stable' }
    ]
  };

  const recentFeedback = [
    {
      id: '1',
      category: 'Guide Service',
      rating: 5,
      comment: 'Ravi was an excellent guide! Very knowledgeable about local culture and wildlife.',
      date: '2024-01-15',
      sentiment: 'positive',
      helpful: 12
    },
    {
      id: '2',
      category: 'Accommodation',
      rating: 4,
      comment: 'Clean and comfortable homestay. Great local food and hospitality.',
      date: '2024-01-14',
      sentiment: 'positive',
      helpful: 8
    },
    {
      id: '3',
      category: 'Transportation',
      rating: 3,
      comment: 'Bus was delayed but the driver was courteous. Could improve punctuality.',
      date: '2024-01-13',
      sentiment: 'neutral',
      helpful: 5
    }
  ];

  // Fetch user's feedback history
  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyFeedbackHistory();
    }
  }, [activeTab]);

  const fetchMyFeedbackHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await api.getAllFeedback();
      if (response.success && response.data) {
        // Filter to show only current user's feedback
        const userFeedback = response.data.filter((fb: any) => 
          fb.user?.email === user?.email || fb.userId === user?.id
        );
        setMyFeedbackHistory(userFeedback);
      }
    } catch (error: any) {
      console.error('Failed to fetch feedback history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await api.deleteFeedback(id);
      if (response.success) {
        // Refresh feedback list
        await fetchMyFeedbackHistory();
      }
    } catch (error: any) {
      console.error('Failed to delete feedback:', error);
      alert(error.message || 'Failed to delete feedback');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await api.submitFeedback({
        rating,
        comment: feedback,
        category,
        sentiment: undefined // Can be analyzed on backend
      });

      if (response.success) {
        setSubmitSuccess(true);
        // Reset form
        setRating(0);
        setFeedback('');
        setCategory('platform');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);

        // Refresh history if on history tab
        if (activeTab === 'history') {
          fetchMyFeedbackHistory();
        }
      } else {
        setSubmitError(response.message || 'Failed to submit feedback');
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to submit feedback. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Feedback & Review Portal ⭐
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your experiences and help us improve our services with AI-powered sentiment analysis
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'submit', label: 'Submit Feedback' },
          { id: 'analytics', label: 'Sentiment Analytics' },
          { id: 'history', label: 'My Reviews' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submit Feedback */}
      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Share Your Experience
            </h3>
            
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  What would you like to review?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {feedbackCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        category === cat.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-sm font-medium">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Overall Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-colors ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Needs Improvement'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us about your experience... (AI will analyze sentiment and key themes)"
                  required
                />
              </div>

              {submitSuccess && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Thank you for your feedback! It will be reviewed by our admin team.</span>
                </div>
              )}

              {submitError && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{submitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={rating === 0 || !feedback.trim() || isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-orange-500 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Feedback</span>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {/* Recent Community Feedback */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Community Feedback
              </h3>
              <div className="space-y-4">
                {recentFeedback.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.category}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.sentiment === 'positive' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : item.sentiment === 'negative'
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {item.sentiment}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {item.comment}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{item.date}</span>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{item.helpful}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💡 Feedback Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Be specific about your experience</li>
                <li>• Mention what went well and what could improve</li>
                <li>• Include details about guides, locations, or services</li>
                <li>• Your feedback helps other travelers and improves services</li>
                <li>• AI analyzes sentiment to identify key improvement areas</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Overall Sentiment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              AI Sentiment Analysis Overview
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {sentimentAnalytics.overall.positive}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Positive Feedback</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  {sentimentAnalytics.overall.neutral}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Neutral Feedback</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {sentimentAnalytics.overall.negative}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Negative Feedback</div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Category Performance
              </h4>
              {sentimentAnalytics.categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(category.trend)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${category.positive}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {category.positive}%
                      </span>
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {category.negative}% negative
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🎯 Key Insights
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Guide services consistently receive highest ratings (85% positive)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Transportation punctuality needs improvement (15% negative feedback)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Marketplace authenticity highly appreciated by travelers
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📈 Trending Topics
              </h3>
              <div className="space-y-3">
                {[
                  { topic: 'Local Culture Knowledge', mentions: 45, sentiment: 'positive' },
                  { topic: 'Wildlife Photography', mentions: 32, sentiment: 'positive' },
                  { topic: 'Transport Delays', mentions: 18, sentiment: 'negative' },
                  { topic: 'Authentic Handicrafts', mentions: 28, sentiment: 'positive' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">{item.topic}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {item.mentions} mentions
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Review History
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Your feedback will appear here after submission. Verified feedback will be displayed on the landing page.
            </p>
          </div>
          
          {isLoadingHistory ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {myFeedbackHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    You haven't submitted any feedback yet. Share your experience to help improve our services!
                  </p>
                </div>
              ) : (
                myFeedbackHistory.map((review) => (
                  <div key={review.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {review.category || 'General'}
                          </span>
                          {review.verified && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{review.comment}</p>
                      </div>
                      
                      <div className="text-right ml-4">
                        {review.sentiment && (
                          <span className={`text-xs px-2 py-1 rounded-full block mb-2 ${
                            review.sentiment === 'positive' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : review.sentiment === 'negative'
                              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          }`}>
                            {review.sentiment}
                          </span>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      {!review.verified && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ⏳ Pending admin verification. Once verified, your feedback will be displayed on the landing page.
                        </p>
                      )}
                      <button
                        onClick={() => handleDeleteFeedback(review.id)}
                        disabled={deletingId === review.id}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === review.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackPortal;