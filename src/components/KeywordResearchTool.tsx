import React, { useState } from 'react';
import { Search, Loader2, Download, Info } from 'lucide-react';
import { generateKeywordVariations, generateTitle, generateDescription } from '../services/keywordGenerator';
import { scoreKeywords, analyzeKeywordsAPI, type ScoredKeyword } from '../services/keywordScorer';
import './KeywordResearchTool.css';

interface KeywordResults {
  keywords: ScoredKeyword[];
  title: string;
  description: string;
  totalAnalyzed: number;
}

const KeywordResearchTool: React.FC = () => {
  const [mainKeyword, setMainKeyword] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [numKeywords, setNumKeywords] = useState<number>(10);
  const [platform, setPlatform] = useState<'etsy' | 'google'>('etsy');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<KeywordResults | null>(null);

  const handleGenerate = async (): Promise<void> => {
    if (!mainKeyword.trim()) {
      alert('Please enter a main keyword');
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Generate variations (frontend algorithm)
      const variations = generateKeywordVariations(mainKeyword, description);
      
      // Step 2: Send to backend API for real data
      const apiData = await analyzeKeywordsAPI(variations, platform);
      
      // Step 3: Score and rank
      const scored = scoreKeywords(apiData, platform);
      
      // Step 4: Select top N
      const topKeywords = scored.slice(0, numKeywords);
      
      // Step 5: Generate SEO content
      const title = generateTitle(topKeywords.map(k => k.keyword), mainKeyword);
      const seoDescription = generateDescription(topKeywords.map(k => k.keyword), mainKeyword, description);
      
      setResults({
        keywords: topKeywords,
        title,
        description: seoDescription,
        totalAnalyzed: variations.length
      });
    } catch (error) {
      console.error('Error generating keywords:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = (): void => {
    if (!results) return;
    
    const csv = [
      ['Rank', 'Keyword', 'Search Volume', 'Competition %', 'Results', 'Words', 'Score'],
      ...results.keywords.map((k, i) => [
        i + 1,
        k.keyword,
        k.searchVolume,
        k.competitionPercent,
        k.resultCount,
        k.wordCount,
        k.score
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${mainKeyword.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="keyword-page">
      <div className="container">
        {/* Header */}
        <div className="card">
          <h1 className="page-title">Keyword Research Tool</h1>
          <p className="subtitle">Generate SEO-optimized keywords for Etsy and other platforms</p>
        </div>

        {/* Input Form */}
        <div className="card">
          <div className="form-group">
            <label htmlFor="mainKeyword">Main Keyword *</label>
            <input
              id="mainKeyword"
              type="text"
              value={mainKeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              placeholder="e.g., wooden jewelry box"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Item Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item to help generate relevant keywords..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numKeywords">Number of Keywords</label>
              <input
                id="numKeywords"
                type="number"
                min={5}
                max={50}
                value={numKeywords}
                onChange={(e) => setNumKeywords(parseInt(e.target.value) || 10)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="platform">Platform</label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as 'etsy' | 'google')}
              >
                <option value="etsy">Etsy (prioritize Etsy keywords)</option>
                <option value="google">Google (all platforms)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !mainKeyword.trim()}
            className="btn btn-primary full-width"
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Analyzing Keywords...
              </>
            ) : (
              <>
                <Search size={20} />
                Generate Keywords
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {results && (
          <>
            {/* SEO Content */}
            <div className="card">
              <h2>SEO-Optimized Content</h2>
              
              <div className="seo-section">
                <div>
                  <label>Title ({results.title.length} characters)</label>
                  <div className="seo-output">{results.title}</div>
                </div>

                <div>
                  <label>Description</label>
                  <div className="seo-output">{results.description}</div>
                </div>
              </div>
            </div>

            {/* Keywords Table */}
            <div className="card">
              <div className="results-header">
                <div>
                  <h2>Top {results.keywords.length} Keywords</h2>
                  <p className="subtitle">Analyzed {results.totalAnalyzed} variations</p>
                </div>
                <button onClick={exportResults} className="btn btn-secondary">
                  <Download size={16} />
                  Export CSV
                </button>
              </div>

              <div className="alert alert-info">
                <Info size={20} />
                <div>
                  <p><strong>Demo Mode</strong></p>
                  <p>Configure API keys in backend to get real search data.</p>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Keyword</th>
                      <th>Search Vol.</th>
                      <th>Competition</th>
                      <th>Words</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.keywords.map((keyword, index) => (
                      <tr key={index}>
                        <td>
                          <span className={`rank-badge ${index < 3 ? 'top-rank' : ''}`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="keyword-cell">{keyword.keyword}</td>
                        <td>{keyword.searchVolume.toLocaleString()}</td>
                        <td>
                          <span className={`comp-badge comp-${
                            parseFloat(keyword.competitionPercent) < 30 ? 'low' :
                            parseFloat(keyword.competitionPercent) < 60 ? 'med' : 'high'
                          }`}>
                            {keyword.competitionPercent}%
                          </span>
                        </td>
                        <td>{keyword.wordCount}</td>
                        <td className="score-cell">{keyword.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KeywordResearchTool;