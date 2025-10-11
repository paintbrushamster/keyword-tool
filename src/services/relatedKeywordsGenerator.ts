const IS_PRODUCTION = import.meta.env.PROD;

export async function generateRelatedKeywords(
  mainKeyword: string,
  description: string
): Promise<{ keywords: string[]; debug?: any }> {
  try {
    const response = await fetch('/api/generate-related-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mainKeyword, description }),
    });

    if (!response.ok) {
      throw new Error(`API failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling API:', error);
    
    // Fallback for development
    if (!IS_PRODUCTION) {
      return {
        keywords: generateFallbackKeywords(mainKeyword, description),
        debug: { steps: ['Using fallback - API unavailable in dev mode'] }
      };
    }
    
    throw error;
  }
}

function generateFallbackKeywords(mainKeyword: string, description: string): string[] {
  const words = mainKeyword.toLowerCase().split(' ');
  const formats = ['svg', 'png', 'jpg', 'pdf', 'eps'];
  const holidays = ['christmas', 'halloween', 'easter', 'thanksgiving', 'mothers day'];
  const seasons = ['spring', 'summer', 'fall', 'winter'];
  
  const keywords = new Set<string>([
    mainKeyword,
    ...formats.map(f => `${mainKeyword} ${f}`),
    ...holidays.map(h => `${mainKeyword} ${h}`),
    ...seasons.map(s => `${s} ${mainKeyword}`),
    ...words.map(w => `${w} clipart`),
    ...words.map(w => `${w} design`),
    ...words.map(w => `watercolor ${w}`),
    ...words.map(w => `${w} digital download`),
  ]);
  
  return Array.from(keywords).slice(0, 50);
}