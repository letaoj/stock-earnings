import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlEarningsCalendar, crawlNasdaqEarnings } from '../services/crawler';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Vercel Serverless Function: Crawl Earnings Calendar
 * Scrapes earnings calendar from Yahoo Finance (with Nasdaq fallback)
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, source = 'yahoo' } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date parameter required (YYYY-MM-DD)' });
    }

    // Check cache
    const cacheKey = `earnings-${date}-${source}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
      return res.status(200).json(cached.data);
    }

    let entries;

    if (source === 'nasdaq') {
      entries = await crawlNasdaqEarnings(date);
    } else {
      // Default to Yahoo Finance
      try {
        entries = await crawlEarningsCalendar(date);
      } catch (yahooError) {
        console.warn('Yahoo Finance crawl failed, trying Nasdaq:', yahooError);
        // Fallback to Nasdaq
        entries = await crawlNasdaqEarnings(date);
      }
    }

    // Filter for US stocks (no dots in symbol)
    const usStocks = entries.filter(e => !e.symbol.includes('.'));

    // Transform to match FMP-like format for frontend compatibility
    const result = usStocks.map(entry => ({
      date: entry.date,
      symbol: entry.symbol,
      eps: entry.epsActual,
      epsEstimated: entry.epsEstimate,
      time: entry.time,
      revenue: undefined, // Yahoo doesn't provide revenue in calendar view
      revenueEstimated: undefined,
    }));

    // Update cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Source', source === 'nasdaq' ? 'nasdaq' : 'yahoo');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');

    return res.status(200).json(result);
  } catch (error) {
    console.error('Crawler earnings calendar error:', error);
    return res.status(500).json({
      error: 'Failed to crawl earnings calendar',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
