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

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'FMP API key not configured' });
  }

  try {
    const { symbol, days = '30' } = req.query;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }

    const daysNum = parseInt(typeof days === 'string' ? days : '30');
    // For FMP, we can use "timeseries" (limited) or "historical-price-full" (date range)
    // FMP Free Tier has limited historical data. "30 days" is usually fine via 'historical-price-full'.
    // Date range format: YYYY-MM-DD
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - daysNum);

    const toStr = toDate.toISOString().split('T')[0];
    const fromStr = fromDate.toISOString().split('T')[0];

    // FMP Historical Price API
    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${fromStr}&to=${toStr}&apikey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      // FMP returns 200 with empty body or error message in body usually, but 403 on limit
      if (response.status === 403) {
        return res.status(403).json({ error: 'Access Denied' });
      }
      throw new Error(`FMP API error: ${response.status}`);
    }

    const data = await response.json();

    // FMP returns { symbol: "AAPL", historical: [ { date, open, high, low, close, volume... } ] }
    // The 'historical' array is sorted Newest First by default.
    // FMP returns Newest First. Frontend originally expected Oldest First.
    // We reverse here to ensure charts render correctly left-to-right.

    const historical = data.historical || [];
    historical.reverse(); // Now Oldest First

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
