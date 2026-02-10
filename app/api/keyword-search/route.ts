import { NextResponse } from 'next/server';

const ETSY_CATEGORIES = [
  'jewelry', 'clothing', 'home decor', 'wedding', 'toys', 'art',
  'craft supplies', 'vintage', 'gifts', 'accessories', 'bags',
  'shoes', 'stickers', 'candles', 'pottery', 'furniture',
  'digital downloads', 'svg', 'printable', 'planner', 'invitation'
];

function estimateCompetition(keyword: string, datamuseScore: number): number {
  const words = keyword.toLowerCase().split(/\s+/);
  let competition = 50;
  if (words.length === 1) competition += 30;
  if (words.length === 2) competition += 15;
  if (words.length >= 3) competition -= 10;
  if (words.length >= 4) competition -= 20;
  const genericWords = ['gift', 'custom', 'personalized', 'handmade', 'vintage', 'unique', 'cute', 'funny'];
  if (words.some(w => genericWords.includes(w))) competition += 10;
  if (datamuseScore > 50000) competition += 15;
  else if (datamuseScore > 10000) competition += 5;
  else if (datamuseScore < 1000) competition -= 10;
  if (ETSY_CATEGORIES.some(cat => keyword.toLowerCase().includes(cat))) competition += 8;
  return Math.max(5, Math.min(98, competition));
}

function estimateSearchVolume(keyword: string, datamuseScore: number, position: number): number {
  let volume = datamuseScore > 0 ? Math.round(datamuseScore / 10) : 0;
  const positionMultiplier = Math.max(0.3, 1 - (position * 0.05));
  volume = Math.round(volume * positionMultiplier);
  const wordCount = keyword.split(/\s+/).length;
  if (wordCount >= 3) volume = Math.round(volume * 0.6);
  if (wordCount >= 4) volume = Math.round(volume * 0.4);
  return Math.max(10, Math.min(50000, volume));
}

function calculateOpportunity(searchVolume: number, competition: number): number {
  const normalizedVolume = Math.min(searchVolume / 500, 100);
  const competitionInverse = 100 - competition;
  return Math.round((normalizedVolume * 0.6) + (competitionInverse * 0.4));
}

function estimateListings(competition: number, searchVolume: number): number {
  return Math.round(Math.max(100, competition * 500 + searchVolume * 0.5));
}

function estimateTrend(keyword: string): 'rising' | 'stable' | 'seasonal' {
  const lower = keyword.toLowerCase();
  const trending = ['aesthetic', 'cottagecore', 'minimalist', 'boho', 'retro', 'y2k', 'coquette', 'dark academia', 'coastal', 'maximalist'];
  const seasonal = ['christmas', 'halloween', 'easter', 'valentine', 'thanksgiving', 'mothers day', 'fathers day', 'spring', 'summer', 'fall', 'winter', 'wedding', 'graduation', 'back to school'];
  if (trending.some(t => lower.includes(t))) return 'rising';
  if (seasonal.some(s => lower.includes(s))) return 'seasonal';
  return 'stable';
}

interface DatamuseWord {
  word: string;
  score?: number;
  tags?: string[];
}

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword || !keyword.trim()) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const searchTerm = keyword.trim().toLowerCase();
    const results: Array<{
      keyword: string;
      searchVolume: number;
      competition: number;
      listings: number;
      opportunity: number;
      trend: string;
      wordCount: number;
      source: string;
    }> = [];
    const seen = new Set<string>();

    // Fetch from Datamuse in parallel
    const [suggestionsRes, meaningRes, triggerRes, followRes, precedeRes] = await Promise.all([
      fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(searchTerm)}&max=15`),
      fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(searchTerm)}&max=20&md=f`),
      fetch(`https://api.datamuse.com/words?rel_trg=${encodeURIComponent(searchTerm)}&max=15&md=f`),
      fetch(`https://api.datamuse.com/words?lc=${encodeURIComponent(searchTerm)}&max=10&md=f`),
      fetch(`https://api.datamuse.com/words?rc=${encodeURIComponent(searchTerm)}&max=10&md=f`),
    ]);

    const suggestions: DatamuseWord[] = suggestionsRes.ok ? await suggestionsRes.json() : [];
    const meaningWords: DatamuseWord[] = meaningRes.ok ? await meaningRes.json() : [];
    const triggerWords: DatamuseWord[] = triggerRes.ok ? await triggerRes.json() : [];
    const followWords: DatamuseWord[] = followRes.ok ? await followRes.json() : [];
    const precedeWords: DatamuseWord[] = precedeRes.ok ? await precedeRes.json() : [];

    const addResult = (kw: string, score: number, position: number, source: string) => {
      if (seen.has(kw) || kw.split(/\s+/).length > 5) return;
      seen.add(kw);
      const searchVolume = estimateSearchVolume(kw, score, position);
      const competition = estimateCompetition(kw, score);
      results.push({
        keyword: kw,
        searchVolume,
        competition,
        listings: estimateListings(competition, searchVolume),
        opportunity: calculateOpportunity(searchVolume, competition),
        trend: estimateTrend(kw),
        wordCount: kw.split(/\s+/).length,
        source,
      });
    };

    suggestions.forEach((item, i) => addResult(item.word.toLowerCase(), item.score || 1000, i, 'suggestion'));

    meaningWords.forEach((item, i) => {
      const word = item.word.toLowerCase();
      const freqTag = item.tags?.find((t: string) => t.startsWith('f:'));
      const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
      const score = (item.score || 1000) + (freq * 100);
      addResult(`${searchTerm} ${word}`, score, i + 10, 'related');
      addResult(`${word} ${searchTerm}`, score, i + 12, 'related');
      if (word.includes(' ')) addResult(word, score, i + 15, 'related');
    });

    triggerWords.forEach((item, i) => {
      const freqTag = item.tags?.find((t: string) => t.startsWith('f:'));
      const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
      addResult(`${searchTerm} ${item.word.toLowerCase()}`, (item.score || 500) + freq * 100, i + 20, 'association');
    });

    followWords.forEach((item, i) => {
      const freqTag = item.tags?.find((t: string) => t.startsWith('f:'));
      const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
      addResult(`${searchTerm} ${item.word.toLowerCase()}`, (item.score || 300) + freq * 100, i + 25, 'long-tail');
    });

    precedeWords.forEach((item, i) => {
      const freqTag = item.tags?.find((t: string) => t.startsWith('f:'));
      const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
      addResult(`${item.word.toLowerCase()} ${searchTerm}`, (item.score || 300) + freq * 100, i + 25, 'long-tail');
    });

    results.sort((a, b) => b.opportunity - a.opportunity);

    return NextResponse.json({
      query: searchTerm,
      totalResults: results.length,
      keywords: results.slice(0, 60),
      dataSources: ['Datamuse API', 'Algorithmic estimation'],
    });
  } catch (error) {
    console.error('Keyword search error:', error);
    return NextResponse.json({ error: 'Failed to search keywords' }, { status: 500 });
  }
}
