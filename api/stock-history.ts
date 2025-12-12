import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Get Stock Price History
 * Proxies requests to Financial Modeling Prep API securely
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Finnhub API key not configured' });
  }

  try {
    const { symbol, days = '30' } = req.query;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }

    const daysNum = parseInt(typeof days === 'string' ? days : '30');
    // Finnhub uses Unix timestamps (in seconds)
    const toDate = Math.floor(Date.now() / 1000);
    const fromDate = toDate - (daysNum * 24 * 60 * 60);

    // Finnhub Stock Candles API
    // https://finnhub.io/docs/api/stock-candles
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${fromDate}&to=${toDate}&token=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Finnhub Candles API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.s === 'no_data') {
      return res.status(200).json({ historical: [] });
    }

    // Finnhub returns parallel arrays: c, h, l, o, t, v
    // We need to zip them into an array of objects
    const count = data.t ? data.t.length : 0;
    const historical = [];

    for (let i = 0; i < count; i++) {
      const dateStr = new Date(data.t[i] * 1000).toISOString().split('T')[0];
      historical.push({
        date: dateStr,
        close: data.c[i],
        high: data.h[i],
        low: data.l[i],
        open: data.o[i],
        volume: data.v[i]
      });
    }

    // FMP returns Newest First. Finnhub returns Oldest First.
    // We reverse here to match FMP behavior so the frontend service doesn't break.
    historical.reverse();

    // Set cache headers (5 minutes for historical data)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    // Return in the structure expected by stockService ( { historical: [...] } )
    return res.status(200).json({ historical });
  } catch (error) {
    console.error('Stock history error:', error);
    return res.status(500).json({
      error: 'Failed to fetch stock history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
