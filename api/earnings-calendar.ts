import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlEarningsCalendar, crawlNasdaqEarnings } from './services/crawler';

/**
 * Vercel Serverless Function: Get Earnings Calendar
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

  const { date, source = 'auto' } = req.query;

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date parameter required' });
  }

  // Force crawler mode
  if (source === 'crawler') {
    return fetchFromCrawler(date, res);
  }

  const apiKey = process.env.FMP_API_KEY;

  // If no API key, use crawler
  if (!apiKey) {
    console.log('No FMP API key configured, using crawler');
    return fetchFromCrawler(date, res);
  }

  try {
    // FMP Earnings Calendar API
    const url = `https://financialmodelingprep.com/api/v3/earning_calendar?from=${date}&to=${date}&apikey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter for US Stocks
    const usStocks = Array.isArray(data) ? data.filter((item: any) => {
      const symbol = item.symbol;
      return symbol && !symbol.includes('.');
    }) : [];

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.setHeader('X-Source', 'fmp');

    return res.status(200).json(usStocks);
  } catch (error) {
    console.error('FMP earnings calendar error, falling back to crawler:', error);

    // Fallback to crawler
    return fetchFromCrawler(date, res);
  }
}

async function fetchFromCrawler(date: string, res: VercelResponse) {
  try {
    let entries;

    try {
      entries = await crawlEarningsCalendar(date);
    } catch (yahooError) {
      console.warn('Yahoo Finance crawl failed, trying Nasdaq:', yahooError);
      entries = await crawlNasdaqEarnings(date);
    }

    // Filter for US stocks
    const usStocks = entries.filter(e => !e.symbol.includes('.'));

    // Transform to FMP-like format
    const result = usStocks.map(entry => ({
      date: entry.date,
      symbol: entry.symbol,
      eps: entry.epsActual,
      epsEstimated: entry.epsEstimate,
      time: entry.time,
      revenue: undefined,
      revenueEstimated: undefined,
    }));

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    res.setHeader('X-Source', 'crawler');

    return res.status(200).json(result);
  } catch (crawlerError) {
    console.error('Crawler also failed:', crawlerError);
    return res.status(500).json({
      error: 'Failed to fetch earnings calendar from all sources',
      message: crawlerError instanceof Error ? crawlerError.message : 'Unknown error'
    });
  }
}
