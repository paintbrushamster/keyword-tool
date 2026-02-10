'use client';

import Link from 'next/link';
import {
  Search, Sparkles, BarChart3, TrendingUp, Star,
  ArrowRight, Activity, Eye, ShoppingCart
} from 'lucide-react';

export default function DashboardOverview() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to EtsyKeyword. Here&apos;s your overview.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Searches Today', value: '0', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'AI Uses Today', value: '0', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Listings Tracked', value: '0', icon: Eye, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Trends Flagged', value: '0', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            href: '/dashboard/keyword-search',
            icon: Search,
            title: 'Keyword Search',
            description: 'Find related keywords with search volume and competition data.',
            color: 'from-blue-500 to-blue-600',
            badge: 'Free',
          },
          {
            href: '/dashboard/ai-optimizer',
            icon: Sparkles,
            title: 'Magic SEO Engine',
            description: 'AI-powered keyword optimization, title, and description generation.',
            color: 'from-purple-500 to-purple-600',
            badge: 'Pro',
          },
          {
            href: '/dashboard/shop-health',
            icon: BarChart3,
            title: 'Shop Health',
            description: 'Diagnose listing visibility with traffic-light grading.',
            color: 'from-green-500 to-green-600',
            badge: 'Pro',
          },
          {
            href: '/dashboard/trends',
            icon: TrendingUp,
            title: 'Trend Radar',
            description: 'Spot market gaps from TikTok and Pinterest trends.',
            color: 'from-orange-500 to-orange-600',
            badge: 'Pro',
          },
          {
            href: '/dashboard/keep-or-kill',
            icon: Star,
            title: 'Keep or Kill',
            description: 'AI inventory decisions — winners, mismatches, and friction.',
            color: 'from-yellow-500 to-yellow-600',
            badge: 'Pro',
          },
          {
            href: '/dashboard/settings',
            icon: Activity,
            title: 'Account & Billing',
            description: 'Manage subscription, connect Etsy, and view usage.',
            color: 'from-gray-500 to-gray-600',
            badge: '',
          },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="card group hover:shadow-md transition-all hover:border-gray-300">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                <action.icon size={20} className="text-white" />
              </div>
              {action.badge && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  action.badge === 'Free'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-brand-100 text-brand-700'
                }`}>
                  {action.badge}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{action.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{action.description}</p>
            <div className="flex items-center gap-1 text-sm text-brand-600 font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
