"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, handleApiError } from './api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  company?: {
    id: string;
    _id?: string; // MongoDB ObjectId format
    name: string;
    logo?: string;
  };
  image?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, companyId?: string) => Promise<boolean | { multipleAccounts: boolean; companies: Array<{ id: string; name: string; logo: string; userId: string }> }>;
  register: (userData: any) => Promise<boolean>;
  logout: (redirectToLogin?: boolean) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const refreshUserInternal = async (forceRefresh: boolean = false) => {
    try {
      // Don't try to refresh user on auth pages or guest video call pages to avoid unnecessary 401 calls
      if (!forceRefresh && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
        
        // Check if this is a guest video call page (format: /company/room)
        const isGuestVideoCall = /^\/[^\/]+\/[^\/]+$/.test(currentPath);
        
        if (authPaths.includes(currentPath) || isGuestVideoCall) {
          console.log('🔒 On auth page or guest video call, skipping user refresh');
          setUser(null);
          setLoading(false);
          return;
        }
      }
      
      const response = await authApi.getCurrentUser();
      if (response.error) {
        setUser(null);
        // Don't set error here as it's normal when not logged in
      } else {
        // Handle both response.user and direct response formats
        const userData = (response as any).user || response;
        console.log('Current user data:', userData);
        setUser(userData);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      setUser(null);
      
      // Handle 401 errors by redirecting to login, but only if not already on auth pages or guest video calls
      if (err instanceof Error && err.message.includes('401')) {
        console.log('🔒 401 error in refreshUser');
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
          
          // Check if this is a guest video call page (format: /company/room)
          const isGuestVideoCall = /^\/[^\/]+\/[^\/]+$/.test(currentPath);
          
          if (!authPaths.includes(currentPath) && !isGuestVideoCall) {
            console.log('🔒 Redirecting to login from refreshUser');
            window.location.href = '/login';
          } else {
            console.log('🔒 On auth page or guest video call, not redirecting');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await refreshUserInternal(false);
  };

  const login = async (email: string, password: string, companyId?: string): Promise<boolean | { multipleAccounts: boolean; companies: Array<{ id: string; name: string; logo: string; userId: string }> }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(email, password, companyId);
      
      if (response.error) {
        setError(handleApiError(response));
        setLoading(false);
        return false;
      }
      
      if (response.multipleAccounts) {
        setLoading(false);
        return {
          multipleAccounts: response.multipleAccounts,
          companies: response.companies || []
        };
      }
      
      // Refresh user data after successful login (force refresh even on login page)
      await refreshUserInternal(true);
      return true;
    } catch (err) {
      setError('Login failed');
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    companyName?: string;
    orgNumber?: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register(userData);
      
      if (response.error) {
        setError(handleApiError(response));
        setLoading(false);
        return false;
      }
      
      // Registration successful, but user needs to verify email
      // Don't auto-login anymore
      setLoading(false);
      return true;
    } catch (err) {
      setError('Registration failed');
      setLoading(false);
      return false;
    }
  };

  const logout = async (redirectToLogin: boolean = true): Promise<void> => {
    setLoading(true);
    console.log('🚪 Logging out user...');
    
    try {
      // Call logout API to invalidate server-side session
      await authApi.logout();
      console.log('✅ Server logout successful');
    } catch (err) {
      console.error('❌ Server logout failed:', err);
      // Continue with client-side logout even if server fails
    }

    // Clear all client-side auth data
    console.log('🧹 Clearing client auth data...');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('sessionId');
      // Clear any other auth-related localStorage items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('auth_') || key.startsWith('user_')) {
          localStorage.removeItem(key);
        }
      });
    }

    // Clear auth context state
    setUser(null);
    setError(null);
    setLoading(false);

    console.log('✅ User logged out successfully');

    // Redirect to login if requested
    if (redirectToLogin && typeof window !== 'undefined') {
      console.log('🔄 Redirecting to login...');
      // Small delay to ensure state is updated
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await authApi.forgotPassword(email);
      
      if (response.error) {
        setError(handleApiError(response));
        return false;
      }
      
      return true;
    } catch (err) {
      setError('Failed to send reset email');
      return false;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await authApi.resetPassword(token, password);
      
      if (response.error) {
        setError(handleApiError(response));
        return false;
      }
      
      return true;
    } catch (err) {
      setError('Password reset failed');
      return false;
    }
  };

  useEffect(() => {
    refreshUserInternal(false);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Utility hooks for common auth patterns
export const useAuthGuard = (redirectTo: string = '/login') => {
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShouldRedirect(true);
    }
  }, [user, loading]);

  return { user, loading, shouldRedirect, redirectTo };
};

export const useGuestGuard = (redirectTo: string = '/dashboard') => {
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setShouldRedirect(true);
    }
  }, [user, loading]);

  return { user, loading, shouldRedirect, redirectTo };
}; 