'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ROUTES } from '@/constants';
import { LoadingOverlay } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  fallback = <LoadingOverlay message="Loading..." submessage="Checking authentication" />, 
  redirectTo = ROUTES.LOGIN 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading while checking authentication
  if (loading) {
    return fallback;
  }

  // If no user and not loading, don't render children (redirect in progress)
  if (!user && !loading) {
    return fallback;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
  }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute 
        fallback={options?.fallback} 
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for requiring authentication
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, loading, router]);

  return {
    user,
    loading,
    isAuthenticated: !!user && !loading,
  };
} 