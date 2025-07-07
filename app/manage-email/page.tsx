'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ManageEmailModal from '@/components/ui/manage-email-modal';
import { supabase } from '@/lib/supabase/client';

export default function ManageEmailPage() {
  const [user, setUser] = useState<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const router = useRouter();

  // Fetch the current user session on mount
  useEffect(() => {
    const fetchSession = async () => {
      if (!supabase) {
        router.replace('/login');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        // If not authenticated, redirect to login
        router.replace('/login');
      }
    };

    fetchSession();
  }, [router]);

  // If we don't yet have the user, render nothing (could show a spinner)
  if (!user) return null;

  return (
    <ManageEmailModal
      user={user}
      isOpen={true}
      onClose={() => router.push('/dashboard')}
      onEmailUpdated={() => router.push('/dashboard')}
    />
  );
} 