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
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    // Financial Modeling Prep API endpoint
    const url = `https://financialmodelingprep.com/api/v3/earnings-calendar?from=${date}&to=${date}&apikey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }

    const data = await response.json();

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Earnings calendar error:', error);
    return res.status(500).json({
      error: 'Failed to fetch earnings calendar',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
