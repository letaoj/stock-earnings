import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlStockQuote } from './services/crawler';

/**
 * Vercel Serverless Function: Get Stock Quote
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

  const { symbol, source = 'auto' } = req.query;

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Symbol parameter required' });
  }

  // Force crawler mode
  if (source === 'crawler') {
    return fetchFromCrawler(symbol, res);
  }

  const apiKey = process.env.FMP_API_KEY;

  // If no API key, use crawler
  if (!apiKey) {
    console.log('No FMP API key configured, using crawler');
    return fetchFromCrawler(symbol, res);
  }

  try {
    // FMP Quote API
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }

    const data = await response.json();

    // Set cache headers
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.setHeader('X-Source', 'fmp');

    return res.status(200).json(data);
  } catch (error) {
    console.error('FMP stock quote error, falling back to crawler:', error);

    // Fallback to crawler
    return fetchFromCrawler(symbol, res);
  }
}

async function fetchFromCrawler(symbol: string, res: VercelResponse) {
  try {
    const quote = await crawlStockQuote(symbol);

    // Transform to FMP-like format
    const result = [{
      symbol: quote.symbol,
      name: quote.name,
      price: quote.price,
      change: quote.change,
      changesPercentage: quote.changesPercentage,
      previousClose: quote.previousClose,
      open: quote.open,
      dayHigh: quote.dayHigh,
      dayLow: quote.dayLow,
      volume: quote.volume,
      marketCap: quote.marketCap,
    }];

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.setHeader('X-Source', 'crawler');

    return res.status(200).json(result);
  } catch (crawlerError) {
    console.error('Crawler also failed:', crawlerError);
    return res.status(500).json({
      error: 'Failed to fetch stock quote from all sources',
      message: crawlerError instanceof Error ? crawlerError.message : 'Unknown error'
    });
  }
}
