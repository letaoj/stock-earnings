import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlStockHistory } from './services/crawler';

/**
 * Vercel Serverless Function: Get Stock Price History
 * Proxies requests to Financial Modeling Prep API securely
 * Falls back to web crawler if API fails or is not configured
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, days = '30', source = 'auto' } = req.query;

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Symbol parameter required' });
  }

  const daysNum = parseInt(typeof days === 'string' ? days : '30');

  // Force crawler mode
  if (source === 'crawler') {
    return fetchFromCrawler(symbol, daysNum, res);
  }

  const apiKey = process.env.FMP_API_KEY;

  // If no API key, use crawler
  if (!apiKey) {
    console.log('No FMP API key configured, using crawler');
    return fetchFromCrawler(symbol, daysNum, res);
  }

  try {
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
      // FMP returns 403 on limit
      if (response.status === 403) {
        console.log('FMP API rate limited, falling back to crawler');
        return fetchFromCrawler(symbol, daysNum, res);
      }
      throw new Error(`FMP API error: ${response.status}`);
    }

    const data = await response.json();

    // FMP returns { symbol: "AAPL", historical: [ { date, open, high, low, close, volume... } ] }
    const historical = data.historical || [];
    historical.reverse(); // Oldest First for charts

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.setHeader('X-Source', 'fmp');

    return res.status(200).json({ historical });
  } catch (error) {
    console.error('FMP stock history error, falling back to crawler:', error);

    // Fallback to crawler
    return fetchFromCrawler(symbol, daysNum, res);
  }
}

async function fetchFromCrawler(symbol: string, days: number, res: VercelResponse) {
  try {
    const prices = await crawlStockHistory(symbol, days);

    // Transform to FMP-like format
    const historical = prices.map(p => ({
      date: p.date,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
      adjClose: p.adjClose || p.close,
      volume: p.volume,
      unadjustedVolume: p.volume,
      change: 0,
      changePercent: 0,
      vwap: (p.high + p.low + p.close) / 3,
      label: p.date,
      changeOverTime: 0,
    }));

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.setHeader('X-Source', 'crawler');

    return res.status(200).json({ historical });
  } catch (crawlerError) {
    console.error('Crawler also failed:', crawlerError);
    return res.status(500).json({
      error: 'Failed to fetch stock history from all sources',
      message: crawlerError instanceof Error ? crawlerError.message : 'Unknown error'
    });
  }
}
