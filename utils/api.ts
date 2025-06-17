// API utility functions for seamless frontend-backend integration
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Authentication APIs
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Login failed' };
    }
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    companyName?: string;
    orgNumber?: string;
  }): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Registration failed' };
    }
  },

  logout: async (): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      return { error: 'Logout failed' };
    }
  },

  getCurrentUser: async (): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Include cookies for session-based auth
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to get user' };
    }
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to send reset email' };
    }
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Password reset failed' };
    }
  },
};

// User Management APIs
export const userApi = {
  getUsers: async (params?: {
    company?: string;
    role?: string;
    isActive?: boolean;
    limit?: number;
    page?: number;
    search?: string;
  }): Promise<PaginatedResponse<any>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });
      }
      
      const response = await fetch(`/api/users?${searchParams}`, {
        credentials: 'include', // Include cookies for session-based auth
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch users:', response.status, response.statusText);
        return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
      }
      
      const result = await response.json();
      console.log('Users API response:', result);
      
      return {
        data: result.users || [],
        pagination: result.pagination || { total: 0, page: 1, limit: 50, totalPages: 0 }
      };
    } catch (error) {
      console.error('Error in getUsers:', error);
      return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  },

  getUser: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/users/${id}`);
      return await response.json();
    } catch (error) {
      return { error: 'Failed to fetch user' };
    }
  },

  createUser: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role?: string;
    companyId?: string;
    image?: string;
  }): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to create user' };
    }
  },

  updateUser: async (id: string, userData: any): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to update user' };
    }
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to delete user' };
    }
  },
};

// Company Management APIs
export const companyApi = {
  getCompanies: async (params?: {
    status?: string;
    limit?: number;
    page?: number;
    search?: string;
  }): Promise<PaginatedResponse<any>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });
      }
      
      const response = await fetch(`/api/companies?${searchParams}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      return {
        data: result.companies || [],
        pagination: result.pagination || { total: 0, page: 1, limit: 50, totalPages: 0 }
      };
    } catch (error) {
      return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  },

  getCompany: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to fetch company' };
    }
  },

  updateCompany: async (id: string, companyData: any): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to update company' };
    }
  },
};

// License Management APIs
export const licenseApi = {
  getLicenses: async (params?: {
    company?: string;
    user?: string;
    status?: string;
    type?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });
      }
      
      const response = await fetch(`/api/licenses?${searchParams}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      return {
        data: result.licenses || [],
        pagination: result.pagination || { total: 0, page: 1, limit: 50, totalPages: 0 }
      };
    } catch (error) {
      return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  },

  createLicense: async (licenseData: {
    type: string;
    companyId: string;
    userId?: string;
    features?: any[];
    validFrom: string;
    validUntil: string;
  }): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(licenseData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to create license' };
    }
  },

  updateLicense: async (id: string, licenseData: any): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/licenses?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(licenseData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to update license' };
    }
  },

  deleteLicense: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/licenses?id=${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to delete license' };
    }
  },

  assignLicense: async (id: string, userId: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/licenses/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to assign license' };
    }
  },

  unassignLicense: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/licenses/${id}/unassign`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to unassign license' };
    }
  },
};

// Payment APIs
export const paymentApi = {
  getPayments: async (params?: {
    company?: string;
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });
      }
      
      const response = await fetch(`/api/payments?${searchParams}`);
      const result = await response.json();
      return {
        data: result.payments || [],
        pagination: result.pagination || { total: 0, page: 1, limit: 50, totalPages: 0 }
      };
    } catch (error) {
      return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  },

  createPayment: async (paymentData: any): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to create payment' };
    }
  },
};

// Subscription APIs
export const subscriptionApi = {
  getSubscriptions: async (params?: {
    company?: string;
    status?: string;
  }): Promise<ApiResponse> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });
      }
      
      const response = await fetch(`/api/subscriptions?${searchParams}`);
      return await response.json();
    } catch (error) {
      return { error: 'Failed to fetch subscriptions' };
    }
  },

  updateSubscription: async (id: string, subscriptionData: any): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to update subscription' };
    }
  },
};

// Dashboard Analytics APIs
export const dashboardApi = {
  getOverview: async (companyId?: string): Promise<ApiResponse> => {
    try {
      const params = companyId ? `?company=${companyId}` : '';
      const response = await fetch(`/api/dashboard/overview${params}`);
      return await response.json();
    } catch (error) {
      return { error: 'Failed to fetch overview' };
    }
  },

  getRevenue: async (companyId?: string, period?: string): Promise<ApiResponse> => {
    try {
      const searchParams = new URLSearchParams();
      if (companyId) searchParams.append('company', companyId);
      if (period) searchParams.append('period', period);
      
      const response = await fetch(`/api/dashboard/revenue?${searchParams}`);
      return await response.json();
    } catch (error) {
      return { error: 'Failed to fetch revenue data' };
    }
  },

  getUserAnalytics: async (companyId?: string): Promise<ApiResponse> => {
    try {
      const params = companyId ? `?company=${companyId}` : '';
      const response = await fetch(`/api/dashboard/users${params}`);
      return await response.json();
    } catch (error) {
      return { error: 'Failed to fetch user analytics' };
    }
  },

  getLicenseAnalytics: async (companyId?: string): Promise<ApiResponse> => {
    try {
      const params = companyId ? `?company=${companyId}` : '';
      const response = await fetch(`/api/dashboard/licenses${params}`);
      return await response.json();
    } catch (error) {
      return { error: 'Failed to fetch license analytics' };
    }
  },
};

// Reviews APIs
export const reviewApi = {
  getReviews: async (params?: {
    company?: string;
    user?: string;
    rating?: number;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });
      }
      
      const response = await fetch(`/api/reviews?${searchParams}`);
      const result = await response.json();
      return {
        data: result.reviews || [],
        pagination: result.pagination || { total: 0, page: 1, limit: 50, totalPages: 0 }
      };
    } catch (error) {
      return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  },

  createReview: async (reviewData: any): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to create review' };
    }
  },
};

// File Upload APIs
export const fileApi = {
  uploadFile: async (file: File, type: 'avatar' | 'logo' | 'document'): Promise<ApiResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      return { error: 'File upload failed' };
    }
  },
};

// Video Call APIs (for integration with existing video components)
export const videoCallApi = {
  getVideoCalls: async (params?: {
    company?: string;
    user?: string;
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });
      }
      
      const response = await fetch(`/api/videocalls?${searchParams}`);
      const result = await response.json();
      return {
        data: result.videoCalls || [],
        pagination: result.pagination || { total: 0, page: 1, limit: 50, totalPages: 0 }
      };
    } catch (error) {
      return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  },

  createVideoCall: async (callData: any): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/videocalls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to create video call' };
    }
  },

  updateVideoCall: async (id: string, callData: any): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/videocalls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to update video call' };
    }
  },
};

// Comments APIs
export const commentApi = {
  getComments: async (params?: {
    videoCall?: string;
    user?: string;
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });
      }
      
      const response = await fetch(`/api/comments?${searchParams}`);
      const result = await response.json();
      return {
        data: result.comments || [],
        pagination: result.pagination || { total: 0, page: 1, limit: 50, totalPages: 0 }
      };
    } catch (error) {
      return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  },

  createComment: async (commentData: any): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });
      return await response.json();
    } catch (error) {
      return { error: 'Failed to create comment' };
    }
  },
};

// Utility function for handling API errors
export const handleApiError = (error: any): string => {
  if (error?.error) return error.error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

// Utility function for formatting Norwegian currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100); // Convert from øre to NOK
};

// Utility function for formatting dates
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nb-NO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

// Utility function for formatting relative time
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'nettopp';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min siden`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} timer siden`;
  
  return formatDate(dateString);
}; 