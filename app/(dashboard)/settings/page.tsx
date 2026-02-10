'use client';

import { useState } from 'react';
import { Settings, CreditCard, User, Link2, Shield, Check, Sparkles, Loader2, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
      }
    } catch {
      alert('Failed to connect to payment processor');
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account, subscription, and integrations.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Subscription */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={20} className="text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Free Plan</p>
                <p className="text-sm text-gray-500">5 keyword searches per day</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">Current Plan</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-50 to-indigo-50 rounded-lg p-4 border border-brand-200">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 text-lg">Pro Plan</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white">7-day free trial</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">$14.99<span className="text-sm font-normal text-gray-500">/month</span></p>
                <ul className="mt-3 space-y-1.5">
                  {['Unlimited keyword searches', 'AI Magic SEO Engine', 'Shop Health Dashboard', 'Trend Radar', 'Keep or Kill Matrix'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={14} className="text-brand-600" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={handleUpgrade} disabled={upgradeLoading} className="btn-primary py-3 px-6">
                {upgradeLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {upgradeLoading ? 'Loading...' : 'Start Free Trial'}
              </button>
            </div>
          </div>
        </div>

        {/* Etsy Integration */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Link2 size={20} className="text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Etsy Integration</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Connect your Etsy shop to unlock Shop Health Dashboard, Keep or Kill Matrix, and auto-sync listing data.
          </p>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Link2 size={16} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Not connected</p>
              <p className="text-xs text-gray-500">OAuth 2.0 — We never store your Etsy password</p>
            </div>
            <button className="btn-secondary text-sm">Connect Etsy</button>
          </div>
        </div>

        {/* Account */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <User size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="input-field mt-1" placeholder="your@email.com" disabled />
              <p className="text-xs text-gray-400 mt-1">Email is managed through your auth provider</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> OAuth 2.0 for Etsy — we never store your password</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> All shop financial data encrypted with AES-256 at rest</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> You can revoke access at any time</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Stripe handles all payment processing (PCI compliant)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
