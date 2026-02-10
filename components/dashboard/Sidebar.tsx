'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, Sparkles, BarChart3, TrendingUp,
  Settings, LogOut, Star, LayoutDashboard,
  Lock, Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { SubscriptionTier } from '@/types';

interface SidebarProps {
  tier: SubscriptionTier;
  userName?: string | null;
  userEmail?: string | null;
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', tier: 'free' as const },
  { href: '/dashboard/keyword-search', icon: Search, label: 'Keyword Search', tier: 'free' as const },
  { href: '/dashboard/ai-optimizer', icon: Sparkles, label: 'Magic SEO', tier: 'pro' as const },
  { href: '/dashboard/shop-health', icon: BarChart3, label: 'Shop Health', tier: 'pro' as const },
  { href: '/dashboard/trends', icon: TrendingUp, label: 'Trend Radar', tier: 'pro' as const },
  { href: '/dashboard/keep-or-kill', icon: Star, label: 'Keep or Kill', tier: 'pro' as const },
];

export default function Sidebar({ tier, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Sparkles className="text-brand-600" size={22} />
          <span className="text-lg font-bold text-gray-900">EtsyKeyword</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = item.tier === 'pro' && tier === 'free';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-brand-600' : ''} />
              <span className="flex-1">{item.label}</span>
              {isLocked && <Lock size={14} className="text-gray-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade banner (free users) */}
      {tier === 'free' && (
        <div className="mx-3 mb-3 p-4 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <p className="text-sm font-semibold">Unlock all features</p>
          <p className="text-xs text-brand-200 mt-1">7-day free trial, cancel anytime</p>
          <Link href="/dashboard/settings" className="mt-3 block text-center text-xs font-semibold bg-white text-brand-700 rounded-md py-2 hover:bg-brand-50 transition">
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* User */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
            {userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
        <div className="flex gap-1 mt-1">
          <Link href="/dashboard/settings" className="flex-1 btn-ghost text-xs py-1.5 justify-center">
            <Settings size={14} />
            Settings
          </Link>
          <button onClick={handleSignOut} className="flex-1 btn-ghost text-xs py-1.5 justify-center text-red-500 hover:bg-red-50">
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
