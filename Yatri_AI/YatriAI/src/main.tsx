import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/rtl.css';

// Initialize i18next
import './lib/i18n';

// Register service worker for offline translation support
import { registerServiceWorker } from './lib/i18n/serviceWorker';

// Lazy load main App for better performance
const App = lazy(() => import('./App.tsx'));

// Register SW in production
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Simple loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading YatriAI...</p>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </StrictMode>
);
