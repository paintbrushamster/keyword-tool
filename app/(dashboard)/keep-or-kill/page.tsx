'use client';

import { useState } from 'react';
import { Star, Trophy, Eye, EyeOff, AlertTriangle, DollarSign, TrendingUp, Sparkles, Link2, ArrowRight } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  views: number;
  favorites: number;
  sales: number;
  revenue: number;
  label: 'winner' | 'market_mismatch' | 'price_friction' | 'invisible';
  strategy: string;
  action: string;
}

const DEMO_LISTINGS: Listing[] = [
  { id: '1', title: 'Handmade Wooden Jewelry Box - Personalized', views: 1250, favorites: 87, sales: 23, revenue: 1150, label: 'winner', strategy: 'Increase Ad Spend', action: 'This listing converts. Scale it with Etsy Ads and consider creating variations.' },
  { id: '2', title: 'Custom Name Necklace - Gold Plated', views: 2100, favorites: 210, sales: 8, revenue: 320, label: 'price_friction', strategy: 'Trigger 10% Sale', action: 'High favorites but low conversion signals price resistance. Try a limited coupon or free shipping.' },
  { id: '3', title: 'Vintage Floral Print Tote Bag', views: 890, favorites: 12, sales: 2, revenue: 60, label: 'market_mismatch', strategy: 'Reposition or Retire', action: 'Views are decent but almost no engagement. The product itself isn\'t resonating — the market has moved on.' },
  { id: '4', title: 'Crocheted Baby Blanket - Pastel', views: 15, favorites: 1, sales: 0, revenue: 0, label: 'invisible', strategy: 'Total SEO Overhaul', action: 'Zero visibility. Tags, title, and photos all need rework. Run the Magic SEO Engine on this listing.' },
  { id: '5', title: 'Minimalist Wall Art Print Set of 3', views: 650, favorites: 45, sales: 12, revenue: 360, label: 'winner', strategy: 'Expand Collection', action: 'Healthy metrics across the board. Create a series (Set of 5, Set of 7) to capture more revenue.' },
  { id: '6', title: 'Beaded Friendship Bracelet Pack', views: 340, favorites: 78, sales: 4, revenue: 48, label: 'price_friction', strategy: 'Adjust Pricing', action: 'Great engagement-to-view ratio but low sales. Price may be too high for the perceived value.' },
];

const labelConfig = {
  winner: { icon: Trophy, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Winner', tagBg: 'bg-green-100 text-green-700' },
  market_mismatch: { icon: EyeOff, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Market Mismatch', tagBg: 'bg-orange-100 text-orange-700' },
  price_friction: { icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Price Friction', tagBg: 'bg-amber-100 text-amber-700' },
  invisible: { icon: Eye, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Invisible', tagBg: 'bg-red-100 text-red-700' },
};

export default function KeepOrKillPage() {
  const [listings] = useState<Listing[]>(DEMO_LISTINGS);
  const [filter, setFilter] = useState<string>('all');
  const [connected] = useState(false);

  const filtered = filter === 'all' ? listings : listings.filter(l => l.label === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Keep or Kill Matrix</h1>
        <p className="text-gray-500 mt-1">AI-powered inventory decisions. Know what to scale, fix, or retire.</p>
      </div>

      {!connected && (
        <div className="card mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center gap-4 flex-wrap">
            <Link2 size={24} className="text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Connect Etsy for real data</p>
              <p className="text-sm text-gray-600">Showing demo data. Connect your shop for personalized analysis.</p>
            </div>
            <button className="btn-primary bg-orange-500 hover:bg-orange-600 text-sm">
              Connect Etsy <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(labelConfig).map(([key, config]) => {
          const count = listings.filter(l => l.label === key).length;
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? 'all' : key)}
              className={`card text-center transition-all ${filter === key ? 'ring-2 ring-brand-500' : 'hover:shadow-md'}`}
            >
              <Icon size={24} className={`${config.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Listings */}
      <div className="space-y-3">
        {filtered.map((listing) => {
          const config = labelConfig[listing.label];
          const Icon = config.icon;
          return (
            <div key={listing.id} className={`card ${config.bg} hover:shadow-md transition-shadow`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Icon size={28} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{listing.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.tagBg}`}>{config.label}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-600 mb-2">
                    <span>{listing.views.toLocaleString()} views</span>
                    <span>{listing.favorites} favs</span>
                    <span>{listing.sales} sales</span>
                    <span className="font-medium text-green-600">${listing.revenue}</span>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 border border-white/80">
                    <p className="text-xs font-semibold text-gray-800 mb-1">Strategy: {listing.strategy}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{listing.action}</p>
                  </div>
                </div>
                {listing.label === 'invisible' && (
                  <button className="btn-primary text-xs py-2 px-3 flex-shrink-0">
                    <Sparkles size={14} /> Fix SEO
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card mt-6 bg-gray-50 border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          <strong>How it works:</strong> The Keep or Kill Matrix evaluates each listing based on views, favorites, sales, and revenue.
          It applies decision logic to categorize listings and recommend specific actions.
        </p>
      </div>
    </div>
  );
}
