export interface KeywordModifiers {
  quality: string[];
  style: string[];
  occasion: string[];
  adjectives: string[];
  materials: string[];
  actions: string[];
}

const MODIFIERS: KeywordModifiers = {
  quality: ['best', 'premium', 'quality', 'handmade', 'custom', 'unique'],
  style: ['modern', 'vintage', 'rustic', 'minimalist', 'boho', 'elegant'],
  occasion: ['wedding', 'birthday', 'gift', 'christmas', 'anniversary'],
  adjectives: ['beautiful', 'cute', 'pretty', 'small', 'large', 'personalized'],
  materials: ['wood', 'metal', 'leather', 'cotton', 'ceramic', 'glass'],
  actions: ['for', 'with', 'set', 'kit', 'bundle']
};

/**
 * Generate keyword variations using algorithm
 * This runs on the frontend before sending to backend
 */
export function generateKeywordVariations(
  keyword: string,
  description: string
): string[] {
  const variations = new Set<string>();
  const words = keyword.toLowerCase().split(' ');
  const descWords = description.toLowerCase().split(' ').filter(w => w.length > 3);
  
  // Original keyword
  variations.add(keyword.toLowerCase());

  // Single word variations with modifiers
  Object.values(MODIFIERS).flat().forEach(modifier => {
    variations.add(`${modifier} ${keyword}`);
    variations.add(`${keyword} ${modifier}`);
  });

  // Two-word combinations from description
  descWords.slice(0, 10).forEach(word => {
    variations.add(`${keyword} ${word}`);
    variations.add(`${word} ${keyword}`);
  });

// Long-tail combinations (3-4 words)
Object.values(MODIFIERS).forEach((mods: string[]) => {
  mods.slice(0, 3).forEach((mod: string) => {  // ✅ Fixed
    descWords.slice(0, 3).forEach((word: string) => {
      variations.add(`${mod} ${keyword} ${word}`);
      variations.add(`${keyword} ${word} ${mod}`);
    });
  });
});

  // Plurals
  words.forEach(word => {
    if (!word.endsWith('s')) {
      variations.add(keyword.replace(word, word + 's'));
    }
  });

  return Array.from(variations).filter(v => v.length > 2 && v.length < 80);
}

/**
 * Generate SEO-optimized title
 */
export function generateTitle(keywords: string[], mainKeyword: string, maxLength: number = 140): string {
  let title = mainKeyword.split(' ').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
  
  const additionalWords = keywords
    .slice(0, 3)
    .flatMap(k => k.split(' '))
    .filter(w => !title.toLowerCase().includes(w.toLowerCase()))
    .slice(0, 5);
  
  if (additionalWords.length > 0) {
    title += ' - ' + additionalWords.map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  }
  
  return title.slice(0, maxLength);
}

/**
 * Generate SEO-optimized description
 */
export function generateDescription(keywords: string[], mainKeyword: string, description: string): string {
  const sentences = [
    `${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} - ${description}`,
    `Keywords: ${keywords.slice(0, 3).join(', ')}.`,
    `Perfect for those searching for ${keywords[0]}.`
  ];
  
  return sentences.join(' ');
}