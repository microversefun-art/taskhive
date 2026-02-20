import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '../services/trpc';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  rating: number;
  createdAt: Date;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: async (token) => {
    set({ token });
    if (token) {
      await AsyncStorage.setItem('authToken', token);
    } else {
      await AsyncStorage.removeItem('authToken');
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      // Call OAuth login endpoint
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://3000-i3jh40xel8lwiffmpju7y-3a9f2de9.us1.manus.computer'}/api/oauth/callback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      
      // Store token
      await get().setToken(data.token);

      // Get user info
      const user = await trpcClient.auth.me.query();
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      
      // Call logout endpoint
      await trpcClient.auth.logout.mutate();

      // Clear auth state
      await get().setToken(null);
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });

      // Check if token exists
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      // Get current user
      const user = await trpcClient.auth.me.query();
      set({ user, isAuthenticated: true, token });
    } catch (error) {
      console.error('Auth check error:', error);
      set({ isAuthenticated: false, user: null, token: null });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    try {
      set({ isLoading: true });
      
      const updatedUser = await trpcClient.auth.updateProfile.mutate(data);
      set({ user: updatedUser });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
