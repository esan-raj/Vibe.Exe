import React from 'react';

/**
 * Test component to verify Google Translate functionality
 * This component contains various text elements to test translation
 */
const TranslateTest: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Google Translate Test Page
      </h1>
      
      <div className="space-y-6">
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-kolkata-terracotta">
            Welcome to Kolkata Heritage
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This is a test page to verify that Google Translate is working correctly. 
            The text on this page should be translatable into multiple languages using 
            the translate button in the header or the floating translate button.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Kolkata, formerly known as Calcutta, is the capital of the Indian state of West Bengal. 
            It is a city rich in culture, history, and heritage. From the iconic Howrah Bridge 
            to the magnificent Victoria Memorial, Kolkata offers a unique blend of colonial 
            architecture and modern urban life.
          </p>
        </section>

        <section className="bg-kolkata-cream dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-kolkata-terracotta">
            Cultural Heritage
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Durga Puja - The most celebrated festival in Kolkata</li>
            <li>Bengali Literature - Home to Nobel laureate Rabindranath Tagore</li>
            <li>Traditional Arts - Terracotta work and handloom textiles</li>
            <li>Street Food - Famous for its diverse culinary offerings</li>
            <li>Tram System - One of the oldest operating tram networks in Asia</li>
          </ul>
        </section>

        <section className="bg-gradient-to-r from-kolkata-yellow/20 to-kolkata-terracotta/20 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-kolkata-terracotta">
            Translation Instructions
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              <strong>To test the translation feature:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click the globe icon (🌐) in the header navigation</li>
              <li>Or click the floating translate button in the bottom-right corner</li>
              <li>Select a language from the dropdown menu</li>
              <li>Watch as the entire page content gets translated</li>
              <li>Click "Original (English)" to return to the original text</li>
            </ol>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-kolkata-terracotta">
            Supported Languages
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div>🇮🇳 Hindi (हिन्दी)</div>
            <div>🇧🇩 Bengali (বাংলা)</div>
            <div>🇫🇷 French (Français)</div>
            <div>🇪🇸 Spanish (Español)</div>
            <div>🇸🇦 Arabic (العربية)</div>
            <div>🇩🇪 German (Deutsch)</div>
            <div>🇯🇵 Japanese (日本語)</div>
            <div>🇨🇳 Chinese (中文)</div>
            <div>🇰🇷 Korean (한국어)</div>
            <div>🇵🇹 Portuguese (Português)</div>
            <div>🇷🇺 Russian (Русский)</div>
            <div>🇮🇹 Italian (Italiano)</div>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            And 50+ more languages available through Google Translate
          </p>
        </section>

        <section className="bg-kolkata-cream dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-kolkata-terracotta">
            Technical Details
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              The Google Translate integration uses Google's free web widget API to provide 
              real-time translation of the entire page content. The feature is implemented with:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Custom React components for the UI</li>
              <li>TypeScript for type safety</li>
              <li>Framer Motion for smooth animations</li>
              <li>Tailwind CSS for responsive styling</li>
              <li>Dark mode support</li>
              <li>Mobile-friendly design</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TranslateTest;