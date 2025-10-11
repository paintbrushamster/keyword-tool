// src/components/RelatedKeywordsTest.tsx
import React, { useState } from 'react';
import { Loader2, Copy, Sparkles, Download, Bug } from 'lucide-react';
import { generateRelatedKeywords } from '../services/relatedKeywordsGenerator';
import './RelatedKeywordsTest.css';

interface DebugInfo {
  steps: string[];
}

const RelatedKeywordsTest: React.FC = () => {
  const [mainKeyword, setMainKeyword] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [debug, setDebug] = useState<DebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState<boolean>(true);

  const handleGenerate = async (): Promise<void> => {
    if (!mainKeyword.trim()) {
      alert('Please enter a main keyword');
      return;
    }

    setLoading(true);
    
    try {
      const result = await generateRelatedKeywords(mainKeyword, description);
      setKeywords(result.keywords || []);
      setDebug(result.debug || null);
    } catch (error) {
      console.error('Error generating keywords:', error);
      alert(`An error occurred: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(keywords.join('\n'));
    alert('Keywords copied to clipboard!');
  };

  const exportToCSV = (): void => {
    const csv = keywords.map((k, i) => `${i + 1},"${k}"`).join('\n');
    const blob = new Blob([`Rank,Keyword\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${mainKeyword.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleData = (): void => {
    setMainKeyword('sunflower svg');
    setDescription('watercolor sunflower clipart available in svg, png, and jpg. Commercial use.');
  };

  return (
    <div className="related-keywords-page">
      <div className="container">
        <div className="card">
          <h1 className="page-title">Related Keywords Generator</h1>
          <p className="subtitle">
            Generate 50 related keyword combinations using advanced algorithmic analysis. 
            Automatically includes formats, holidays, seasons, occasions, and digital product variations.
          </p>
          <button onClick={loadSampleData} className="btn btn-secondary" style={{ marginTop: '12px' }}>
            Load Sample Data
          </button>
        </div>

        <div className="card">
          <div className="form-group">
            <label htmlFor="mainKeyword">Main Keyword *</label>
            <input
              id="mainKeyword"
              type="text"
              value={mainKeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              placeholder="e.g., sunflower svg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., watercolor sunflower clipart available in svg, png, and jpg. Commercial use."
              rows={4}
            />
            <small style={{ color: 'var(--gray-500)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Tip: The algorithm will automatically expand beyond your description to include holidays, seasons, 
              digital formats, and crafting tools even if not mentioned.
            </small>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !mainKeyword.trim()}
            className="btn btn-primary full-width"
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Generating 50 Keywords...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Related Keywords
              </>
            )}
          </button>
        </div>

        {debug && (
          <div className="card" style={{ background: '#f0f9ff', borderLeft: '4px solid #0ea5e9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bug size={20} />
                Debug Information
              </h3>
              <button 
                onClick={() => setShowDebug(!showDebug)} 
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {showDebug ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showDebug && (
              <div style={{ fontSize: '13px', color: '#0c4a6e', lineHeight: '1.8' }}>
                {debug.steps?.map((step, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>
                    <strong>Step {i + 1}:</strong> {step}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {keywords.length > 0 && (
          <div className="card">
            <div className="results-header">
              <div>
                <h2>Generated Keywords ({keywords.length})</h2>
                <p className="subtitle">Algorithmically generated and ranked by relevance</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={copyToClipboard} className="btn btn-secondary">
                  <Copy size={16} />
                  Copy All
                </button>
                <button onClick={exportToCSV} className="btn btn-secondary">
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="keywords-grid">
              {keywords.map((keyword, index) => (
                <div key={index} className="keyword-chip">
                  <span className="keyword-number">{index + 1}</span>
                  <span className="keyword-text">{keyword}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>What's Included:</h3>
              <ul style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                <li>✓ All file formats (SVG, PNG, JPG, PDF, EPS, etc.)</li>
                <li>✓ Digital product types (Cricut, Silhouette, Sublimation, etc.)</li>
                <li>✓ Style variations (Watercolor, Vintage, Hand-drawn, etc.)</li>
                <li>✓ All major holidays (Christmas, Halloween, Easter, etc.)</li>
                <li>✓ All seasons (Spring, Summer, Fall, Winter)</li>
                <li>✓ Common occasions (Wedding, Birthday, Baby Shower, etc.)</li>
                <li>✓ Product types (Clipart, Bundle, Template, etc.)</li>
                <li>✓ Long-tail combinations (3-4 word keywords)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedKeywordsTest;