import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlStockQuote } from '../services/crawler';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute for quotes

/**
 * Vercel Serverless Function: Crawl Stock Quote
 * Scrapes current stock quote from Yahoo Finance
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol } = req.query;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }

    const upperSymbol = symbol.toUpperCase();

    // Check cache
    const cacheKey = `quote-${upperSymbol}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      return res.status(200).json(cached.data);
    }

    const quote = await crawlStockQuote(upperSymbol);

    // Transform to FMP-like format for frontend compatibility
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

    // Update cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Source', 'yahoo');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(result);
  } catch (error) {
    console.error('Crawler stock quote error:', error);
    return res.status(500).json({
      error: 'Failed to crawl stock quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
