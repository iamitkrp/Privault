'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ROUTES } from '@/constants';
import { LoadingOverlay } from '@/components/ui';

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

  return <LoadingOverlay message="Completing authentication..." />;
}
