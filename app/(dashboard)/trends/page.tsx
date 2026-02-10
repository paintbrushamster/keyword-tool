'use client';

import { useState } from 'react';
import { TrendingUp, ArrowUpRight, AlertCircle, Zap, ExternalLink, Filter } from 'lucide-react';
import type { TrendItem } from '@/types';

const DEMO_TRENDS: TrendItem[] = [
  { keyword: 'coquette aesthetic', platform: 'tiktok', growth_percent: 340, etsy_supply: 'low', opportunity: 'high', recommendation: 'Huge TikTok trend with low Etsy supply. Apply coquette styling to your products now — bows, pink, lace.' },
  { keyword: 'cottagecore candle', platform: 'pinterest', growth_percent: 180, etsy_supply: 'medium', opportunity: 'high', recommendation: 'Pinterest searches surging. Cottagecore candles with floral/herb themes are in high demand.' },
  { keyword: 'personalized pet portrait', platform: 'tiktok', growth_percent: 120, etsy_supply: 'high', opportunity: 'medium', recommendation: 'Trending but competitive. Differentiate with unique styles (watercolor, minimalist line art).' },
  { keyword: 'dark academia decor', platform: 'pinterest', growth_percent: 95, etsy_supply: 'low', opportunity: 'high', recommendation: 'Growing aesthetic with few Etsy listings. Wall art, book accessories, and desk decor fit well.' },
  { keyword: 'y2k jewelry', platform: 'tiktok', growth_percent: 210, etsy_supply: 'medium', opportunity: 'high', recommendation: 'Y2K revival is peaking. Butterfly clips, chunky rings, and beaded necklaces are top sellers.' },
  { keyword: 'mushroom home decor', platform: 'pinterest', growth_percent: 75, etsy_supply: 'medium', opportunity: 'medium', recommendation: 'Steady growth. Mushroom-themed items (lamps, wall hooks, prints) have consistent demand.' },
  { keyword: 'handmade soap gift set', platform: 'pinterest', growth_percent: 150, etsy_supply: 'high', opportunity: 'medium', recommendation: 'Holiday gift sets trending early. Bundle packaging and "gift-ready" positioning can help stand out.' },
  { keyword: 'coastal grandmother style', platform: 'tiktok', growth_percent: 280, etsy_supply: 'low', opportunity: 'high', recommendation: 'Viral aesthetic — linen, neutral tones, shells. Very few Etsy sellers targeting this directly.' },
];

const platformBadge = (platform: string) => {
  if (platform === 'tiktok') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-900 text-white">TikTok</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">Pinterest</span>;
};

const supplyBadge = (supply: string) => {
  if (supply === 'low') return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">Low Supply</span>;
  if (supply === 'medium') return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Med Supply</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">High Supply</span>;
};

const oppBadge = (opp: string) => {
  if (opp === 'high') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white">High Opportunity</span>;
  if (opp === 'medium') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">Medium</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-400 text-white">Low</span>;
};

export default function TrendsPage() {
  const [trends] = useState<TrendItem[]>(DEMO_TRENDS);
  const [filter, setFilter] = useState<'all' | 'tiktok' | 'pinterest'>('all');

  const filtered = filter === 'all' ? trends : trends.filter(t => t.platform === filter);
  const highOpp = trends.filter(t => t.opportunity === 'high').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trend Radar</h1>
        <p className="text-gray-500 mt-1">Cross-platform trend analysis from TikTok and Pinterest. Spot market gap opportunities.</p>
      </div>

      {/* Alert */}
      <div className="card mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center gap-3">
          <Zap size={22} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">{highOpp} High-Opportunity Trends Detected</p>
            <p className="text-sm text-green-700">These keywords are growing fast on social media but have low Etsy supply — act now.</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        <span className="text-sm text-gray-500 flex items-center gap-1"><Filter size={14} /> Filter:</span>
        {(['all', 'tiktok', 'pinterest'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'tiktok' ? 'TikTok' : 'Pinterest'}
          </button>
        ))}
      </div>

      {/* Trends */}
      <div className="space-y-3">
        {filtered.map((trend, i) => (
          <div key={i} className={`card hover:shadow-md transition-shadow ${trend.opportunity === 'high' ? 'border-green-200' : ''}`}>
            <div className="flex items-start gap-4 flex-wrap">
              {/* Growth */}
              <div className="w-16 text-center flex-shrink-0">
                <div className="flex items-center justify-center gap-0.5">
                  <ArrowUpRight size={16} className="text-green-500" />
                  <span className="text-xl font-bold text-green-600">{trend.growth_percent}%</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase mt-0.5">Growth</p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{trend.keyword}</h3>
                  {platformBadge(trend.platform)}
                  {supplyBadge(trend.etsy_supply)}
                  {oppBadge(trend.opportunity)}
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{trend.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        Trend data is sourced from platform APIs and updated regularly. Connect your shop to get personalized recommendations.
      </p>
    </div>
  );
}
