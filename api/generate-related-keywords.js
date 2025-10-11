import natural from 'natural';
import compromise from 'compromise';

// Keyword categories
const KEYWORD_CATEGORIES = {
  fileFormats: [
    'svg', 'png', 'jpg', 'jpeg', 'pdf', 'eps', 'ai', 'psd', 'dxf', 
    'studio', 'studio3', 'fcm'
  ],
  digitalProducts: [
    'digital download', 'instant download', 'printable', 'digital file',
    'cricut', 'silhouette', 'sublimation', 'print on demand',
    'cricut design', 'silhouette cameo', 'cut file', 'cutting file',
    'heat transfer', 'vinyl decal'
  ],
  productTypes: [
    'clipart', 'graphic', 'design', 'illustration', 'image',
    'bundle', 'set', 'collection', 'pack', 'kit',
    'template', 'mockup', 'pattern', 'texture'
  ],
  craftStyles: [
    'watercolor', 'hand drawn', 'hand painted', 'vintage', 'retro',
    'modern', 'minimalist', 'boho', 'rustic'
  ],
  physicalProductTypes: [
    'necklace', 'bracelet', 'earrings', 'ring', 'jewelry',
    'pendant', 'charm', 'bead', 'stone', 'crystal', 'gemstone',
    'handmade', 'natural', 'healing', 'spiritual'
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
  qualities: [
    'handmade', 'natural', 'authentic', 'genuine', 'premium',
    'high quality', 'unique', 'custom', 'personalized'
  ]
};

const FILLER_WORDS = new Set([
  'available', 'use', 'with', 'and', 'the', 'a', 'an', 'for', 'in',
  'on', 'at', 'to', 'from', 'by', 'of', 'or', 'as', 'be', 'is', 'are'
]);

export default async function handler(req, res) {
  // Enable CORS
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
    
    // Step 1: Detect context
    const context = detectContext(mainKeyword, description || '');
    
    // Step 2: Extract base keywords using NLP
    const baseKeywords = extractBaseKeywords(mainKeyword, description || '', context);
    
    // Step 3: Add base keywords
    baseKeywords.forEach((kw, index) => {
      if (isValidKeyword(kw)) {
        allKeywords.set(kw, 100 - index);
      }
    });
    
    // Step 4: Generate variations
    if (context.isDigital && context.mentionedFormats.length > 0) {
      addDigitalVariations(allKeywords, context);
    }
    
    if (context.isPhysical || !context.isDigital) {
      addPhysicalProductVariations(allKeywords, context);
    }
    
    // Step 5: Add event keywords
    addEventKeywords(allKeywords, context);
    
    // Step 6: Add synonyms using WordNet
    await addRelatedWords(allKeywords, context.mainNouns);
    
    // Step 7: Add combinations
    addSmartCombinations(allKeywords, context);
    
    // Filter and return top 50
    const keywords = Array.from(allKeywords.entries())
      .filter(([keyword]) => isValidKeyword(keyword))
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => keyword)
      .slice(0, 50);

    return res.status(200).json({ keywords });
  } catch (error) {
    console.error('Error generating keywords:', error);
    return res.status(500).json({ error: 'Failed to generate keywords' });
  }
}

// Helper Functions

function detectContext(mainKeyword, description) {
  const fullText = `${mainKeyword} ${description}`.toLowerCase();
  
  const mentionedFormats = KEYWORD_CATEGORIES.fileFormats.filter(f => 
    fullText.includes(f)
  );
  
  const hasDigitalKeywords = 
    mentionedFormats.length > 0 ||
    fullText.includes('digital') ||
    fullText.includes('download') ||
    fullText.includes('cricut') ||
    fullText.includes('silhouette') ||
    fullText.includes('clipart') ||
    fullText.includes('graphic');
  
  const hasPhysicalKeywords = KEYWORD_CATEGORIES.physicalProductTypes.some(p =>
    fullText.includes(p)
  );
  
  // Use compromise to extract nouns and adjectives
  const doc = compromise(fullText);
  const mainNouns = doc.nouns().out('array').filter(n => n.length > 2 && !FILLER_WORDS.has(n));
  const mainAdjectives = doc.adjectives().out('array').filter(a => a.length > 2);
  
  return {
    isDigital: hasDigitalKeywords,
    isPhysical: hasPhysicalKeywords,
    mentionedFormats,
    mainNouns: Array.from(new Set(mainNouns)),
    mainAdjectives: Array.from(new Set(mainAdjectives)),
    productType: hasDigitalKeywords && !hasPhysicalKeywords ? 'digital' :
                 hasPhysicalKeywords && !hasDigitalKeywords ? 'physical' : 'mixed'
  };
}

function extractBaseKeywords(mainKeyword, description, context) {
  const keywords = new Set();
  const fullText = `${mainKeyword}. ${description}`;
  
  keywords.add(mainKeyword.toLowerCase().trim());
  
  const doc = compromise(fullText);
  const nounPhrases = doc.match('#Adjective? #Noun+').out('array');
  
  nounPhrases.forEach(phrase => {
    const cleaned = phrase.toLowerCase().trim();
    if (cleaned.split(' ').length >= 2 && cleaned.split(' ').length <= 3) {
      keywords.add(cleaned);
    }
  });
  
  context.mainNouns.forEach((noun, i) => {
    context.mainAdjectives.forEach(adj => {
      keywords.add(`${adj} ${noun}`);
    });
    
    if (i < context.mainNouns.length - 1) {
      keywords.add(`${noun} ${context.mainNouns[i + 1]}`);
    }
  });
  
  return Array.from(keywords).slice(0, 15);
}

function addDigitalVariations(allKeywords, context) {
  const mainWords = context.mainNouns.slice(0, 3);
  
  mainWords.forEach(word => {
    context.mentionedFormats.forEach(format => {
      const keyword = `${word} ${format}`;
      if (!allKeywords.has(keyword)) {
        allKeywords.set(keyword, 85);
      }
    });
  });
  
  mainWords.forEach(word => {
    KEYWORD_CATEGORIES.productTypes.slice(0, 5).forEach(type => {
      const keyword = `${word} ${type}`;
      if (!allKeywords.has(keyword)) {
        allKeywords.set(keyword, 75);
      }
    });
  });
  
  mainWords.forEach(word => {
    KEYWORD_CATEGORIES.digitalProducts.slice(0, 4).forEach(product => {
      const keyword = `${word} ${product}`;
      if (!allKeywords.has(keyword) && !hasDuplicateFormats(keyword)) {
        allKeywords.set(keyword, 70);
      }
    });
  });
}

function addPhysicalProductVariations(allKeywords, context) {
  const mainWords = context.mainNouns.slice(0, 3);
  
  mainWords.forEach(word => {
    KEYWORD_CATEGORIES.qualities.slice(0, 6).forEach(quality => {
      const keyword = `${quality} ${word}`;
      if (!allKeywords.has(keyword)) {
        allKeywords.set(keyword, 80);
      }
    });
  });
  
  mainWords.forEach(noun => {
    context.mainAdjectives.slice(0, 4).forEach(adj => {
      const keyword = `${adj} ${noun}`;
      if (!allKeywords.has(keyword)) {
        allKeywords.set(keyword, 78);
      }
    });
  });
}

function addEventKeywords(allKeywords, context) {
  const mainWords = context.mainNouns.slice(0, 2);
  
  mainWords.forEach(word => {
    KEYWORD_CATEGORIES.holidays.slice(0, 8).forEach(holiday => {
      const keyword1 = `${word} ${holiday}`;
      const keyword2 = `${holiday} ${word}`;
      
      if (!allKeywords.has(keyword1)) allKeywords.set(keyword1, 65);
      if (!allKeywords.has(keyword2)) allKeywords.set(keyword2, 65);
    });
  });
  
  mainWords.forEach(word => {
    KEYWORD_CATEGORIES.seasons.forEach(season => {
      const keyword = `${season} ${word}`;
      if (!allKeywords.has(keyword)) {
        allKeywords.set(keyword, 60);
      }
    });
  });
  
  mainWords.forEach(word => {
    KEYWORD_CATEGORIES.occasions.slice(0, 6).forEach(occasion => {
      const keyword = `${word} ${occasion}`;
      if (!allKeywords.has(keyword)) {
        allKeywords.set(keyword, 58);
      }
    });
  });
}

async function addRelatedWords(allKeywords, mainNouns) {
  const wordnet = new natural.WordNet();
  
  for (const noun of mainNouns.slice(0, 2)) {
    try {
      const lookupResults = await new Promise((resolve) => {
        wordnet.lookup(noun, (results) => {
          resolve(results || []);
        });
      });
      
      const synonyms = new Set();
      lookupResults.forEach(result => {
        if (result.synonyms) {
          result.synonyms.forEach(syn => {
            const cleaned = syn.toLowerCase().replace(/_/g, ' ').trim();
            if (cleaned !== noun && cleaned.length > 2 && !cleaned.includes('(')) {
              synonyms.add(cleaned);
            }
          });
        }
      });
      
      Array.from(synonyms).slice(0, 3).forEach(syn => {
        const keyword = `${syn} ${mainNouns[0]}`;
        if (!allKeywords.has(keyword) && isValidKeyword(keyword)) {
          allKeywords.set(keyword, 55);
        }
      });
    } catch (error) {
      console.log(`WordNet lookup failed for: ${noun}`);
    }
  }
}

function addSmartCombinations(allKeywords, context) {
  const mainWords = context.mainNouns.slice(0, 2);
  
  if (context.isDigital && context.mentionedFormats.length > 0) {
    mainWords.forEach(noun => {
      context.mainAdjectives.slice(0, 2).forEach(adj => {
        context.mentionedFormats.slice(0, 2).forEach(format => {
          const keyword = `${adj} ${noun} ${format}`;
          if (!allKeywords.has(keyword) && !hasDuplicateFormats(keyword)) {
            allKeywords.set(keyword, 66);
          }
        });
      });
    });
    
    mainWords.forEach(noun => {
      KEYWORD_CATEGORIES.productTypes.slice(0, 2).forEach(type => {
        context.mentionedFormats.slice(0, 2).forEach(format => {
          const keyword = `${noun} ${type} ${format}`;
          if (!allKeywords.has(keyword) && !hasDuplicateFormats(keyword)) {
            allKeywords.set(keyword, 64);
          }
        });
      });
    });
  } else {
    mainWords.forEach(noun => {
      context.mainAdjectives.slice(0, 2).forEach(adj => {
        KEYWORD_CATEGORIES.qualities.slice(0, 2).forEach(quality => {
          const keyword = `${quality} ${adj} ${noun}`;
          if (!allKeywords.has(keyword)) {
            allKeywords.set(keyword, 64);
          }
        });
      });
    });
  }
}

function isValidKeyword(keyword) {
  const words = keyword.trim().split(/\s+/);
  
  if (words.length < 2) return false;
  if (keyword.length > 80) return false;
  if (hasDuplicateFormats(keyword)) return false;
  
  const nonFillerWords = words.filter(w => !FILLER_WORDS.has(w.toLowerCase()));
  if (nonFillerWords.length === 0) return false;
  
  const wordCounts = new Map();
  words.forEach(w => {
    wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
  });
  if (Array.from(wordCounts.values()).some(count => count >= 3)) return false;
  
  return true;
}

function hasDuplicateFormats(keyword) {
  const words = keyword.toLowerCase().split(/\s+/);
  const formats = words.filter(w => KEYWORD_CATEGORIES.fileFormats.includes(w));
  return formats.length > 1;
}