export interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: number;
  resultCount: number;
}

export interface ScoredKeyword extends KeywordData {
  wordCount: number;
  score: number;
  competitionRatio: string;
  competitionPercent: string;
}

/**
 * Score and rank keywords based on multiple factors
 */
export function scoreKeywords(
  keywords: KeywordData[],
  platform: 'etsy' | 'google'
): ScoredKeyword[] {
  const scored = keywords.map(data => {
    const wordCount = data.keyword.split(' ').length;
    const length = data.keyword.length;
    let score = 0;
    
    // Long-tail preference (2-4 words)
    if (wordCount >= 2 && wordCount <= 4) score += 30;
    
    // High search volume
    if (data.searchVolume > 1000) score += 20;
    if (data.searchVolume > 5000) score += 10;
    
    // Low competition
    if (data.competition < 0.3) score += 25;
    if (data.competition < 0.5) score += 15;
    
    // Platform-specific bonuses
    if (platform === 'etsy') {
      if (data.keyword.includes('handmade') || data.keyword.includes('custom')) score += 10;
      if (data.keyword.includes('vintage') || data.keyword.includes('gift')) score += 5;
    }
    
    // Length optimization (15-40 chars ideal)
    if (length >= 15 && length <= 40) score += 10;
    
    // Competition ratio
    const competitionRatio = data.searchVolume / (data.resultCount / 1000);
    if (competitionRatio > 5) score += 15;
    
    return {
      ...data,
      wordCount,
      score: Math.round(score),
      competitionRatio: competitionRatio.toFixed(2),
      competitionPercent: (data.competition * 100).toFixed(1)
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Call backend API to analyze keywords
 */
export async function analyzeKeywordsAPI(
  keywords: string[],
  platform: 'etsy' | 'google'
): Promise<KeywordData[]> {
  try {
    const response = await fetch('/api/analyze-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keywords, platform }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.keywords;
  } catch (error) {
    console.error('Error calling API:', error);
    // Return mock data for development
    return keywords.map(keyword => ({
      keyword,
      searchVolume: Math.floor(Math.random() * 10000) + 100,
      competition: Math.random(),
      resultCount: Math.floor(Math.random() * 1000000) + 1000,
    }));
  }
}