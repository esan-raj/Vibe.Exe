import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import api from '../lib/api';
import { n8nService, analyticsService, notificationService } from '../lib/services';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Mock user credentials for development
 * These are used when the backend is not available
 */
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@yatri.ai': {
    password: 'admin123',
    user: {
      id: 'admin-001',
      name: 'Admin User',
      email: 'admin@yatri.ai',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      isVerified: true,
      preferences: {
        interests: ['management', 'analytics'],
        budget: 'luxury',
        travelStyle: 'solo',
        duration: 7
      }
    }
  },
  'john.doe@example.com': {
    password: 'tourist123',
    user: {
      id: 'tourist-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'tourist',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      isVerified: true,
      preferences: {
        interests: ['nature', 'cultural', 'adventure'],
        budget: 'mid-range',
        travelStyle: 'couple',
        duration: 5
      }
    }
  },
  'ravi.kumar@example.com': {
    password: 'guide123',
    user: {
      id: 'guide-001',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@example.com',
      role: 'guide',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
      isVerified: true,
      preferences: {
        interests: ['wildlife', 'nature', 'cultural'],
        budget: 'mid-range',
        travelStyle: 'group',
        duration: 3
      }
    }
  },
  'tribal.crafts@example.com': {
    password: 'seller123',
    user: {
      id: 'seller-001',
      name: 'Tribal Crafts',
      email: 'tribal.crafts@example.com',
      role: 'seller',
      avatar: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=150',
      isVerified: true,
      preferences: {
        interests: ['handicrafts', 'cultural'],
        budget: 'budget',
        travelStyle: 'solo',
        duration: 1
      }
    }
  }
};

// Check if we should use mock authentication (when backend is unavailable)
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

/**
 * Mock login function for development
 */
const mockLogin = async (email: string, password: string, role: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockUser = MOCK_USERS[email.toLowerCase()];
  
  if (!mockUser) {
    throw new Error(`Invalid credentials. Available test accounts:\n• admin@yatri.ai / admin123\n• john.doe@example.com / tourist123\n• ravi.kumar@example.com / guide123\n• tribal.crafts@example.com / seller123`);
  }
  
  if (mockUser.password !== password) {
    throw new Error('Invalid password. Please check your credentials.');
  }
  
  if (mockUser.user.role !== role) {
    throw new Error(`This account is registered as "${mockUser.user.role}", not "${role}". Please select the correct role.`);
  }
  
  // Store mock token
  localStorage.setItem('token', `mock-token-${mockUser.user.id}-${Date.now()}`);
  localStorage.setItem('mock-user', JSON.stringify(mockUser.user));
  
  console.log('%c✅ Mock Login Successful', 'color: #10b981; font-weight: bold;');
  console.log('User:', mockUser.user.name, `(${mockUser.user.role})`);
  
  return mockUser.user;
};

/**
 * Mock register function for development
 */
const mockRegister = async (email: string, password: string, name: string, role: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if email already exists
  if (MOCK_USERS[email.toLowerCase()]) {
    throw new Error('An account with this email already exists. Please login instead.');
  }
  
  // Create new mock user
  const newUser: User = {
    id: `${role}-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    role: role as 'tourist' | 'admin' | 'guide' | 'seller',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    isVerified: false,
    preferences: {
      interests: [],
      budget: 'mid-range',
      travelStyle: 'solo',
      duration: 3
    }
  };
  
  // Store mock token
  localStorage.setItem('token', `mock-token-${newUser.id}-${Date.now()}`);
  localStorage.setItem('mock-user', JSON.stringify(newUser));
  
  console.log('%c✅ Mock Registration Successful', 'color: #10b981; font-weight: bold;');
  console.log('User:', newUser.name, `(${newUser.role})`);
  
  return newUser;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        // Check for mock user first
        const mockUserData = localStorage.getItem('mock-user');
        if (mockUserData && token.startsWith('mock-token-')) {
          try {
            const parsedUser = JSON.parse(mockUserData);
            setUser(parsedUser);
            console.log('%c🔄 Mock Session Restored', 'color: #8b5cf6; font-weight: bold;');
            console.log('User:', parsedUser.name, `(${parsedUser.role})`);
          } catch {
            api.logout();
            localStorage.removeItem('mock-user');
          }
        } else {
          // Try real API
          try {
            const response = await api.getMe();
            if (response.success && response.data) {
              setUser({
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
                avatar: response.data.avatar,
                isVerified: response.data.isVerified,
                preferences: response.data.preferences ? {
                  interests: response.data.preferences.interests || [],
                  budget: response.data.preferences.budget?.replace('_', '-') || 'mid-range',
                  travelStyle: response.data.preferences.travelStyle || 'solo',
                  duration: response.data.preferences.duration || 3
                } : undefined
              });
            }
          } catch (error) {
            // Token is invalid, clear it
            api.logout();
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, role: string) => {
    // Try real API first, fall back to mock if unavailable
    setIsLoading(true);
    try {
      const response = await api.login(email, password, role);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed. Please check your credentials.');
      }

      const userData = response.data.user;
      const loggedInUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar,
        isVerified: userData.isVerified,
        preferences: userData.preferences ? {
          interests: userData.preferences.interests || [],
          budget: userData.preferences.budget?.replace('_', '-') || 'mid-range',
          travelStyle: userData.preferences.travelStyle || 'solo',
          duration: userData.preferences.duration || 3
        } : undefined
      };
      setUser(loggedInUser);

      // Track login analytics
      analyticsService.identify(loggedInUser.id, {
        email: loggedInUser.email,
        name: loggedInUser.name,
        role: loggedInUser.role,
        preferences: loggedInUser.preferences,
      });
      analyticsService.track('login', 'engagement', { role: loggedInUser.role });
    } catch (apiError) {
      // If API fails and mock auth is enabled, try mock login
      if (USE_MOCK_AUTH) {
        console.log('%c🔄 Backend unavailable, using mock authentication', 'color: #f59e0b;');
        const mockUser = await mockLogin(email, password, role);
        setUser(mockUser);

        // Track login analytics for mock user
        analyticsService.identify(mockUser.id, {
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        });
        analyticsService.track('login', 'engagement', { role: mockUser.role, mock: true });
      } else {
        analyticsService.error('login_failed', (apiError as Error).message);
        throw apiError;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    // Try real API first, fall back to mock if unavailable
    try {
      const response = await api.register(email, password, name, role);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Registration failed. Please try again.');
      }

      const userData = response.data.user;
      const registeredUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar,
        isVerified: userData.isVerified,
        preferences: userData.preferences ? {
          interests: userData.preferences.interests || [],
          budget: userData.preferences.budget?.replace('_', '-') || 'mid-range',
          travelStyle: userData.preferences.travelStyle || 'solo',
          duration: userData.preferences.duration || 3
        } : undefined
      };
      setUser(registeredUser);

      // Trigger n8n user registration workflow (welcome email, etc.)
      n8nService.onUserRegistration({
        userId: registeredUser.id,
        email: registeredUser.email,
        name: registeredUser.name,
        role: registeredUser.role as 'tourist' | 'guide' | 'seller' | 'admin',
        registeredAt: new Date().toISOString(),
        preferences: registeredUser.preferences ? {
          interests: registeredUser.preferences.interests,
          language: 'en',
        } : undefined,
      });

      // Track signup analytics
      analyticsService.identify(registeredUser.id, {
        email: registeredUser.email,
        name: registeredUser.name,
        role: registeredUser.role,
        createdAt: new Date().toISOString(),
      });
      analyticsService.track('signup', 'conversion', { role: registeredUser.role });

      // Send welcome notification
      notificationService.send({
        userId: registeredUser.id,
        userEmail: registeredUser.email,
        userName: registeredUser.name,
        type: 'system',
        title: 'Welcome to YatriAI! 🎉',
        message: `Hi ${registeredUser.name}! Your account has been created successfully. Start exploring Kolkata's amazing destinations!`,
        priority: 'high',
        actionUrl: '/',
        actionLabel: 'Start Exploring',
      });
    } catch (apiError) {
      // If API fails and mock auth is enabled, try mock registration
      if (USE_MOCK_AUTH) {
        console.log('%c🔄 Backend unavailable, using mock registration', 'color: #f59e0b;');
        const mockUser = await mockRegister(email, password, name, role);
        setUser(mockUser);

        // Track signup analytics for mock user
        analyticsService.identify(mockUser.id, {
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        });
        analyticsService.track('signup', 'conversion', { role: mockUser.role, mock: true });
      } else {
        analyticsService.error('signup_failed', (apiError as Error).message);
        throw apiError;
      }
    }
  };

  const logout = () => {
    // Track logout analytics before clearing user
    if (user) {
      analyticsService.track('logout', 'engagement', { userId: user.id });
    }

    api.logout();
    localStorage.removeItem('mock-user');
    setUser(null);
    console.log('%c👋 Logged out', 'color: #6b7280;');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export mock users for reference
export { MOCK_USERS };
