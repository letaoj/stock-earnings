import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Get Multiple Stock Quotes
 * Proxies batch requests to Financial Modeling Prep API securely
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests for batch operations
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Finnhub API key not configured' });
  }

  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array required' });
    }

    // Limit to 30 symbols per request to avoid rate limit issues (free tier 30-60 calls/min)
    if (symbols.length > 30) {
      return res.status(400).json({ error: 'Maximum 30 symbols per request' });
    }

    // Finnhub doesn't have a batch endpoint in the free tier
    // We must make parallel requests for each symbol
    const promises = symbols.map(async (symbol) => {
      try {
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
        const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`;

        const [quoteRes, profileRes] = await Promise.all([
          fetch(quoteUrl),
          fetch(profileUrl)
        ]);

        if (!quoteRes.ok) return null;

        const data = await quoteRes.json();
        const profile = await profileRes.json().catch(() => ({})); // Handle profile failure gracefully

        // Return structured object matching FMP format + industry
        return {
          symbol: symbol.toUpperCase(),
          name: profile.name || symbol.toUpperCase(),
          industry: profile.finnhubIndustry || 'Unknown',
          price: data.c,
          changesPercentage: data.dp,
          change: data.d,
          dayLow: data.l,
          dayHigh: data.h,
          yearHigh: null,
          yearLow: null,
          volume: null,
          avgVolume: null,
          open: data.o,
          previousClose: data.pc,
          eps: null,
          pe: null,
          earningsAnnouncement: null,
          sharesOutstanding: profile.shareOutstanding ? profile.shareOutstanding * 1000000 : null,
          timestamp: data.t,
        };
      } catch (err) {
        console.error(`Failed to fetch data for ${symbol}`, err);
        return null; // Ignore failed symbols
      }
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(item => item !== null);

    // Set cache headers (1 minute for batch quotes)
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(validResults);
  } catch (error) {
    console.error('Batch quotes error:', error);
    return res.status(500).json({
      error: 'Failed to fetch batch quotes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
