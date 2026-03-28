import { GoogleGenAI } from '@google/genai';
import { fetchLiveNews, NewsItem } from './news';
import { fetchLiveMarketData, MarketData } from './market';
import dotenv from 'dotenv';
dotenv.config();

// Attempt to initialize the AI client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (e) {
    console.warn('Failed to initialize Google GenAI with provided API key. Using fallback engine.');
  }
}

export interface AIPrediction {
  analysis: string;
  confidence: number;
  model: string;
}

export async function generateCountryPrediction(countryCode: string): Promise<AIPrediction> {
  const news = await fetchLiveNews();
  const market = await fetchLiveMarketData();

  if (!ai || !process.env.GEMINI_API_KEY) {
    return generateHeuristicFallback(countryCode, news, market);
  }

  try {
    const contextualNews = news.map(n => n.title).join('; ');
    const localGold = market.localizedGold[countryCode] || market.goldPriceUSD;

    const systemPrompt = `We are analyzing geopolitical risk and market volatility for country: ${countryCode}.
You are the GEO-SENTINEL-v3 an advanced AI tactical risk analyzer.
Keep your response strictly to one or two short sentences maximum (under 150 characters if possible).
Sound highly technical, factual, and tactical (like an intel report).
Mention the current news constraints and market data organically.
The localized gold price for this region is roughly ${localGold}.`;

    const userPrompt = `Recent global news headlines: ${contextualNews}. 
Analyze the current risk for ${countryCode} considering these events and the gold price volatility (${market.goldChange}%). Provide a short tactical summary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        maxOutputTokens: 60,
        temperature: 0.3,
      }
    });

    const analysisText = response.text || 'Unable to generate tactical prediction at this time.';

    return {
      analysis: analysisText,
      confidence: Math.round((85 + Math.random() * 12) * 10) / 10,
      model: 'GEO-SENTINEL-v3 (Gemini 2.5)',
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return generateHeuristicFallback(countryCode, news, market);
  }
}

// Fallback logic when no API key is present
function generateHeuristicFallback(countryCode: string, news: NewsItem[], market: MarketData): AIPrediction {
  const isMarketDown = market.goldChange < 0;
  
  const scenarios = [
    `Market stability vector is nominal. Localized gold indicator correlates with global safe-haven inflows.`,
    `Heightened volatility detected in supply chains. Global news sentiment suggests elevated systemic risk in ${countryCode}.`,
    `Economic indicators show resilience despite global macroeconomic headwinds. Threat matrix remains baseline.`,
    `Regional transit anomalies correlate with minor market fluctuations. Surveillance ongoing.`,
    `Geopolitical tension indicators are flat, but commodity index suggests underlying inflationary pressure in ${countryCode}.`
  ];
  
  const chosenScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const trendString = isMarketDown ? 'Depressed asset flows noted.' : 'Elevated tangible asset demand noted.';

  return {
    analysis: `${chosenScenario} ${trendString}`,
    confidence: Math.round((70 + Math.random() * 20) * 10) / 10,
    model: 'GEO-SENTINEL Heuristic Engine',
  };
}
