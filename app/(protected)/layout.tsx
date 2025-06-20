"use client";

import { useEffect } from 'react';
import { useAuth } from '@/utils/auth-context';
import { useRouter } from 'next/navigation';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔒 Protected Layout - checking auth status');
    console.log('👤 User:', user ? `${user.firstName} ${user.lastName}` : 'null');
    console.log('⏳ Loading:', loading);

    // Don't redirect while loading to avoid flashing
    if (loading) {
      console.log('⏳ Still loading, waiting...');
      return;
    }

    // If no user after loading is complete, redirect to login
    if (!user) {
      console.log('❌ No authenticated user, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('✅ User authenticated, allowing access');
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting (user is null but not loading)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
} 