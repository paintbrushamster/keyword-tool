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
  // Filler words to exclude
  const FILLER_WORDS = new Set([
    'and', 'available', 'to', 'the', 'a', 'an', 'for', 'in', 'on', 'at', 'from', 'by', 'of', 'or', 'as', 'be', 'is', 'are', 'it'
  ]);

  // Extract words from mainKeyword and description
  const mainWords = mainKeyword.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !FILLER_WORDS.has(w));
  const descWords = description.toLowerCase().split(/[\s,\.!?;]+/).filter(w => w.length > 2 && !FILLER_WORDS.has(w));
  const allWords = Array.from(new Set([...mainWords, ...descWords]));

  // Prioritize file formats and styles found in both mainKeyword and description
  const formats = ['svg', 'png', 'jpg', 'pdf', 'eps'];
  const foundFormats = formats.filter(f => mainKeyword.toLowerCase().includes(f) || description.toLowerCase().includes(f));
  const prioritizedFormats = foundFormats.length ? foundFormats : formats.slice(0, 3);

  const holidays = ['christmas', 'halloween', 'easter', 'thanksgiving', 'mothers day'];
  const seasons = ['spring', 'summer', 'fall', 'winter'];
  const styles = ['watercolor', 'clipart'];

  const keywords = new Set<string>();

  // List prioritized file formats first (only one format per keyword)
  prioritizedFormats.forEach(format => {
    allWords.forEach(word => {
      if (word !== format) {
        keywords.add(`${word} ${format}`);
      }
    });
  });

  // Add style combinations
  styles.forEach(style => {
    allWords.forEach(word => {
      if (word !== style) {
        keywords.add(`${style} ${word}`);
      }
    });
  });

  // Add holiday, season combinations (only one format per keyword)
  allWords.forEach(word => {
    holidays.forEach(holiday => {
      prioritizedFormats.forEach(format => {
        keywords.add(`${word} ${holiday} ${format}`);
      });
    });
    seasons.forEach(season => {
      prioritizedFormats.forEach(format => {
        keywords.add(`${word} ${season} ${format}`);
      });
    });
  });

  // Add digital download (only one format per keyword)
  allWords.forEach(word => {
    prioritizedFormats.forEach(format => {
      keywords.add(`${word} digital download ${format}`);
    });
  });

  // Remove any keywords with duplicate words, multiple formats, or filler words
  const deduped = Array.from(keywords).filter(kw => {
    const parts = kw.split(/\s+/);
    const wordSet = new Set(parts);
    // Only one format per keyword
    const formatCount = parts.filter(p => prioritizedFormats.includes(p)).length;
    // No duplicate words, no multiple formats, no filler words
    return wordSet.size === parts.length && formatCount <= 1 && parts.every(p => !FILLER_WORDS.has(p));
  });

  return deduped.slice(0, 50);
}