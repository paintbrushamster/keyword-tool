import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Download, Check, AlertCircle, Crown, Target, FileText, PenTool } from 'lucide-react';
import './AiOptimizer.css';

interface AiKeyword {
  rank: number;
  keyword: string;
  searchVolume: string;
  competition: string;
  opportunity: number;
  reason: string;
}

interface AiResult {
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

const AiOptimizer: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          description: description.trim() || undefined,
          category: category.trim() || undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.error || 'Optimization failed');
      }

      const data: AiResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAllKeywords = () => {
    if (!result) return;
    const text = result.keywords.map(k => k.keyword).join('\n');
    copyToClipboard(text, 'keywords');
  };

  const exportCSV = () => {
    if (!result) return;
    const rows = [
      ['Rank', 'Keyword', 'Search Volume', 'Competition', 'Opportunity', 'Reason'],
      ...result.keywords.map(k => [
        k.rank, `"${k.keyword}"`, k.searchVolume, k.competition, k.opportunity, `"${k.reason}"`
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-keywords-${keyword.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getVolumeClass = (vol: string) => {
    switch (vol.toLowerCase()) {
      case 'high': return 'vol-high';
      case 'medium': return 'vol-med';
      default: return 'vol-low';
    }
  };

  const getCompClass = (comp: string) => {
    switch (comp.toLowerCase()) {
      case 'low': return 'ai-comp-low';
      case 'medium': return 'ai-comp-med';
      default: return 'ai-comp-high';
    }
  };

  return (
    <div className="optimizer-page">
      <div className="container">
        {/* Header */}
        <div className="card optimizer-header">
          <div className="header-badge">
            <Sparkles size={24} />
            <span>AI-Powered</span>
          </div>
          <h1 className="page-title">Keyword Optimizer</h1>
          <p className="subtitle">
            Enter your product keyword and our AI will analyze search data to find the 13 best keywords,
            generate an optimized Etsy title, and write an SEO-friendly description. Only keywords with
            real search demand are recommended.
          </p>
        </div>

        {/* Input Form */}
        <div className="card">
          <div className="form-group">
            <label htmlFor="ai-keyword">
              <Target size={16} className="label-icon" />
              Product Keyword *
            </label>
            <input
              id="ai-keyword"
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="e.g., wooden jewelry box, crochet baby blanket, wedding invitation template"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ai-description">
              <FileText size={16} className="label-icon" />
              Product Description (optional)
            </label>
            <textarea
              id="ai-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your product - materials, style, who it's for, what makes it special..."
              rows={3}
              disabled={loading}
            />
            <small className="form-hint">
              The more detail you give, the more targeted the keywords will be.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="ai-category">
              <PenTool size={16} className="label-icon" />
              Etsy Category (optional)
            </label>
            <input
              id="ai-category"
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g., Jewelry, Home & Living, Art & Collectibles, Craft Supplies"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading || !keyword.trim()}
            className="btn btn-primary full-width optimize-btn"
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Analyzing with AI... This may take a moment
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Optimize Keywords with AI
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="card error-card">
            <AlertCircle size={20} />
            <div>
              <strong>Error</strong>
              <p>{error}</p>
              {error.includes('ANTHROPIC_API_KEY') && (
                <p className="error-help">
                  Set your Anthropic API key in your Vercel project settings under Environment Variables.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Strategy Overview */}
            {result.strategy && (
              <div className="card strategy-card">
                <h3>
                  <Target size={18} />
                  Keyword Strategy
                </h3>
                <p>{result.strategy}</p>
                <div className="data-sourced">
                  Analyzed {result.dataSourced.totalDataPoints} data points from {result.dataSourced.suggestionsUsed} suggestions
                  and {result.dataSourced.relatedWordsUsed} related terms.
                </div>
              </div>
            )}

            {/* 13 Keywords */}
            <div className="card">
              <div className="results-header">
                <div>
                  <h2>
                    <Crown size={22} className="crown-icon" />
                    Top 13 Keywords
                  </h2>
                  <p className="subtitle">Ranked by importance — balancing search demand with competition</p>
                </div>
                <div className="header-actions">
                  <button onClick={copyAllKeywords} className="btn btn-secondary">
                    {copiedField === 'keywords' ? <Check size={16} /> : <Copy size={16} />}
                    {copiedField === 'keywords' ? 'Copied!' : 'Copy All'}
                  </button>
                  <button onClick={exportCSV} className="btn btn-secondary">
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>

              <div className="keywords-list">
                {result.keywords.map((kw, index) => (
                  <div key={index} className={`keyword-row ${index < 3 ? 'top-keyword' : ''}`}>
                    <div className="keyword-rank">
                      <span className={`rank-number ${index < 3 ? 'gold' : ''}`}>
                        {index < 3 && <Crown size={10} />}
                        {kw.rank}
                      </span>
                    </div>
                    <div className="keyword-info">
                      <div className="keyword-name">{kw.keyword}</div>
                      <div className="keyword-reason">{kw.reason}</div>
                    </div>
                    <div className="keyword-stats">
                      <span className={`stat-pill ${getVolumeClass(kw.searchVolume)}`}>
                        {kw.searchVolume} vol
                      </span>
                      <span className={`stat-pill ${getCompClass(kw.competition)}`}>
                        {kw.competition} comp
                      </span>
                      <span className="stat-pill opp-pill">
                        {kw.opportunity} opp
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="card">
              <div className="seo-section-header">
                <h2>Optimized Etsy Title</h2>
                <div className="seo-meta">
                  <span className={`char-count ${result.title.length > 140 ? 'over' : ''}`}>
                    {result.title.length}/140 characters
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.title, 'title')}
                    className="btn btn-secondary btn-sm"
                  >
                    {copiedField === 'title' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedField === 'title' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="seo-output title-output">{result.title}</div>
            </div>

            {/* Description */}
            <div className="card">
              <div className="seo-section-header">
                <h2>SEO Description</h2>
                <button
                  onClick={() => copyToClipboard(result.description, 'description')}
                  className="btn btn-secondary btn-sm"
                >
                  {copiedField === 'description' ? <Check size={14} /> : <Copy size={14} />}
                  {copiedField === 'description' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="seo-output description-output">{result.description}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AiOptimizer;
