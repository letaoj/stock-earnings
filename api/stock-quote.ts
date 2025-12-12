import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Get Stock Quote
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
    const { symbol } = req.query;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }

    // Finnhub separates Quote (Price) and Profile (Name/Metadata)
    // We fetch both in parallel
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`;

    const [quoteRes, profileRes] = await Promise.all([
      fetch(quoteUrl),
      fetch(profileUrl)
    ]);

    if (!quoteRes.ok) {
      throw new Error(`Finnhub Quote API error: ${quoteRes.status}`);
    }

    const quoteData = await quoteRes.json();
    const profileData = await profileRes.json(); // Might be empty {} if not found/free tier limit

    // Finnhub Quote Structure:
    // c: Current price
    // d: Change
    // dp: Percent change
    // h: High
    // l: Low
    // o: Open
    // pc: Previous close

    // Map to match the structure expected by the frontend (originally FMP-like)
    // Returning an array because original FMP endpoint returns [ { ... } ]
    const mappedData = [{
      symbol: symbol.toUpperCase(),
      name: profileData.name || symbol.toUpperCase(),
      price: quoteData.c,
      changesPercentage: quoteData.dp,
      change: quoteData.d,
      dayLow: quoteData.l,
      dayHigh: quoteData.h,
      yearHigh: null, // Not in basic quote
      yearLow: null,  // Not in basic quote
      marketCap: profileData.marketCapitalization ? profileData.marketCapitalization * 1000000 : null,
      priceAvg50: null,
      priceAvg200: null,
      volume: null, // Volume not in basic quote (sometimes in 'v' but not consistent on free)
      avgVolume: null,
      exchange: profileData.exchange,
      open: quoteData.o,
      previousClose: quoteData.pc,
      eps: null,
      pe: null,
      earningsAnnouncement: null,
      sharesOutstanding: profileData.shareOutstanding ? profileData.shareOutstanding * 1000000 : null,
      timestampea: quoteData.t,
      // After hours not explicitly supported in free basic quote
      afterHoursPrice: null,
      afterHoursChange: null,
      afterHoursChangePercentage: null
    }];

    // Set cache headers (1 minute for stock quotes)
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(mappedData);
  } catch (error) {
    console.error('Stock quote error:', error);
    return res.status(500).json({
      error: 'Failed to fetch stock quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
