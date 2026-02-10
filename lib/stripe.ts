import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '5 keyword searches per day',
      'Basic keyword stats',
      'CSV export',
    ],
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 14.99,
    yearlyPrice: 119.99,
    features: [
      'Unlimited keyword searches',
      'AI Magic SEO Engine (50 uses/day)',
      'Shop Health Dashboard',
      'Trend Radar (TikTok & Pinterest)',
      'Keep or Kill Matrix',
      'Priority support',
      '7-day free trial',
    ],
  },
} as const;
