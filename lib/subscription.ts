import type { SubscriptionTier, UserProfile } from '@/types';
import { TIER_LIMITS } from '@/types';

export function canUseFeature(
  profile: UserProfile | null,
  feature: 'keywordSearch' | 'aiOptimizer' | 'shopHealth' | 'trends'
): { allowed: boolean; reason?: string } {
  // If no auth configured, allow everything (development mode)
  if (!profile) {
    return { allowed: true };
  }

  const tier = profile.subscription_tier || 'free';
  const status = profile.subscription_status;
  const limits = TIER_LIMITS[tier];

  // Check if subscription is active (or trialing)
  const isActive = tier === 'free' || status === 'active' || status === 'trialing';
  if (!isActive && tier === 'pro') {
    return { allowed: false, reason: 'Your subscription has expired. Please renew to continue.' };
  }

  switch (feature) {
    case 'keywordSearch': {
      if (profile.keyword_searches_today >= limits.keywordSearchesPerDay) {
        return {
          allowed: false,
          reason: tier === 'free'
            ? `You've used your ${limits.keywordSearchesPerDay} free searches today. Upgrade to Pro for unlimited searches.`
            : 'Daily search limit reached. Resets at midnight.',
        };
      }
      return { allowed: true };
    }
    case 'aiOptimizer': {
      if (!limits.aiUsesPerDay) {
        return { allowed: false, reason: 'AI Optimizer is a Pro feature. Start your 7-day free trial.' };
      }
      if (profile.ai_uses_today >= limits.aiUsesPerDay) {
        return { allowed: false, reason: 'Daily AI usage limit reached. Resets at midnight.' };
      }
      return { allowed: true };
    }
    case 'shopHealth': {
      if (!limits.shopHealthAccess) {
        return { allowed: false, reason: 'Shop Health Dashboard is a Pro feature. Start your 7-day free trial.' };
      }
      return { allowed: true };
    }
    case 'trends': {
      if (!limits.trendsAccess) {
        return { allowed: false, reason: 'Trend Radar is a Pro feature. Start your 7-day free trial.' };
      }
      return { allowed: true };
    }
    default:
      return { allowed: true };
  }
}

export function getTierFromProfile(profile: UserProfile | null): SubscriptionTier {
  if (!profile) return 'free';
  return profile.subscription_tier || 'free';
}
