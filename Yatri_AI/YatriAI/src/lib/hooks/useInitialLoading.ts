import { useState, useEffect } from 'react';

interface UseInitialLoadingOptions {
  minLoadingTime?: number; // Minimum time to show loader (in ms)
  dependencies?: any[]; // Dependencies to wait for
}

export const useInitialLoading = (options: UseInitialLoadingOptions = {}) => {
  const { minLoadingTime = 2000, dependencies = [] } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    let progressInterval: NodeJS.Timeout;

    // Simulate progress
    progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev < 90) {
          return prev + Math.random() * 10;
        }
        return prev;
      });
    }, 100);

    // Check if all dependencies are ready
    const checkDependencies = () => {
      const allReady = dependencies.every(dep => dep !== null && dep !== undefined);
      const timeElapsed = Date.now() - startTime;
      
      if (allReady && timeElapsed >= minLoadingTime) {
        setLoadingProgress(100);
        clearInterval(progressInterval);
        
        // Small delay for smooth completion
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };

    // If no dependencies, just wait for minimum time
    if (dependencies.length === 0) {
      setTimeout(() => {
        setLoadingProgress(100);
        clearInterval(progressInterval);
        setTimeout(() => setIsLoading(false), 300);
      }, minLoadingTime);
    } else {
      // Check dependencies periodically
      const dependencyCheck = setInterval(checkDependencies, 100);
      
      return () => {
        clearInterval(dependencyCheck);
        clearInterval(progressInterval);
      };
    }

    return () => {
      clearInterval(progressInterval);
    };
  }, [minLoadingTime, ...dependencies]);

  return {
    isLoading,
    progress: Math.round(loadingProgress),
    setIsLoading
  };
};

export default useInitialLoading;