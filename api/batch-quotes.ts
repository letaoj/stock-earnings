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

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'FMP API key not configured' });
  }

  try {
    const { symbols } = req.body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array required' });
    }

    // FMP supports batch requests via comma-separated symbols
    const symbolString = symbols.join(',');
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbolString}?apikey=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache for 1 minute
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Batch quotes error:', error);
    return res.status(500).json({
      error: 'Failed to fetch batch quotes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
