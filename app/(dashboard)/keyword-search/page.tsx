'use client';

import { useState } from 'react';
import { Search, Loader2, Download, TrendingUp, Minus, ArrowUpRight } from 'lucide-react';
import type { KeywordResult, KeywordSearchResponse } from '@/types';

type SortKey = 'opportunity' | 'searchVolume' | 'competition';

export default function KeywordSearchPage() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<KeywordSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('opportunity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('/api/keyword-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Search failed');
      }
      setResults(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (col: SortKey) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir(col === 'competition' ? 'asc' : 'desc'); }
  };

  const sorted = results?.keywords
    ? [...results.keywords].sort((a, b) => (sortDir === 'desc' ? -1 : 1) * (a[sortBy] - b[sortBy]))
    : [];

  const exportCSV = () => {
    if (!sorted.length) return;
    const rows = [
      ['Rank', 'Keyword', 'Search Volume', 'Competition %', 'Est. Listings', 'Opportunity', 'Trend', 'Words'],
      ...sorted.map((k, i) => [i + 1, `"${k.keyword}"`, k.searchVolume, k.competition, k.listings, k.opportunity, k.trend, k.wordCount]),
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${keyword.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const trendIcon = (trend: string) => {
    if (trend === 'rising') return <TrendingUp size={14} className="text-green-500" />;
    if (trend === 'seasonal') return <ArrowUpRight size={14} className="text-amber-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const compClass = (c: number) => c < 35 ? 'bg-green-100 text-green-700' : c < 65 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  const oppClass = (o: number) => o >= 70 ? 'bg-green-100 text-green-700' : o >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Keyword Search</h1>
        <p className="text-gray-500 mt-1">Find related keywords with search volume, competition, and opportunity scores.</p>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSearch()}
              placeholder="Enter a keyword (e.g., wooden jewelry box)"
              className="input-field pl-10"
              disabled={loading}
            />
          </div>
          <button onClick={handleSearch} disabled={loading || !keyword.trim()} className="btn-primary">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-500">Try:</span>
          {['handmade jewelry', 'crochet pattern', 'wedding invitation', 'vintage poster', 'personalized gift'].map(t => (
            <button key={t} onClick={() => setKeyword(t)} className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition">
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="card mb-6 bg-red-50 border-red-200 text-red-700 text-sm">{error}</div>}

      {results && sorted.length > 0 && (
        <div className="card">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Results for &ldquo;{results.query}&rdquo;</h2>
              <p className="text-sm text-gray-500">{results.totalResults} keywords found</p>
            </div>
            <button onClick={exportCSV} className="btn-secondary text-sm">
              <Download size={16} /> Export CSV
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Keywords', value: sorted.length },
              { label: 'Avg. Search Vol', value: Math.round(sorted.reduce((s, k) => s + k.searchVolume, 0) / sorted.length).toLocaleString() },
              { label: 'Avg. Competition', value: `${Math.round(sorted.reduce((s, k) => s + k.competition, 0) / sorted.length)}%` },
              { label: 'High Opportunity', value: sorted.filter(k => k.opportunity >= 60).length },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                <p className="text-xl font-bold text-brand-600">{s.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Keyword</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-brand-600" onClick={() => handleSort('searchVolume')}>
                    Search Vol {sortBy === 'searchVolume' && (sortDir === 'desc' ? '▼' : '▲')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-brand-600" onClick={() => handleSort('competition')}>
                    Competition {sortBy === 'competition' && (sortDir === 'desc' ? '▼' : '▲')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Listings</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:text-brand-600" onClick={() => handleSort('opportunity')}>
                    Opportunity {sortBy === 'opportunity' && (sortDir === 'desc' ? '▼' : '▲')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((kw, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${i < 3 ? 'bg-amber-500' : 'bg-gray-400'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{kw.keyword}</td>
                    <td className="px-4 py-3 text-gray-600">{kw.searchVolume.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${compClass(kw.competition)}`}>
                        {kw.competition}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{kw.listings.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${oppClass(kw.opportunity)}`}>
                        {kw.opportunity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 capitalize">
                        {trendIcon(kw.trend)} {kw.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Estimates based on linguistic frequency data. For exact metrics, integrate with Etsy API or paid tools.
          </p>
        </div>
      )}
    </div>
  );
}
