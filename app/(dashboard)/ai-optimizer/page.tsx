'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Download, Check, AlertCircle, Crown, Target, FileText, PenTool, ArrowRight } from 'lucide-react';
import type { AiOptimizeResponse, AiKeyword } from '@/types';

export default function AiOptimizerPage() {
  const [keyword, setKeyword] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiOptimizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), description: description.trim() || undefined, category: category.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || 'Optimization failed');
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const exportCSV = () => {
    if (!result) return;
    const rows = [
      ['Rank', 'Keyword', 'Search Volume', 'Competition', 'Opportunity', 'Reason'],
      ...result.keywords.map(k => [k.rank, `"${k.keyword}"`, k.searchVolume, k.competition, k.opportunity, `"${k.reason}"`]),
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-keywords-${keyword.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const volClass = (v: string) => v.toLowerCase() === 'high' ? 'bg-blue-100 text-blue-700' : v.toLowerCase() === 'medium' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600';
  const compClass = (c: string) => c.toLowerCase() === 'low' ? 'bg-green-100 text-green-700' : c.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 text-white text-xs font-semibold">
            <Sparkles size={12} /> AI-Powered
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Magic SEO Engine</h1>
        <p className="text-gray-500 mt-1">
          AI analyzes search data to find the 13 best keywords, generate an optimized title, and write SEO-friendly copy.
        </p>
      </div>

      {/* Form */}
      <div className="card mb-6">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Target size={15} className="text-brand-500" /> Product Keyword *
            </label>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="input-field"
              placeholder="e.g., wooden jewelry box, crochet baby blanket"
              disabled={loading}
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <FileText size={15} className="text-brand-500" /> Product Description (optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Describe your product — materials, style, who it's for..."
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">The more detail you give, the better the AI recommendations.</p>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <PenTool size={15} className="text-brand-500" /> Etsy Category (optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input-field"
              placeholder="e.g., Jewelry, Home & Living, Craft Supplies"
              disabled={loading}
            />
          </div>
          <button onClick={handleOptimize} disabled={loading || !keyword.trim()} className="btn-primary w-full py-3">
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Analyzing with AI... This may take a moment</>
            ) : (
              <><Sparkles size={18} /> Optimize Keywords with AI</>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card mb-6 bg-red-50 border-red-200 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
            {error.includes('ANTHROPIC_API_KEY') && (
              <p className="text-xs text-red-600 mt-1">Set your Anthropic API key in Vercel environment variables.</p>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Strategy */}
          {result.strategy && (
            <div className="card mb-6 bg-gradient-to-br from-brand-50 to-indigo-50 border-brand-200">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-700 mb-2">
                <Target size={16} /> Keyword Strategy
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{result.strategy}</p>
              <p className="text-xs text-gray-500 mt-3">
                Analyzed {result.dataSourced.totalDataPoints} data points from {result.dataSourced.suggestionsUsed} suggestions and {result.dataSourced.relatedWordsUsed} related terms.
              </p>
            </div>
          )}

          {/* 13 Keywords */}
          <div className="card mb-6">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Crown size={20} className="text-amber-500" /> Top 13 Keywords
                </h2>
                <p className="text-sm text-gray-500">Ranked by importance — balancing search demand with competition</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copy(result.keywords.map(k => k.keyword).join('\n'), 'kw')} className="btn-secondary text-sm">
                  {copiedField === 'kw' ? <Check size={14} /> : <Copy size={14} />} {copiedField === 'kw' ? 'Copied!' : 'Copy All'}
                </button>
                <button onClick={exportCSV} className="btn-secondary text-sm">
                  <Download size={14} /> Export
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {result.keywords.map((kw, i) => (
                <div key={i} className={`flex items-center gap-4 p-3.5 rounded-lg border transition hover:border-brand-300 hover:shadow-sm ${i < 3 ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200 bg-white'}`}>
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-white flex-shrink-0 ${i < 3 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gray-300'}`}>
                    {kw.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{kw.keyword}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{kw.reason}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${volClass(kw.searchVolume)}`}>{kw.searchVolume} vol</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${compClass(kw.competition)}`}>{kw.competition} comp</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">{kw.opportunity} opp</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Optimized Etsy Title</h2>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${result.title.length > 140 ? 'text-red-500' : 'text-gray-500'}`}>
                  {result.title.length}/140 characters
                </span>
                <button onClick={() => copy(result.title, 'title')} className="btn-secondary text-xs py-1.5 px-3">
                  {copiedField === 'title' ? <Check size={12} /> : <Copy size={12} />} {copiedField === 'title' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-base font-medium text-gray-800">{result.title}</div>
          </div>

          {/* Description */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">SEO Description</h2>
              <button onClick={() => copy(result.description, 'desc')} className="btn-secondary text-xs py-1.5 px-3">
                {copiedField === 'desc' ? <Check size={12} /> : <Copy size={12} />} {copiedField === 'desc' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.description}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
