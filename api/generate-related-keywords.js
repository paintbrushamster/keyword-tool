// ============================================
// KEYWORD GENERATOR WITH DATAMUSE API
// ============================================

const KEYWORD_CATEGORIES = {
  keywordTypes: [
    'svg', 'png', 'jpg', 'jpeg',
    'clipart', 'graphic', 'design', 'illustration', // productTypes
    'digital download', 'instant download', 'printable', 'digital file',
    'cricut', 'silhouette', 'sublimation',
    'cricut design', 'cut file', 'cutting file',
    'cricut file'
  ],
  craftStyles: [
    'watercolor', 'hand drawn', 'hand painted', 'vintage', 'retro',
    'modern', 'minimalist', 'boho', 'rustic', 'floral', 'botanical'
  ],
  holidays: [
    'christmas', 'halloween', 'thanksgiving', 'easter', 'valentines day',
    'mothers day', 'fathers day', 'new year', 'st patricks day',
    '4th of july', 'memorial day', 'labor day'
  ],
  seasons: ['spring', 'summer', 'fall', 'autumn', 'winter'],
  occasions: [
    'wedding', 'birthday', 'baby shower', 'bridal shower',
    'graduation', 'anniversary', 'engagement', 'party', 'gift'
  ],
  usage: ['commercial use'] // Only the full phrase
};

const FILLER_WORDS = new Set([
  'available', 'use', 'with', 'and', 'the', 'a', 'an', 'for', 'in',
  'on', 'at', 'to', 'from', 'by', 'of', 'or', 'as', 'be', 'is', 'are', 'it'
]);

// Fetch related words from ConceptNet API
async function fetchRelatedWords(word) {
  try {
    // Query ConceptNet for related words in English
    const response = await fetch(
      `https://api.conceptnet.io/query?node=/c/en/${encodeURIComponent(word)}&other=/c/en&rel=/r/RelatedTo&limit=20`
    );
    if (!response.ok) return [];
    const data = await response.json();
    // Extract related words from ConceptNet edges
    const related = data.edges
      .map(edge => {
        // Get the end node label
        const end = edge.end && edge.end.label ? edge.end.label.toLowerCase() : '';
        // Filter out the original word and short/irrelevant results
        return end !== word.toLowerCase() && end.length > 2 ? end : null;
      })
      .filter(Boolean);
    // Return up to 10 unique related words
    return Array.from(new Set(related)).slice(0, 10);
  } catch (error) {
    console.error('ConceptNet API error:', error);
    return [];
  }
}

// Main handler
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mainKeyword, description } = req.body;

  if (!mainKeyword || !mainKeyword.trim()) {
    return res.status(400).json({ error: 'Main keyword is required' });
  }

  try {
    const allKeywords = new Map();
    const debug = { steps: [] };
    
    const context = detectContext(mainKeyword, description || '');
    debug.steps.push(`Main words: ${context.coreWords.join(', ')}`);
    debug.steps.push(`Keyword types: ${context.mentionedKeywordTypes.join(', ')}`);
    
    // Fetch related words for each core word
    const relatedWordsMap = new Map();
    for (const word of context.coreWords.slice(0, 2)) {
      const related = await fetchRelatedWords(word);
      if (related.length > 0) {
        relatedWordsMap.set(word, related);
        debug.steps.push(`Related to "${word}": ${related.slice(0, 5).join(', ')}`);
      }
    }
    
    // Base keywords (with main keyword priority)
    const baseKeywords = extractBaseKeywords(mainKeyword, description || '', context, relatedWordsMap);
    debug.steps.push(`Base keywords: ${baseKeywords.length}`);
    
    baseKeywords.forEach((kw, index) => {
      if (isValidKeyword(kw, allKeywords)) {
        allKeywords.set(kw, 100 - index + randomVariance(5));
      }
    });
    
    // Digital variations (main keyword priority)
    addDigitalVariations(allKeywords, context, relatedWordsMap);
    debug.steps.push(`After digital: ${allKeywords.size}`);
    
    // Events (holidays/seasons)
    addEventKeywords(allKeywords, context, relatedWordsMap);
    debug.steps.push(`After events: ${allKeywords.size}`);
    
    // Usage keywords
    if (context.mentionedUsage.length > 0) {
      addUsageKeywords(allKeywords, context);
      debug.steps.push(`After usage: ${allKeywords.size}`);
    }
    
    // Smart combinations
    addSmartCombinations(allKeywords, context, relatedWordsMap);
    debug.steps.push(`After combinations: ${allKeywords.size}`);
    
    // Sort and deduplicate
    let keywords = Array.from(allKeywords.entries())
      .filter(([keyword]) => isValidKeyword(keyword, new Map()))
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => keyword)
      .slice(0, 50);

    // Final deduplication and filter: no keyword can contain both a file format and a product type
    // (REMOVED: now all types are combined, so no need for this check)
    debug.steps.push(`Final (after dedup): ${keywords.length}`);
    
    return res.status(200).json({ keywords, debug });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate keywords',
      details: error.message 
    });
  }
}

function randomVariance(range) {
  return Math.floor(Math.random() * range * 2) - range;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function detectContext(mainKeyword, description) {
  const fullText = `${mainKeyword} ${description}`.toLowerCase();

  // Prioritize keywordTypes mentioned in description or mainKeyword
  const allKeywordTypes = KEYWORD_CATEGORIES.keywordTypes.filter(f =>
    fullText.includes(f)
  );
  // If none mentioned, use default top 3
  const mentionedKeywordTypes = allKeywordTypes.length ? allKeywordTypes : KEYWORD_CATEGORIES.keywordTypes.slice(0, 3);

  const mentionedStyles = KEYWORD_CATEGORIES.craftStyles.filter(s =>
    fullText.includes(s)
  );

  const mentionedUsage = KEYWORD_CATEGORIES.usage.filter(u =>
    fullText.includes(u)
  );

  const hasDigitalKeywords =
    mentionedKeywordTypes.length > 0 ||
    fullText.includes('digital') ||
    fullText.includes('download') ||
    fullText.includes('cricut') ||
    fullText.includes('silhouette') ||
    fullText.includes('clipart') ||
    fullText.includes('graphic');

  // Extract core words from main keyword and description, prioritizing keywordTypes and styles
  let coreWords = mainKeyword.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !FILLER_WORDS.has(w));
  let descWords = description.toLowerCase().split(/[\s,\.!?;]+/).map(w => w.trim()).filter(w =>
    w.length > 2 && !FILLER_WORDS.has(w) && !mentionedKeywordTypes.includes(w) && !coreWords.includes(w)
  );
  // Add prioritized keywordTypes and styles from description
  descWords = [...new Set([...descWords, ...mentionedKeywordTypes, ...mentionedStyles])];
  // Remove duplicates
  coreWords = [...new Set(coreWords.concat(descWords))];

  return {
    isDigital: hasDigitalKeywords,
    coreWords,
    descWords,
    mentionedKeywordTypes,
    mentionedStyles,
    mentionedUsage,
    hasBundle: fullText.includes('bundle') || fullText.includes('set'),
    hasCollection: fullText.includes('collection') || fullText.includes('pack')
  };
}

function extractBaseKeywords(mainKeyword, description, context, relatedWordsMap) {
  const keywords = new Set();
  const keywordTypes = context.mentionedKeywordTypes;

  // 1. Main/related word + keywordType
  [...context.coreWords, ...context.coreWords.flatMap(coreWord => relatedWordsMap.get(coreWord) || [])].forEach(word => {
    keywordTypes.forEach(type => {
      if (word !== type) {
        keywords.add(`${word} ${type}`);
      }
    });
  });

  // 2. Style + main/related word
  context.mentionedStyles.forEach(style => {
    [...context.coreWords, ...context.coreWords.flatMap(coreWord => relatedWordsMap.get(coreWord) || [])].forEach(word => {
      if (word !== style) {
        keywords.add(`${style} ${word}`);
      }
    });
  });

  // 3. Main/related word + event + keywordType
  const events = [...KEYWORD_CATEGORIES.holidays, ...KEYWORD_CATEGORIES.seasons, ...KEYWORD_CATEGORIES.occasions];
  [...context.coreWords, ...context.coreWords.flatMap(coreWord => relatedWordsMap.get(coreWord) || [])].forEach(word => {
    events.forEach(event => {
      keywordTypes.forEach(type => {
        if (word !== type && event !== type) {
          keywords.add(`${word} ${event} ${type}`);
        }
      });
    });
  });

  // Remove any keyword that contains more than one keywordType
  return Array.from(keywords).filter(kw => {
    const parts = kw.trim().split(/\s+/);
    const typeCount = parts.filter(p => keywordTypes.includes(p)).length;
    if (typeCount > 1) return false;
    return parts.length > 1;
  });
}

function addDigitalVariations(allKeywords, context, relatedWordsMap) {
  context.coreWords.forEach(coreWord => {
    // Core word + all keywordTypes
    context.mentionedKeywordTypes.forEach(type => {
      const keyword = `${coreWord} ${type}`;
      if (!allKeywords.has(keyword)) {
        allKeywords.set(keyword, 90 + randomVariance(5));
      }
    });

    // Core word + digital products (subset)
    KEYWORD_CATEGORIES.keywordTypes.slice(6, 12).forEach(product => {
      const keyword = `${coreWord} ${product}`;
      if (!allKeywords.has(keyword) && !hasDuplicateKeywordTypes(keyword)) {
        allKeywords.set(keyword, 80 + randomVariance(5));
      }
    });
  });

  // Related words variations
  context.coreWords.forEach(coreWord => {
    const related = relatedWordsMap.get(coreWord) || [];
    related.slice(0, 3).forEach(relatedWord => {
      context.mentionedKeywordTypes.slice(0, 2).forEach(type => {
        const keyword = `${relatedWord} ${type}`;
        if (!allKeywords.has(keyword)) {
          allKeywords.set(keyword, 75 + randomVariance(5));
        }
      });
    });
  });

  // Only add bundle/collection if mentioned
  if (context.hasBundle) {
    context.coreWords.forEach(word => {
      allKeywords.set(`${word} bundle`, 85 + randomVariance(5));
    });
  }

  if (context.hasCollection) {
    context.coreWords.forEach(word => {
      allKeywords.set(`${word} collection`, 85 + randomVariance(5));
    });
  }
}

function addEventKeywords(allKeywords, context, relatedWordsMap) {
  // Holidays with CORE words (priority)
  context.coreWords.forEach(coreWord => {
    shuffleArray(KEYWORD_CATEGORIES.holidays).slice(0, 8).forEach(holiday => {
      allKeywords.set(`${coreWord} ${holiday}`, 70 + randomVariance(5));
      allKeywords.set(`${holiday} ${coreWord}`, 70 + randomVariance(5));
    });
  });
  
  // Seasons with core words
  context.coreWords.forEach(coreWord => {
    KEYWORD_CATEGORIES.seasons.forEach(season => {
      allKeywords.set(`${season} ${coreWord}`, 65 + randomVariance(5));
    });
  });
  
  // Occasions with core words
  context.coreWords.forEach(coreWord => {
    shuffleArray(KEYWORD_CATEGORIES.occasions).slice(0, 6).forEach(occasion => {
      allKeywords.set(`${coreWord} ${occasion}`, 65 + randomVariance(5));
    });
  });
  
  // Related words with holidays (secondary)
  context.coreWords.forEach(coreWord => {
    const related = relatedWordsMap.get(coreWord) || [];
    related.slice(0, 2).forEach(relatedWord => {
      KEYWORD_CATEGORIES.holidays.slice(0, 3).forEach(holiday => {
        allKeywords.set(`${relatedWord} ${holiday}`, 60 + randomVariance(5));
      });
    });
  });
}

function addUsageKeywords(allKeywords, context) {
  context.coreWords.forEach(coreWord => {
    context.mentionedUsage.forEach(usage => {
      allKeywords.set(`${coreWord} ${usage}`, 75 + randomVariance(5));
    });
  });
}

function addSmartCombinations(allKeywords, context, relatedWordsMap) {
  // 3-word combinations with CORE words
  context.coreWords.forEach(coreWord => {
    // Style + core + keywordType
    context.mentionedStyles.slice(0, 2).forEach(style => {
      context.mentionedKeywordTypes.slice(0, 3).forEach(type => {
        const keyword = `${style} ${coreWord} ${type}`;
        if (!allKeywords.has(keyword) && !hasDuplicateKeywordTypes(keyword)) {
          allKeywords.set(keyword, 72 + randomVariance(5));
        }
      });
    });
  });
  
  // Related word combos
  context.coreWords.forEach(coreWord => {
    const related = relatedWordsMap.get(coreWord) || [];
    related.slice(0, 2).forEach(relatedWord => {
      context.mentionedKeywordTypes.slice(0, 2).forEach(type => {
        const keyword = `${relatedWord} ${type}`;
        if (!allKeywords.has(keyword) && !hasDuplicateKeywordTypes(keyword)) {
          allKeywords.set(keyword, 68 + randomVariance(5));
        }
      });
    });
  });
}

function isValidKeyword(keyword, existingKeywords) {
  const words = keyword.trim().toLowerCase().split(/\s+/);
  if (words.length < 2) return false; // No one-word results
  if (words.length > 4) return false;
  if (keyword.length > 80) return false;
  if (words.includes('ai')) return false; // Exclude 'ai'
  // Check for duplicate words in the keyword
  const wordSet = new Set(words);
  if (wordSet.size !== words.length) return false;
  if (existingKeywords.has(keyword.toLowerCase())) return false;
  if (hasDuplicateKeywordTypes(keyword)) return false;
  const nonFillerWords = words.filter(w => !FILLER_WORDS.has(w));
  if (nonFillerWords.length === 0) return false;
  return true;
}

function hasDuplicateKeywordTypes(keyword) {
  const words = keyword.toLowerCase().split(/\s+/);
  const types = words.filter(w => KEYWORD_CATEGORIES.keywordTypes.includes(w));
  return types.length > 1;
}