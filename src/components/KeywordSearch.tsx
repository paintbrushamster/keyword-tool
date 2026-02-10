import React, { useState } from 'react';
import { Search, Loader2, Download, TrendingUp, Minus, ArrowUpRight } from 'lucide-react';
import './KeywordSearch.css';

interface KeywordResult {
  keyword: string;
  searchVolume: number;
  competition: number;
  listings: number;
  opportunity: number;
  trend: 'rising' | 'stable' | 'seasonal';
  wordCount: number;
  source: string;
}

interface SearchResults {
  query: string;
  totalResults: number;
  keywords: KeywordResult[];
  dataSources: string[];
}

const KeywordSearch: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'opportunity' | 'searchVolume' | 'competition'>('opportunity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/keyword-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Search failed');
      }

      const data: SearchResults = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleSearch();
  };

  const handleSort = (column: 'opportunity' | 'searchVolume' | 'competition') => {
    if (sortBy === column) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortDir(column === 'competition' ? 'asc' : 'desc');
    }
  };

  const sortedKeywords = results?.keywords
    ? [...results.keywords].sort((a, b) => {
        const multiplier = sortDir === 'desc' ? -1 : 1;
        return (a[sortBy] - b[sortBy]) * multiplier;
      })
    : [];

  const exportCSV = () => {
    if (!sortedKeywords.length) return;
    const rows = [
      ['Rank', 'Keyword', 'Search Volume', 'Competition %', 'Est. Listings', 'Opportunity', 'Trend', 'Words'],
      ...sortedKeywords.map((k, i) => [
        i + 1, `"${k.keyword}"`, k.searchVolume, k.competition, k.listings, k.opportunity, k.trend, k.wordCount
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyword-search-${keyword.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp size={14} className="trend-icon trend-up" />;
      case 'seasonal': return <ArrowUpRight size={14} className="trend-icon trend-seasonal" />;
      default: return <Minus size={14} className="trend-icon trend-stable" />;
    }
  };

  const getCompetitionClass = (comp: number) => {
    if (comp < 35) return 'comp-low';
    if (comp < 65) return 'comp-med';
    return 'comp-high';
  };

  const getOpportunityClass = (opp: number) => {
    if (opp >= 70) return 'opp-high';
    if (opp >= 40) return 'opp-med';
    return 'opp-low';
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Header */}
        <div className="card search-header-card">
          <h1 className="page-title">Keyword Search</h1>
          <p className="subtitle">
            Search for any keyword to find related terms, search volume estimates, competition levels, and opportunity scores.
            Data sourced from linguistic databases and algorithmic analysis.
          </p>
        </div>

        {/* Search Input */}
        <div className="card">
          <div className="search-input-row">
            <div className="search-input-wrapper">
              <Search size={20} className="search-input-icon" />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a keyword (e.g., wooden jewelry box, crochet pattern, wedding invitation)"
                className="search-input"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !keyword.trim()}
              className="btn btn-primary search-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="spinner" size={18} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Quick search suggestions */}
          <div className="quick-searches">
            <span className="quick-label">Try:</span>
            {['handmade jewelry', 'crochet pattern', 'wedding invitation', 'vintage poster', 'personalized gift'].map(term => (
              <button
                key={term}
                className="quick-chip"
                onClick={() => { setKeyword(term); }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card error-card">
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {results && sortedKeywords.length > 0 && (
          <div className="card">
            <div className="results-header">
              <div>
                <h2>Results for "{results.query}"</h2>
                <p className="subtitle">{results.totalResults} keywords found</p>
              </div>
              <button onClick={exportCSV} className="btn btn-secondary">
                <Download size={16} />
                Export CSV
              </button>
            </div>

            {/* Stats summary */}
            <div className="stats-summary">
              <div className="stat-box">
                <span className="stat-value">{sortedKeywords.length}</span>
                <span className="stat-label">Keywords</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">
                  {Math.round(sortedKeywords.reduce((s, k) => s + k.searchVolume, 0) / sortedKeywords.length).toLocaleString()}
                </span>
                <span className="stat-label">Avg. Search Vol.</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">
                  {Math.round(sortedKeywords.reduce((s, k) => s + k.competition, 0) / sortedKeywords.length)}%
                </span>
                <span className="stat-label">Avg. Competition</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">
                  {sortedKeywords.filter(k => k.opportunity >= 60).length}
                </span>
                <span className="stat-label">High Opportunity</span>
              </div>
            </div>

            {/* Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Keyword</th>
                    <th
                      className={`sortable ${sortBy === 'searchVolume' ? 'sorted' : ''}`}
                      onClick={() => handleSort('searchVolume')}
                    >
                      Search Vol.
                      {sortBy === 'searchVolume' && <span className="sort-arrow">{sortDir === 'desc' ? ' ▼' : ' ▲'}</span>}
                    </th>
                    <th
                      className={`sortable ${sortBy === 'competition' ? 'sorted' : ''}`}
                      onClick={() => handleSort('competition')}
                    >
                      Competition
                      {sortBy === 'competition' && <span className="sort-arrow">{sortDir === 'desc' ? ' ▼' : ' ▲'}</span>}
                    </th>
                    <th>Est. Listings</th>
                    <th
                      className={`sortable ${sortBy === 'opportunity' ? 'sorted' : ''}`}
                      onClick={() => handleSort('opportunity')}
                    >
                      Opportunity
                      {sortBy === 'opportunity' && <span className="sort-arrow">{sortDir === 'desc' ? ' ▼' : ' ▲'}</span>}
                    </th>
                    <th>Trend</th>
                    <th>Words</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedKeywords.map((kw, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`rank-badge ${index < 3 ? 'top-rank' : ''}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="keyword-cell">{kw.keyword}</td>
                      <td>{kw.searchVolume.toLocaleString()}</td>
                      <td>
                        <span className={`comp-badge ${getCompetitionClass(kw.competition)}`}>
                          {kw.competition}%
                        </span>
                      </td>
                      <td>{kw.listings.toLocaleString()}</td>
                      <td>
                        <span className={`opp-badge ${getOpportunityClass(kw.opportunity)}`}>
                          {kw.opportunity}
                        </span>
                      </td>
                      <td>
                        <span className="trend-cell">
                          {getTrendIcon(kw.trend)}
                          <span className="trend-text">{kw.trend}</span>
                        </span>
                      </td>
                      <td>{kw.wordCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="data-note">
              Search volume and competition are estimates based on linguistic frequency data and algorithmic analysis.
              For exact metrics, integrate with Etsy's API or a paid keyword tool.
            </div>
          </div>
        )}

        {results && sortedKeywords.length === 0 && (
          <div className="card">
            <p className="no-results">No keywords found. Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordSearch;
