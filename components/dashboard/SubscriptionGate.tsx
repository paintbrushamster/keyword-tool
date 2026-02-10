'use client';

import Link from 'next/link';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

interface SubscriptionGateProps {
  feature: string;
  children: React.ReactNode;
  isLocked: boolean;
  message?: string;
}

export default function SubscriptionGate({ feature, children, isLocked, message }: SubscriptionGateProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="filter blur-sm opacity-50 pointer-events-none select-none" aria-hidden>
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md text-center">
          <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{feature} is a Pro feature</h3>
          <p className="text-sm text-gray-500 mt-2">
            {message || `Upgrade to Pro to unlock ${feature} and all other advanced features.`}
          </p>
          <Link href="/dashboard/settings" className="btn-primary mt-6 inline-flex">
            <Sparkles size={16} />
            Start 7-day free trial
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-gray-400 mt-3">$14.99/month after trial. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}
