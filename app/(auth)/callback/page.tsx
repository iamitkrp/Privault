'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ROUTES } from '@/constants';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          router.push(ROUTES.LOGIN);
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push(ROUTES.LOGIN);
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          router.push(ROUTES.DASHBOARD);
        } else {
          // No session, redirect to login
          router.push(ROUTES.LOGIN);
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        router.push(ROUTES.LOGIN);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
