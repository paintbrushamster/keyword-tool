import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';
import type { SubscriptionTier } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let tier: SubscriptionTier = 'free';
  let userName: string | null = null;
  let userEmail: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userEmail = user.email ?? null;
      userName = user.user_metadata?.full_name ?? null;

      // Try to fetch profile for subscription info
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (profile) {
        tier = (profile.subscription_tier as SubscriptionTier) || 'free';
      }
    }
  } catch {
    // Supabase not configured - default to free tier, allow access for development
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        tier={tier}
        userName={userName}
        userEmail={userEmail}
      />
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
