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
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { symbol, days = '30' } = req.query;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }

    const daysNum = parseInt(typeof days === 'string' ? days : '30');
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysNum);
    const toDate = new Date();

    // Financial Modeling Prep API endpoint
    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${fromDate.toISOString().split('T')[0]}&to=${toDate.toISOString().split('T')[0]}&apikey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }

    const data = await response.json();

    // Set cache headers (5 minutes for historical data)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Stock history error:', error);
    return res.status(500).json({
      error: 'Failed to fetch stock history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
