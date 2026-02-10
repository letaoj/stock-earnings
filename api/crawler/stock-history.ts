import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlStockHistory } from '../services/crawler';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for historical data

/**
 * Vercel Serverless Function: Crawl Stock History
 * Scrapes historical stock prices from Yahoo Finance
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbol, days = '30' } = req.query;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol parameter required' });
    }

    const upperSymbol = symbol.toUpperCase();
    const numDays = Math.min(Math.max(parseInt(days as string, 10) || 30, 1), 365);

    // Check cache
    const cacheKey = `history-${upperSymbol}-${numDays}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
      return res.status(200).json(cached.data);
    }

    const prices = await crawlStockHistory(upperSymbol, numDays);

    // Transform to match FMP format
    const result = {
      symbol: upperSymbol,
      historical: prices.map(p => ({
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
      })),
    };

    // Update cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Source', 'yahoo');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');

    return res.status(200).json(result);
  } catch (error) {
    console.error('Crawler stock history error:', error);
    return res.status(500).json({
      error: 'Failed to crawl stock history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
