import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlBatchQuotes } from './services/crawler';

/**
 * Vercel Serverless Function: Get Multiple Stock Quotes
 * Proxies batch requests to Financial Modeling Prep API securely
 * Falls back to web crawler if API fails or is not configured
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests for batch operations
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbols, source = 'auto' } = req.body;

  if (!Array.isArray(symbols) || symbols.length === 0) {
    return res.status(400).json({ error: 'Symbols array required' });
  }

  // Force crawler mode
  if (source === 'crawler') {
    return fetchFromCrawler(symbols, res);
  }

  const apiKey = process.env.FMP_API_KEY;

  // If no API key, use crawler
  if (!apiKey) {
    console.log('No FMP API key configured, using crawler');
    return fetchFromCrawler(symbols, res);
  }

  try {
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
    res.setHeader('X-Source', 'fmp');

    return res.status(200).json(data);
  } catch (error) {
    console.error('FMP batch quotes error, falling back to crawler:', error);

    // Fallback to crawler
    return fetchFromCrawler(symbols, res);
  }
}

async function fetchFromCrawler(symbols: string[], res: VercelResponse) {
  try {
    const quotes = await crawlBatchQuotes(symbols);

    // Transform to FMP-like format
    const result = quotes.map(quote => ({
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
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.setHeader('X-Source', 'crawler');

    return res.status(200).json(result);
  } catch (crawlerError) {
    console.error('Crawler also failed:', crawlerError);
    return res.status(500).json({
      error: 'Failed to fetch batch quotes from all sources',
      message: crawlerError instanceof Error ? crawlerError.message : 'Unknown error'
    });
  }
}
