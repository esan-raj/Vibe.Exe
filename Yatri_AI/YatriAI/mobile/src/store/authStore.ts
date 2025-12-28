/**
 * Auth Store using Zustand
 * Manages authentication state and user session
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'tourist' | 'admin' | 'guide' | 'seller';
  avatar?: string;
  preferences?: {
    interests: string[];
    budget: 'budget' | 'mid-range' | 'luxury';
    travelStyle: 'solo' | 'couple' | 'family' | 'group';
    duration: number;
  };
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string, role: string) => {
        try {
          const response = await apiClient.login(email, password, role);
          
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Login failed');
          }

          const userData = response.data.user as User;
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, role: string) => {
        try {
          const response = await apiClient.register(email, password, name, role);
          
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Registration failed');
          }

          const userData = response.data.user as User;
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await apiClient.logout();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      restoreSession: async () => {
        try {
          const token = await apiClient.getToken();
          if (!token) {
            set({ isLoading: false });
            return;
          }

          const response = await apiClient.getMe();
          if (response.success && response.data) {
            const userData = response.data as User;
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            await apiClient.logout();
            set({ isLoading: false });
          }
        } catch (error) {
          await apiClient.logout();
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

















