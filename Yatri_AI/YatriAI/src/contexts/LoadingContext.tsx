import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  progress: number;
  showProgress: boolean;
  setLoading: (loading: boolean, text?: string) => void;
  setProgress: (progress: number) => void;
  setShowProgress: (show: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [progress, setProgressState] = useState(0);
  const [showProgress, setShowProgressState] = useState(false);

  const setLoading = (loading: boolean, text?: string) => {
    setIsLoading(loading);
    if (text) {
      setLoadingText(text);
    }
    if (!loading) {
      setProgressState(0);
      setShowProgressState(false);
    }
  };

  const setProgress = (newProgress: number) => {
    setProgressState(Math.min(100, Math.max(0, newProgress)));
  };

  const setShowProgress = (show: boolean) => {
    setShowProgressState(show);
  };

  const value: LoadingContextType = {
    isLoading,
    loadingText,
    progress,
    showProgress,
    setLoading,
    setProgress,
    setShowProgress,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Utility hook for easy loading management
export const useLoadingState = () => {
  const { setLoading, setProgress, setShowProgress } = useLoading();

  const startLoading = (text?: string, withProgress = false) => {
    setLoading(true, text);
    setShowProgress(withProgress);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const updateProgress = (progress: number) => {
    setProgress(progress);
  };

  return {
    startLoading,
    stopLoading,
    updateProgress,
  };
};