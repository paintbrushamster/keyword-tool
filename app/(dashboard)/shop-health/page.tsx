'use client';

import { useState } from 'react';
import { BarChart3, AlertCircle, CheckCircle2, XCircle, ArrowRight, Link2, Sparkles, RefreshCw } from 'lucide-react';
import type { ShopListing } from '@/types';

// Demo data for when Etsy OAuth isn't connected
const DEMO_LISTINGS: ShopListing[] = [
  { id: '1', title: 'Handmade Wooden Jewelry Box - Personalized Gift', views: 1250, favorites: 87, sales: 23, revenue: 1150, tags: ['jewelry box', 'wooden', 'personalized', 'gift'], visibility_score: 82, grade: 'A', status: 'winner', recommendation: 'Increase ad spend — this listing is converting well.' },
  { id: '2', title: 'Vintage Floral Print Tote Bag', views: 890, favorites: 12, sales: 2, revenue: 60, tags: ['tote bag', 'vintage', 'floral'], visibility_score: 45, grade: 'C', status: 'market_mismatch', recommendation: 'High views but low favorites suggests the product isn\'t trending. Consider repositioning.' },
  { id: '3', title: 'Custom Name Necklace - Gold Plated', views: 2100, favorites: 210, sales: 8, revenue: 320, tags: ['necklace', 'custom', 'gold', 'name'], visibility_score: 68, grade: 'B', status: 'price_friction', recommendation: 'Many favorites but few sales — try a 10% discount or free shipping to convert.' },
  { id: '4', title: 'Crocheted Baby Blanket - Pastel Colors', views: 15, favorites: 1, sales: 0, revenue: 0, tags: ['baby blanket', 'crochet'], visibility_score: 12, grade: 'F', status: 'invisible', recommendation: 'Almost no views. Run a full SEO overhaul with the Magic SEO Engine.' },
  { id: '5', title: 'Minimalist Wall Art Print Set of 3', views: 650, favorites: 45, sales: 12, revenue: 360, tags: ['wall art', 'minimalist', 'print'], visibility_score: 71, grade: 'B', status: 'stable', recommendation: 'Solid performer. Consider expanding this into a collection.' },
  { id: '6', title: 'Personalized Dog Collar - Leather', views: 430, favorites: 55, sales: 15, revenue: 525, tags: ['dog collar', 'personalized', 'leather'], visibility_score: 76, grade: 'A', status: 'winner', recommendation: 'Great conversion rate. Consider running Etsy Ads on this listing.' },
];

const gradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-700 border-green-200';
    case 'B': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'C': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'D': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'F': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'winner': return <CheckCircle2 size={16} className="text-green-500" />;
    case 'invisible': return <XCircle size={16} className="text-red-500" />;
    case 'price_friction': return <AlertCircle size={16} className="text-amber-500" />;
    case 'market_mismatch': return <AlertCircle size={16} className="text-orange-500" />;
    default: return <CheckCircle2 size={16} className="text-blue-500" />;
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'winner': return 'Winner';
    case 'invisible': return 'Invisible';
    case 'price_friction': return 'Price Friction';
    case 'market_mismatch': return 'Market Mismatch';
    default: return 'Stable';
  }
};

export default function ShopHealthPage() {
  const [listings] = useState<ShopListing[]>(DEMO_LISTINGS);
  const [connected] = useState(false);

  const avgScore = Math.round(listings.reduce((s, l) => s + l.visibility_score, 0) / listings.length);
  const winners = listings.filter(l => l.status === 'winner').length;
  const needsFix = listings.filter(l => l.grade === 'C' || l.grade === 'D' || l.grade === 'F').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shop Health Dashboard</h1>
        <p className="text-gray-500 mt-1">Diagnose every listing with traffic-light grading. Click &ldquo;Fix&rdquo; to run the Magic SEO Engine.</p>
      </div>

      {/* Connect Etsy Banner */}
      {!connected && (
        <div className="card mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Link2 size={24} className="text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">Connect your Etsy shop</p>
              <p className="text-sm text-gray-600">Link your Etsy account to see real listing data. Using demo data below.</p>
            </div>
            <button className="btn-primary bg-orange-500 hover:bg-orange-600">
              Connect Etsy <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-brand-600">{avgScore}</p>
          <p className="text-sm text-gray-500 mt-1">Avg. Visibility</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{winners}</p>
          <p className="text-sm text-gray-500 mt-1">Winners</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">{needsFix}</p>
          <p className="text-sm text-gray-500 mt-1">Need Fix</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Listings</p>
        </div>
      </div>

      {/* Listings */}
      <div className="space-y-3">
        {listings.map((listing) => (
          <div key={listing.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 flex-wrap">
              {/* Grade */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold border ${gradeColor(listing.grade)}`}>
                {listing.grade}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{listing.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {statusIcon(listing.status)}
                  <span className="text-xs font-medium text-gray-600">{statusLabel(listing.status)}</span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-500">Visibility: {listing.visibility_score}/100</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{listing.recommendation}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-center flex-shrink-0">
                <div>
                  <p className="text-sm font-bold text-gray-900">{listing.views.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Views</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{listing.favorites}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Favs</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{listing.sales}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Sales</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-green-600">${listing.revenue}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Revenue</p>
                </div>
              </div>

              {/* Action */}
              {(listing.grade === 'C' || listing.grade === 'D' || listing.grade === 'F') && (
                <button className="btn-primary text-xs py-2 px-3 flex-shrink-0">
                  <Sparkles size={14} /> Fix SEO
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
