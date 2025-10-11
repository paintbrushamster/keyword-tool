/**
 * Generate related keywords by calling backend API
 */
export async function generateRelatedKeywords(
  mainKeyword: string,
  description: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/generate-related-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mainKeyword,
        description
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.keywords || [];
  } catch (error) {
    console.error('Error calling keyword generation API:', error);
    
    // Fallback: return a simple set if API fails
    return generateFallbackKeywords(mainKeyword);
  }
}

/**
 * Fallback keywords if API fails
 */
function generateFallbackKeywords(mainKeyword: string): string[] {
  const words = mainKeyword.toLowerCase().split(' ');
  const fallback = [
    mainKeyword,
    ...words.map(w => `${w} design`),
    ...words.map(w => `${w} graphic`),
    ...words.map(w => `${w} clipart`),
  ];
  
  return Array.from(new Set(fallback)).slice(0, 20);
}