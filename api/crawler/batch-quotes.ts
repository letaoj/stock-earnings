import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlBatchQuotes } from '../services/crawler';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute for quotes

/**
 * Vercel Serverless Function: Crawl Batch Stock Quotes
 * Scrapes multiple stock quotes from Yahoo Finance
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array required' });
    }

    if (symbols.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 symbols per request' });
    }

    const upperSymbols = symbols.map((s: string) => s.toUpperCase());

    // Check cache for each symbol
    const cachedQuotes: any[] = [];
    const uncachedSymbols: string[] = [];

    for (const symbol of upperSymbols) {
      const cacheKey = `quote-${symbol}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        cachedQuotes.push(cached.data);
      } else {
        uncachedSymbols.push(symbol);
      }
    }

    let crawledQuotes: any[] = [];
    if (uncachedSymbols.length > 0) {
      const quotes = await crawlBatchQuotes(uncachedSymbols);

      // Transform and cache each quote
      crawledQuotes = quotes.map(quote => {
        const result = {
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
        };

        // Update cache
        cache.set(`quote-${quote.symbol}`, { data: result, timestamp: Date.now() });

        return result;
      });
    }

    // Combine cached and crawled quotes
    const allQuotes = [...cachedQuotes, ...crawledQuotes];

    // Sort by original order
    const orderedQuotes = upperSymbols
      .map(symbol => allQuotes.find(q => q.symbol === symbol))
      .filter(Boolean);

    res.setHeader('X-Cache', uncachedSymbols.length === 0 ? 'HIT' : 'PARTIAL');
    res.setHeader('X-Source', 'yahoo');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(orderedQuotes);
  } catch (error) {
    console.error('Crawler batch quotes error:', error);
    return res.status(500).json({
      error: 'Failed to crawl batch quotes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
