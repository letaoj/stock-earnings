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
    // Note: This consumes rate limit quickly (1 call per symbol)
    const promises = symbols.map(async (symbol) => {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) return null;

        const data = await response.json();

        // Return structured object matching FMP format
        return {
          symbol: symbol.toUpperCase(),
          name: symbol.toUpperCase(), // Profile call skipped to save quota; name fallback to symbol
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
          sharesOutstanding: null,
          timestamp: data.t,
        };
      } catch (err) {
        console.error(`Failed to fetch quote for ${symbol}`, err);
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
