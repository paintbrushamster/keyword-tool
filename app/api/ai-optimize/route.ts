import { NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

interface DatamuseWord {
  word: string;
  score?: number;
  tags?: string[];
}

async function fetchKeywordData(keyword: string) {
  const searchTerm = keyword.trim().toLowerCase();

  const [suggestionsRes, meaningRes, triggerRes] = await Promise.all([
    fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(searchTerm)}&max=20`),
    fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(searchTerm)}&max=30&md=f`),
    fetch(`https://api.datamuse.com/words?rel_trg=${encodeURIComponent(searchTerm)}&max=20&md=f`),
  ]);

  const suggestions: DatamuseWord[] = suggestionsRes.ok ? await suggestionsRes.json() : [];
  const meaningWords: DatamuseWord[] = meaningRes.ok ? await meaningRes.json() : [];
  const triggerWords: DatamuseWord[] = triggerRes.ok ? await triggerRes.json() : [];

  const relatedWords = new Set<string>();
  suggestions.forEach(item => relatedWords.add(item.word.toLowerCase()));
  meaningWords.forEach(item => {
    relatedWords.add(item.word.toLowerCase());
    relatedWords.add(`${searchTerm} ${item.word.toLowerCase()}`);
  });
  triggerWords.forEach(item => relatedWords.add(`${searchTerm} ${item.word.toLowerCase()}`));

  const keywordPool = meaningWords.map(item => {
    const freqTag = item.tags?.find((t: string) => t.startsWith('f:'));
    const freq = freqTag ? parseFloat(freqTag.split(':')[1]) : 0;
    return { word: item.word.toLowerCase(), score: item.score || 0, frequency: freq };
  });

  return {
    searchTerm,
    suggestions: suggestions.map(s => s.word),
    relatedWords: Array.from(relatedWords).slice(0, 50),
    keywordPool,
    totalDataPoints: suggestions.length + meaningWords.length + triggerWords.length,
  };
}

export async function POST(request: Request) {
  try {
    const { keyword, description, category } = await request.json();

    if (!keyword?.trim()) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        error: 'ANTHROPIC_API_KEY not configured',
        message: 'Add your Anthropic API key to environment variables to use AI optimization.',
      }, { status: 400 });
    }

    const keywordData = await fetchKeywordData(keyword);

    const systemPrompt = `You are an expert Etsy SEO specialist and keyword researcher. You understand Etsy's search algorithm (which prioritizes exact match, recency, listing quality, and relevance). You know what makes keywords convert on Etsy.

Your job is to analyze keyword data and select the 13 BEST keywords for an Etsy listing, then generate an optimized title and description.

CRITICAL RULES:
- Each keyword must have real search demand (don't recommend keywords nobody searches for)
- Prioritize: high search volume + low competition = best opportunity
- Long-tail keywords (2-4 words) perform better on Etsy than single words
- Keywords must be relevant to the product
- The 13 keywords should cover different search intents (browsing, specific, gift, occasion, style)
- Rank them 1-13 in order of importance (1 = most impactful)

FOR THE TITLE:
- Etsy titles can be up to 140 characters
- Front-load the most important keywords
- Make it readable (not just keyword stuffing)
- Use commas or pipes to separate keyword phrases
- Include the main keyword near the beginning

FOR THE DESCRIPTION:
- First 40 characters show in search results - make them count
- Write in a warm, human tone - like talking to a friend
- Keep it concise but entertaining - good copywriting matters
- Naturally weave in keywords without being spammy
- Include a hook, benefits, and a gentle call to action
- 2-3 short paragraphs max
- Must feel authentic, not AI-generated

You MUST respond in valid JSON format with this exact structure:
{
  "keywords": [
    {
      "rank": 1,
      "keyword": "the keyword phrase",
      "searchVolume": "High|Medium|Low",
      "competition": "High|Medium|Low",
      "opportunity": 85,
      "reason": "Brief reason why this keyword was selected"
    }
  ],
  "title": "The optimized Etsy title",
  "description": "The SEO-friendly description",
  "strategy": "Brief 1-2 sentence explanation of the overall keyword strategy"
}`;

    const userPrompt = `Analyze this Etsy product and find the 13 best keywords:

PRODUCT: ${keyword}
${description ? `DESCRIPTION: ${description}` : ''}
${category ? `CATEGORY: ${category}` : ''}

KEYWORD DATA FROM RESEARCH:
- Autocomplete suggestions: ${keywordData.suggestions.slice(0, 15).join(', ')}
- Related words and phrases: ${keywordData.relatedWords.slice(0, 30).join(', ')}
- Total data points analyzed: ${keywordData.totalDataPoints}

${keywordData.keywordPool.length > 0 ? `
FREQUENCY DATA (word: relevance_score, language_frequency):
${keywordData.keywordPool.slice(0, 20).map(k =>
  `- ${k.word}: score=${k.score}, freq=${k.frequency.toFixed(2)}`
).join('\n')}
` : ''}

Based on this data, select the 13 best keywords that balance high search volume with lower competition. Every keyword must have enough search demand to be worth targeting — don't include any keyword that barely anyone searches for. Think about what an Etsy buyer would actually type into the search bar.

Respond with ONLY valid JSON, no other text.`;

    const aiResponse = await callClaude(systemPrompt, userPrompt);

    let parsed;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI returned invalid format');
    }

    if (!parsed.keywords || !Array.isArray(parsed.keywords) || parsed.keywords.length === 0) {
      throw new Error('AI response missing keywords array');
    }

    return NextResponse.json({
      success: true,
      keywords: parsed.keywords.slice(0, 13),
      title: parsed.title || '',
      description: parsed.description || '',
      strategy: parsed.strategy || '',
      dataSourced: {
        suggestionsUsed: keywordData.suggestions.length,
        relatedWordsUsed: keywordData.relatedWords.length,
        totalDataPoints: keywordData.totalDataPoints,
      },
    });
  } catch (error) {
    console.error('AI optimize error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to optimize keywords', details: message }, { status: 500 });
  }
}
