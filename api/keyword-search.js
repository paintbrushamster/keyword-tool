// ============================================
// KEYWORD SEARCH API - Free Data Sources
// Uses Datamuse API for related words & frequency data
// ============================================

const ETSY_CATEGORIES = [
  'jewelry', 'clothing', 'home decor', 'wedding', 'toys', 'art',
  'craft supplies', 'vintage', 'gifts', 'accessories', 'bags',
  'shoes', 'stickers', 'candles', 'pottery', 'furniture',
  'digital downloads', 'svg', 'printable', 'planner', 'invitation'
];

// Estimate competition based on keyword characteristics
function estimateCompetition(keyword, datamuseScore) {
  const words = keyword.toLowerCase().split(/\s+/);
  let competition = 50; // baseline

  // Shorter keywords = more competition
  if (words.length === 1) competition += 30;
  if (words.length === 2) competition += 15;
  if (words.length >= 3) competition -= 10;
  if (words.length >= 4) competition -= 20;

  // Very common/generic words increase competition
  const genericWords = ['gift', 'custom', 'personalized', 'handmade', 'vintage', 'unique', 'cute', 'funny'];
  const hasGeneric = words.some(w => genericWords.includes(w));
  if (hasGeneric) competition += 10;

  // Higher datamuse score = more common = more competition
  if (datamuseScore > 50000) competition += 15;
  else if (datamuseScore > 10000) competition += 5;
  else if (datamuseScore < 1000) competition -= 10;

  // Etsy-specific category words boost competition
  const hasCategory = ETSY_CATEGORIES.some(cat =>
    keyword.toLowerCase().includes(cat)
  );
  if (hasCategory) competition += 8;

  return Math.max(5, Math.min(98, competition));
}

// Estimate search volume from datamuse frequency + position
function estimateSearchVolume(keyword, datamuseScore, position) {
  let volume = 0;

  // Base from datamuse score (frequency in English language)
  if (datamuseScore > 0) {
    volume = Math.round(datamuseScore / 10);
  }

  // Position in suggestions affects estimate (higher position = more searched)
  const positionMultiplier = Math.max(0.3, 1 - (position * 0.05));
  volume = Math.round(volume * positionMultiplier);

  // Multi-word keywords have lower raw volume but more targeted
  const wordCount = keyword.split(/\s+/).length;
  if (wordCount >= 3) volume = Math.round(volume * 0.6);
  if (wordCount >= 4) volume = Math.round(volume * 0.4);

  // Minimum floor
  return Math.max(10, Math.min(50000, volume));
}

// Calculate opportunity score (high search + low competition = high opportunity)
function calculateOpportunity(searchVolume, competition) {
  const normalizedVolume = Math.min(searchVolume / 500, 100);
  const competitionInverse = 100 - competition;
  return Math.round((normalizedVolume * 0.6) + (competitionInverse * 0.4));
}

// Estimate Etsy listing count
function estimateListings(competition, searchVolume) {
  const base = competition * 500;
  const volumeBoost = searchVolume * 0.5;
  return Math.round(Math.max(100, base + volumeBoost));
}

// Calculate trend indicator
function estimateTrend(keyword) {
  const seasonal = ['christmas', 'halloween', 'easter', 'valentine', 'thanksgiving',
    'mothers day', 'fathers day', 'spring', 'summer', 'fall', 'winter',
    'wedding', 'graduation', 'back to school'];

  const trending = ['aesthetic', 'cottagecore', 'minimalist', 'boho', 'retro',
    'y2k', 'coquette', 'dark academia', 'coastal', 'maximalist'];

  const lower = keyword.toLowerCase();

  if (trending.some(t => lower.includes(t))) return 'rising';
  if (seasonal.some(s => lower.includes(s))) return 'seasonal';
  return 'stable';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { keyword } = req.body;

  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    const searchTerm = keyword.trim().toLowerCase();
    const results = [];
    const seen = new Set();

    // 1. Fetch suggestions (autocomplete-like)
    const suggestionsRes = await fetch(
      `https://api.datamuse.com/sug?s=${encodeURIComponent(searchTerm)}&max=15`
    );
    const suggestions = suggestionsRes.ok ? await suggestionsRes.json() : [];

    // 2. Fetch words with similar meaning
    const meaningRes = await fetch(
      `https://api.datamuse.com/words?ml=${encodeURIComponent(searchTerm)}&max=20&md=f`
    );
    const meaningWords = meaningRes.ok ? await meaningRes.json() : [];

    // 3. Fetch triggered associations
    const triggerRes = await fetch(
      `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(searchTerm)}&max=15&md=f`
    );
    const triggerWords = triggerRes.ok ? await triggerRes.json() : [];

    // 4. Fetch words that often follow this word
    const followRes = await fetch(
      `https://api.datamuse.com/words?lc=${encodeURIComponent(searchTerm)}&max=10&md=f`
    );
    const followWords = followRes.ok ? await followRes.json() : [];

    // 5. Fetch words that often precede this word
    const precedeRes = await fetch(
      `https://api.datamuse.com/words?rc=${encodeURIComponent(searchTerm)}&max=10&md=f`
    );
    const precedeWords = precedeRes.ok ? await precedeRes.json() : [];

    // Process suggestions
    suggestions.forEach((item, index) => {
      const kw = item.word.toLowerCase();
      if (!seen.has(kw)) {
        seen.add(kw);
        const score = item.score || 1000;
        const searchVolume = estimateSearchVolume(kw, score, index);
        const competition = estimateCompetition(kw, score);
        results.push({
          keyword: kw,
          searchVolume,
          competition,
          listings: estimateListings(competition, searchVolume),
          opportunity: calculateOpportunity(searchVolume, competition),
          trend: estimateTrend(kw),
          wordCount: kw.split(/\s+/).length,
          source: 'suggestion'
        });
      }
    });

    // Process meaning-related words (combine with search term)
    meaningWords.forEach((item, index) => {
      const word = item.word.toLowerCase();
      // Create compound keywords
      const compounds = [
        `${searchTerm} ${word}`,
        `${word} ${searchTerm}`
      ];

      compounds.forEach(kw => {
        if (!seen.has(kw) && kw.split(/\s+/).length <= 5) {
          seen.add(kw);
          const freqTag = item.tags?.find(t => t.startsWith('f:'));
          const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
          const score = (item.score || 1000) + (freq * 100);
          const searchVolume = estimateSearchVolume(kw, score, index + 10);
          const competition = estimateCompetition(kw, score);
          results.push({
            keyword: kw,
            searchVolume,
            competition,
            listings: estimateListings(competition, searchVolume),
            opportunity: calculateOpportunity(searchVolume, competition),
            trend: estimateTrend(kw),
            wordCount: kw.split(/\s+/).length,
            source: 'related'
          });
        }
      });

      // Also add standalone if it's a multi-word phrase
      if (word.includes(' ') && !seen.has(word)) {
        seen.add(word);
        const freqTag = item.tags?.find(t => t.startsWith('f:'));
        const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
        const score = (item.score || 500) + (freq * 100);
        const searchVolume = estimateSearchVolume(word, score, index + 15);
        const competition = estimateCompetition(word, score);
        results.push({
          keyword: word,
          searchVolume,
          competition,
          listings: estimateListings(competition, searchVolume),
          opportunity: calculateOpportunity(searchVolume, competition),
          trend: estimateTrend(word),
          wordCount: word.split(/\s+/).length,
          source: 'related'
        });
      }
    });

    // Process trigger words
    triggerWords.forEach((item, index) => {
      const word = item.word.toLowerCase();
      const kw = `${searchTerm} ${word}`;
      if (!seen.has(kw) && kw.split(/\s+/).length <= 5) {
        seen.add(kw);
        const freqTag = item.tags?.find(t => t.startsWith('f:'));
        const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
        const score = (item.score || 500) + (freq * 100);
        const searchVolume = estimateSearchVolume(kw, score, index + 20);
        const competition = estimateCompetition(kw, score);
        results.push({
          keyword: kw,
          searchVolume,
          competition,
          listings: estimateListings(competition, searchVolume),
          opportunity: calculateOpportunity(searchVolume, competition),
          trend: estimateTrend(kw),
          wordCount: kw.split(/\s+/).length,
          source: 'association'
        });
      }
    });

    // Process follow/precede words for long-tail keywords
    followWords.forEach((item, index) => {
      const word = item.word.toLowerCase();
      const kw = `${searchTerm} ${word}`;
      if (!seen.has(kw) && kw.split(/\s+/).length <= 5) {
        seen.add(kw);
        const freqTag = item.tags?.find(t => t.startsWith('f:'));
        const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
        const score = (item.score || 300) + (freq * 100);
        const searchVolume = estimateSearchVolume(kw, score, index + 25);
        const competition = estimateCompetition(kw, score);
        results.push({
          keyword: kw,
          searchVolume,
          competition,
          listings: estimateListings(competition, searchVolume),
          opportunity: calculateOpportunity(searchVolume, competition),
          trend: estimateTrend(kw),
          wordCount: kw.split(/\s+/).length,
          source: 'long-tail'
        });
      }
    });

    precedeWords.forEach((item, index) => {
      const word = item.word.toLowerCase();
      const kw = `${word} ${searchTerm}`;
      if (!seen.has(kw) && kw.split(/\s+/).length <= 5) {
        seen.add(kw);
        const freqTag = item.tags?.find(t => t.startsWith('f:'));
        const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
        const score = (item.score || 300) + (freq * 100);
        const searchVolume = estimateSearchVolume(kw, score, index + 25);
        const competition = estimateCompetition(kw, score);
        results.push({
          keyword: kw,
          searchVolume,
          competition,
          listings: estimateListings(competition, searchVolume),
          opportunity: calculateOpportunity(searchVolume, competition),
          trend: estimateTrend(kw),
          wordCount: kw.split(/\s+/).length,
          source: 'long-tail'
        });
      }
    });

    // Sort by opportunity score (best opportunities first)
    results.sort((a, b) => b.opportunity - a.opportunity);

    return res.status(200).json({
      query: searchTerm,
      totalResults: results.length,
      keywords: results.slice(0, 60),
      dataSources: ['Datamuse API (related words, frequency)', 'Algorithmic estimation']
    });
  } catch (error) {
    console.error('Keyword search error:', error);
    return res.status(500).json({
      error: 'Failed to search keywords',
      details: error.message
    });
  }
}
