export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  keyword_searches_today: number;
  ai_uses_today: number;
  created_at: string;
}

export interface KeywordResult {
  keyword: string;
  searchVolume: number;
  competition: number;
  listings: number;
  opportunity: number;
  trend: 'rising' | 'stable' | 'seasonal';
  wordCount: number;
  source: string;
}

export interface KeywordSearchResponse {
  query: string;
  totalResults: number;
  keywords: KeywordResult[];
  dataSources: string[];
}

export interface AiKeyword {
  rank: number;
  keyword: string;
  searchVolume: string;
  competition: string;
  opportunity: number;
  reason: string;
}

export interface AiOptimizeResponse {
  success: boolean;
  keywords: AiKeyword[];
  title: string;
  description: string;
  strategy: string;
  dataSourced: {
    suggestionsUsed: number;
    relatedWordsUsed: number;
    totalDataPoints: number;
  };
}

export interface ShopListing {
  id: string;
  title: string;
  views: number;
  favorites: number;
  sales: number;
  revenue: number;
  tags: string[];
  visibility_score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'winner' | 'market_mismatch' | 'price_friction' | 'invisible' | 'stable';
  recommendation: string;
}

export interface TrendItem {
  keyword: string;
  platform: 'tiktok' | 'pinterest' | 'etsy';
  growth_percent: number;
  etsy_supply: 'low' | 'medium' | 'high';
  opportunity: 'high' | 'medium' | 'low';
  recommendation: string;
}

// Usage limits per tier
export const TIER_LIMITS = {
  free: {
    keywordSearchesPerDay: 5,
    aiUsesPerDay: 0,
    shopHealthAccess: false,
    trendsAccess: false,
    socialMediaAccess: false,
  },
  pro: {
    keywordSearchesPerDay: 100,
    aiUsesPerDay: 50,
    shopHealthAccess: true,
    trendsAccess: true,
    socialMediaAccess: true,
  },
} as const;
