import yahooFinance from 'yahoo-finance2';

export interface MarketData {
  goldPriceUSD: number;
  goldChange: number;
  stocks: Record<string, { price: number; change: number; history: number[] }>;
  localizedGold: Record<string, number>;
}

// Map Country Code to the corresponding currency for USD->CUR conversion
const CURRENCY_MAP: Record<string, string> = {
  GB: 'GBP',
  DE: 'EUR',
  JP: 'JPY',
  AU: 'AUD',
  IN: 'INR',
  BR: 'BRL',
  NG: 'NGN',
  TR: 'TRY',
  RU: 'RUB',
  CN: 'CNY',
  TW: 'TWD',
  PK: 'PKR',
  UA: 'UAH', // Ukrainian Hryvnia
  SY: 'SYP', // Syrian Pound
  SD: 'SDG', // Sudanese Pound
  YE: 'YER', // Yemeni Rial
  MM: 'MMK', // Myanmar Kyat
  IR: 'IRR', // Iranian Rial
};

export async function fetchLiveMarketData(): Promise<MarketData> {
  try {
    const baseSymbols = ['GC=F', '^GSPC', '^DJI', '^IXIC'];
    
    // Create the FX symbols dynamically
    const fxSymbols = Object.values(CURRENCY_MAP).map(cur => `USD${cur}=X`);
    const allSymbols = [...baseSymbols, ...fxSymbols];

    const quotes: any[] = await Promise.all(allSymbols.map(async (s) => {
      try {
        return await yahooFinance.quote(s);
      } catch {
        return null;
      }
    }));
    const historicals: any[] = await Promise.all(baseSymbols.map(async (s) => {
      try {
        // @ts-ignore
        return await yahooFinance.historical(s, { period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) });
      } catch {
        return [];
      }
    }));

    const goldQuote = quotes[0];
    const sp500 = quotes[1];
    const dow = quotes[2];
    const nasdaq = quotes[3];

    const goldPriceUSD = goldQuote?.regularMarketPrice || 2850;
    const goldChange = goldQuote?.regularMarketChangePercent || 0;

    // Calculate localized gold based on the FX quotes fetched
    const localizedGold: Record<string, number> = {};
    
    Object.entries(CURRENCY_MAP).forEach(([countryCode, cur], index) => {
      // Offset by the length of baseSymbols (4)
      const fxQuote = quotes[4 + index];
      const rate = fxQuote?.regularMarketPrice || 1; // Fallback to 1 (USD) if failed
      localizedGold[countryCode] = Math.round(goldPriceUSD * rate * 100) / 100;
    });

    // Default for US and others not mapped is just the USD price
    localizedGold['US'] = goldPriceUSD;

    return {
      goldPriceUSD,
      goldChange,
      localizedGold,
      stocks: {
        'S&P 500': {
          price: sp500?.regularMarketPrice || 0,
          change: sp500?.regularMarketChangePercent || 0,
          history: historicals[1]?.slice(-12).map((h: any) => h.close) || []
        },
        'DOW JONES': {
          price: dow?.regularMarketPrice || 0,
          change: dow?.regularMarketChangePercent || 0,
          history: historicals[2]?.slice(-12).map((h: any) => h.close) || []
        },
        'NASDAQ': {
           price: nasdaq?.regularMarketPrice || 0,
           change: nasdaq?.regularMarketChangePercent || 0,
           history: historicals[3]?.slice(-12).map((h: any) => h.close) || []
        }
      }
    };
  } catch (error) {
    console.error('Error fetching market data from Yahoo Finance:', error);
    // Fallback data
    return {
      goldPriceUSD: 2865.40,
      goldChange: 1.2,
      localizedGold: { 'US': 2865.40 },
      stocks: {
        'S&P 500': { price: 5123.45, change: 0.5, history: [5000, 5050, 5100, 5123] }
      }
    };
  }
}
