import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Get Earnings Calendar
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
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    // FMP Earnings Calendar API
    const url = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${date}&to=${date}&apikey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }

    const data = await response.json(); // FMP returns Array<EarningEntry>

    // Filter for US Stocks
    // FMP symbols for US stocks are just "AAPL". International has suffixes like "AAPL.MX".
    // We filter out any symbol containing a dot for simplicity and US-purity.
    const usStocks = Array.isArray(data) ? data.filter((item: any) => {
      const symbol = item.symbol;
      return symbol && !symbol.includes('.'); // Strict main US market filter
    }) : [];

    // FMP returns: { date, symbol, eps, epsEstimated, time, revenue, revenueEstimated ... }
    // We might need to map this in the frontend or here.
    // Let's standardise the response structure slightly to match what our frontend expects (originally FMP-like).
    // Actually, frontend was adapting Finnhub to FMP. So raw FMP is best.

    // For compatibility with previous response structure, we return the raw array.
    // The frontend service has been updated to handle Array response.

    // Set cache headers
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json(usStocks);
  } catch (error) {
    console.error('Earnings calendar error:', error);
    return res.status(500).json({
      error: 'Failed to fetch earnings calendar',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
