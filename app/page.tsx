import Link from 'next/link';
import {
  Search, Sparkles, BarChart3, TrendingUp,
  Check, ArrowRight, Zap, Shield, Star
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-600" size={24} />
            <span className="text-xl font-bold text-gray-900">EtsyKeyword</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-blue-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
            <Zap size={14} />
            AI-Powered Etsy SEO
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Stop guessing keywords.
            <span className="text-brand-600"> Start ranking.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The all-in-one keyword research, SEO optimization, and shop analytics platform built specifically for Etsy sellers.
            Find high-traffic, low-competition keywords in seconds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-base px-8 py-3">
              Start free trial
              <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard/keyword-search" className="btn-secondary text-base px-8 py-3">
              Try keyword search
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">No credit card required. 7-day Pro trial included.</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to dominate Etsy search</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Six powerful tools working together to maximize your shop&apos;s visibility and sales.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Search, title: 'Keyword Search', badge: 'Free',
                description: 'Search any keyword to find related terms with search volume, competition, and opportunity scores. Powered by linguistic databases.',
              },
              {
                icon: Sparkles, title: 'Magic SEO Engine', badge: 'Pro',
                description: 'AI analyzes top-ranking listings and finds the 13 best keywords, then generates an optimized title and SEO-friendly description.',
              },
              {
                icon: BarChart3, title: 'Shop Health Dashboard', badge: 'Pro',
                description: 'Traffic-light grading for every listing. See which listings need SEO fixes and click to auto-optimize with the Magic SEO Engine.',
              },
              {
                icon: TrendingUp, title: 'Trend Radar', badge: 'Pro',
                description: 'Cross-platform trend scraping from TikTok and Pinterest. Spot market gap opportunities before your competitors do.',
              },
              {
                icon: Star, title: 'Keep or Kill Matrix', badge: 'Pro',
                description: 'AI-powered inventory decisions. Know which listings are winners, which have price friction, and which need a total overhaul.',
              },
              {
                icon: Shield, title: 'Secure & Private', badge: '',
                description: 'OAuth 2.0 for Etsy — we never store your password. All shop data encrypted with AES-256 at rest. You stay in control.',
              },
            ].map((feature, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                    <feature.icon size={20} className="text-brand-600" />
                  </div>
                  {feature.badge && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      feature.badge === 'Free'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-brand-100 text-brand-700'
                    }`}>
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="mt-4 text-gray-600">Start free. Upgrade when you&apos;re ready to grow.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="ml-2 text-gray-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Perfect for getting started</p>
              <ul className="mt-6 space-y-3">
                {['5 keyword searches per day', 'Basic keyword stats', 'Related keywords generator', 'CSV export'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-secondary w-full mt-8">
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="card ring-2 ring-brand-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-semibold">
                Most popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">$14.99</span>
                <span className="ml-2 text-gray-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">7-day free trial included</p>
              <ul className="mt-6 space-y-3">
                {[
                  'Unlimited keyword searches',
                  'AI Magic SEO Engine (50/day)',
                  'Shop Health Dashboard',
                  'Trend Radar (TikTok & Pinterest)',
                  'Keep or Kill Matrix',
                  'Optimized title & description generator',
                  'Priority support',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-brand-600 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-primary w-full mt-8">
                Start 7-day free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-brand-600" size={20} />
            <span className="font-bold text-gray-900">EtsyKeyword</span>
          </div>
          <p className="text-sm text-gray-500">Built for Etsy sellers who want to sell more.</p>
        </div>
      </footer>
    </div>
  );
}
