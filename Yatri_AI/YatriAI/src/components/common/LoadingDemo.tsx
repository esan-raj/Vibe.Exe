import React from 'react';
import { motion } from 'framer-motion';
import { useInteractiveLoading } from '../../lib/hooks/useInteractiveLoading';

const LoadingDemo: React.FC = () => {
  const { 
    showLoading, 
    showCustomLoading, 
    simulateProgress, 
    stopLoading, 
    heritageLoading,
    withLoading 
  } = useInteractiveLoading();

  // Demo functions
  const demoBasicLoading = () => {
    showLoading('loading');
    setTimeout(stopLoading, 3000);
  };

  const demoProgressLoading = async () => {
    await simulateProgress("🎨 Creating your heritage experience...", 4000);
  };

  const demoHeritageLoading = () => {
    heritageLoading.victoria();
    setTimeout(stopLoading, 3000);
  };

  const demoAsyncOperation = async () => {
    await withLoading(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        return "Data loaded successfully!";
      },
      "🏛️ Loading heritage data...",
      false
    );
  };

  const demoButtons = [
    {
      label: "Basic Loading",
      action: demoBasicLoading,
      description: "Simple loading with heritage message"
    },
    {
      label: "Progress Loading",
      action: demoProgressLoading,
      description: "Loading with animated progress bar"
    },
    {
      label: "Heritage Loading",
      action: demoHeritageLoading,
      description: "Victoria Memorial themed loading"
    },
    {
      label: "Async Operation",
      action: demoAsyncOperation,
      description: "Loading wrapper for API calls"
    },
    {
      label: "Custom Message",
      action: () => {
        showCustomLoading("🎭 Preparing your Durga Puja experience...");
        setTimeout(stopLoading, 3000);
      },
      description: "Custom loading message"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Interactive Loading Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test the beautiful loading screens with Kolkata heritage themes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoButtons.map((demo, index) => (
          <motion.div
            key={demo.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {demo.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {demo.description}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={demo.action}
              className="w-full bg-gradient-to-r from-kolkata-yellow to-kolkata-terracotta text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Try It
            </motion.button>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-kolkata-cream to-white dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🎯 Usage Examples
        </h3>
        
        <div className="space-y-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Basic Usage:</h4>
            <code className="text-kolkata-terracotta">
              {`const { showLoading, stopLoading } = useInteractiveLoading();
showLoading('destinations'); // Shows heritage sites loading
setTimeout(stopLoading, 3000);`}
            </code>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">With Progress:</h4>
            <code className="text-kolkata-terracotta">
              {`await simulateProgress("🎨 Creating experience...", 4000);`}
            </code>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Heritage Themed:</h4>
            <code className="text-kolkata-terracotta">
              {`heritageLoading.victoria(); // Victoria Memorial theme
heritageLoading.pujo();     // Durga Puja theme`}
            </code>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Async Wrapper:</h4>
            <code className="text-kolkata-terracotta">
              {`const result = await withLoading(
  () => api.getDestinations(),
  "🏛️ Loading heritage sites..."
);`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDemo;