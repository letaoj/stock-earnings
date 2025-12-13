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

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Finnhub API key not configured' });
  }

  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    // Finnhub Earnings Calendar API
    // https://finnhub.io/docs/api/earnings-calendar
    const url = `https://finnhub.io/api/v1/calendar/earnings?from=${date}&to=${date}&token=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter for US Stocks
    // US Stocks typically have no suffix or .A/.B/etc for classes.
    // International stocks have .DE, .L, .TO, etc.
    if (data.earningsCalendar && Array.isArray(data.earningsCalendar)) {
      data.earningsCalendar = data.earningsCalendar.filter((item: any) => {
        const symbol = item.symbol;
        if (!symbol) return false;
        // Keep if no dot, OR if dot exists, the suffix is 1-2 chars (Class A/B) 
        // and NOT a known country code like TO (Toronto), L (London), etc. 
        // Easier rule for "Main" US market: No dot, or dot followed by single letter (BRK.A, BRK.B).
        // Exceptions exist, but this clears out most international garbage (XXX.DE, XXX.SA).
        const parts = symbol.split('.');
        if (parts.length === 1) return true; // No dot -> AAPL
        if (parts.length === 2 && parts[1].length <= 2 && !['TO', 'CN', 'DE', 'PA', 'L', 'HE'].includes(parts[1])) {
          // Short suffix that isn't a common exchange code. 
          // Finnhub raw data inspection would be ideal, but heuristic: 
          // Most international are .XX. 
          // Class shares are .A, .B.
          return true;
        }
        return false;
      });
    }

    // Set cache headers for better performance (1 hour)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Earnings calendar error:', error);
    return res.status(500).json({
      error: 'Failed to fetch earnings calendar',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
