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
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
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

  const refreshUser = async () => {
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(email, password);
      
      if (response.error) {
        setError(handleApiError(response));
        setLoading(false);
        return false;
      }
      
      // Refresh user data after successful login
      await refreshUser();
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

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      setUser(null);
      setLoading(false);
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
    refreshUser();
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