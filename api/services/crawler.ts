import * as cheerio from 'cheerio';

/**
 * Web Crawler Service
 * Scrapes financial data from public sources like Yahoo Finance
 */

// User agent to mimic browser requests
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Common headers for requests
const getHeaders = () => ({
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
});

// Retry fetch with exponential backoff
async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers: getHeaders() });
      if (response.ok) return response;
      if (response.status === 429) {
        // Rate limited, wait longer
        await new Promise(r => setTimeout(r, delay * (i + 1) * 2));
        continue;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

// ============== Types ==============

export interface CrawledEarningsEntry {
  symbol: string;
  companyName: string;
  date: string;
  time: 'bmo' | 'amc' | 'tbd'; // Before market open, after market close, to be determined
  epsEstimate?: number;
  epsActual?: number;
  epsSurprise?: number;
}

export interface CrawledStockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  previousClose?: number;
  open?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  marketCap?: number;
}

export interface CrawledHistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

// ============== Earnings Calendar Crawler ==============

/**
 * Crawl Yahoo Finance earnings calendar for a specific date
 */
export async function crawlEarningsCalendar(date: string): Promise<CrawledEarningsEntry[]> {
  // Yahoo Finance earnings calendar URL
  // Format: https://finance.yahoo.com/calendar/earnings?day=2024-01-15
  const url = `https://finance.yahoo.com/calendar/earnings?day=${date}`;

  try {
    const response = await fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const entries: CrawledEarningsEntry[] = [];

    // Yahoo Finance uses a table structure for earnings calendar
    // The table has columns: Symbol, Company, Earnings Call Time, EPS Estimate, EPS Actual, Surprise(%)
    $('table tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 4) {
        const symbol = $(cells[0]).text().trim();
        const companyName = $(cells[1]).text().trim();
        const callTimeText = $(cells[2]).text().trim().toLowerCase();
        const epsEstimateText = $(cells[3]).text().trim();
        const epsActualText = cells.length > 4 ? $(cells[4]).text().trim() : '';
        const surpriseText = cells.length > 5 ? $(cells[5]).text().trim() : '';

        // Parse time (BMO = Before Market Open, AMC = After Market Close)
        let time: 'bmo' | 'amc' | 'tbd' = 'tbd';
        if (callTimeText.includes('before') || callTimeText.includes('bmo')) {
          time = 'bmo';
        } else if (callTimeText.includes('after') || callTimeText.includes('amc')) {
          time = 'amc';
        }

        // Parse numbers
        const epsEstimate = parseFloat(epsEstimateText.replace(/[^0-9.-]/g, ''));
        const epsActual = parseFloat(epsActualText.replace(/[^0-9.-]/g, ''));
        const epsSurprise = parseFloat(surpriseText.replace(/[^0-9.-]/g, ''));

        if (symbol && symbol.length > 0 && symbol.length <= 5) {
          entries.push({
            symbol,
            companyName,
            date,
            time,
            epsEstimate: isNaN(epsEstimate) ? undefined : epsEstimate,
            epsActual: isNaN(epsActual) ? undefined : epsActual,
            epsSurprise: isNaN(epsSurprise) ? undefined : epsSurprise,
          });
        }
      }
    });

    return entries;
  } catch (error) {
    console.error('Failed to crawl earnings calendar:', error);
    throw error;
  }
}

// ============== Stock Quote Crawler ==============

/**
 * Crawl Yahoo Finance for current stock quote
 */
export async function crawlStockQuote(symbol: string): Promise<CrawledStockQuote> {
  const url = `https://finance.yahoo.com/quote/${symbol.toUpperCase()}`;

  try {
    const response = await fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse company name from title or header
    const title = $('h1').first().text().trim();
    const name = title.split('(')[0].trim() || symbol;

    // Parse from HTML elements
    // Yahoo uses data-field attributes or specific class names
    let price = 0;
    let change = 0;
    let changePercent = 0;

    // Try to find the price from various possible selectors
    const priceText = $('[data-field="regularMarketPrice"]').first().text().trim() ||
                      $('fin-streamer[data-field="regularMarketPrice"]').first().attr('value') ||
                      $('[data-testid="qsp-price"]').first().text().trim();

    const changeText = $('[data-field="regularMarketChange"]').first().text().trim() ||
                       $('fin-streamer[data-field="regularMarketChange"]').first().attr('value');

    const changePercentText = $('[data-field="regularMarketChangePercent"]').first().text().trim() ||
                              $('fin-streamer[data-field="regularMarketChangePercent"]').first().attr('value');

    price = parseFloat(priceText?.replace(/[^0-9.-]/g, '') || '0');
    change = parseFloat(changeText?.replace(/[^0-9.-]/g, '') || '0');
    changePercent = parseFloat(changePercentText?.replace(/[^0-9.%-]/g, '').replace('%', '') || '0');

    // Parse additional data from the summary table
    let previousClose: number | undefined;
    let open: number | undefined;
    let dayHigh: number | undefined;
    let dayLow: number | undefined;
    let volume: number | undefined;
    let marketCap: number | undefined;

    // Yahoo Finance summary table
    $('table tbody tr').each((_, row) => {
      const label = $(row).find('td').first().text().toLowerCase();
      const value = $(row).find('td').last().text().trim();

      if (label.includes('previous close')) {
        previousClose = parseFloat(value.replace(/[^0-9.-]/g, ''));
      } else if (label.includes('open')) {
        open = parseFloat(value.replace(/[^0-9.-]/g, ''));
      } else if (label.includes('day') && label.includes('range')) {
        const parts = value.split('-').map(p => parseFloat(p.trim().replace(/[^0-9.-]/g, '')));
        if (parts.length === 2) {
          dayLow = parts[0];
          dayHigh = parts[1];
        }
      } else if (label.includes('volume')) {
        volume = parseVolume(value);
      } else if (label.includes('market cap')) {
        marketCap = parseMarketCap(value);
      }
    });

    return {
      symbol: symbol.toUpperCase(),
      name,
      price,
      change,
      changesPercentage: changePercent,
      previousClose,
      open,
      dayHigh,
      dayLow,
      volume,
      marketCap,
    };
  } catch (error) {
    console.error(`Failed to crawl stock quote for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Crawl multiple stock quotes in batch
 */
export async function crawlBatchQuotes(symbols: string[]): Promise<CrawledStockQuote[]> {
  // Process in parallel with concurrency limit
  const CONCURRENCY = 3;
  const results: CrawledStockQuote[] = [];

  for (let i = 0; i < symbols.length; i += CONCURRENCY) {
    const batch = symbols.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(symbol => crawlStockQuote(symbol))
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }

    // Small delay between batches to avoid rate limiting
    if (i + CONCURRENCY < symbols.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return results;
}

// ============== Historical Prices Crawler ==============

/**
 * Crawl Yahoo Finance for historical stock prices
 */
export async function crawlStockHistory(symbol: string, days: number = 30): Promise<CrawledHistoricalPrice[]> {
  // Yahoo Finance historical data URL
  // We need to use period1 and period2 (Unix timestamps)
  const endDate = Math.floor(Date.now() / 1000);
  const startDate = endDate - (days * 24 * 60 * 60);

  const url = `https://finance.yahoo.com/quote/${symbol.toUpperCase()}/history?period1=${startDate}&period2=${endDate}&interval=1d`;

  try {
    const response = await fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const prices: CrawledHistoricalPrice[] = [];

    // Yahoo Finance historical data table
    // Columns: Date, Open, High, Low, Close, Adj Close, Volume
    $('table tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 6) {
        const dateText = $(cells[0]).text().trim();
        const openText = $(cells[1]).text().trim();
        const highText = $(cells[2]).text().trim();
        const lowText = $(cells[3]).text().trim();
        const closeText = $(cells[4]).text().trim();
        const adjCloseText = $(cells[5]).text().trim();
        const volumeText = cells.length > 6 ? $(cells[6]).text().trim() : '0';

        // Skip dividend/split rows
        if (closeText.toLowerCase().includes('dividend') ||
            closeText.toLowerCase().includes('split')) {
          return;
        }

        // Parse date (format: "Jan 15, 2024")
        const date = parseYahooDate(dateText);
        if (!date) return;

        const open = parseFloat(openText.replace(/[^0-9.-]/g, ''));
        const high = parseFloat(highText.replace(/[^0-9.-]/g, ''));
        const low = parseFloat(lowText.replace(/[^0-9.-]/g, ''));
        const close = parseFloat(closeText.replace(/[^0-9.-]/g, ''));
        const adjClose = parseFloat(adjCloseText.replace(/[^0-9.-]/g, ''));
        const volume = parseVolume(volumeText);

        if (!isNaN(open) && !isNaN(close)) {
          prices.push({
            date,
            open,
            high,
            low,
            close,
            volume: volume || 0,
            adjClose: isNaN(adjClose) ? undefined : adjClose,
          });
        }
      }
    });

    // Sort by date ascending (oldest first)
    prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return prices;
  } catch (error) {
    console.error(`Failed to crawl stock history for ${symbol}:`, error);
    throw error;
  }
}

// ============== Alternative: Nasdaq Earnings Calendar ==============

/**
 * Crawl Nasdaq earnings calendar as alternative source
 */
export async function crawlNasdaqEarnings(date: string): Promise<CrawledEarningsEntry[]> {
  // Nasdaq earnings calendar URL
  const url = `https://www.nasdaq.com/market-activity/earnings?date=${date}`;

  try {
    const response = await fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const entries: CrawledEarningsEntry[] = [];

    // Nasdaq uses a different structure
    $('.earnings-calendar__row, [data-type="earnings-row"]').each((_, row) => {
      const symbol = $(row).find('.earnings-calendar__symbol, [data-column="symbol"]').text().trim();
      const companyName = $(row).find('.earnings-calendar__company, [data-column="company"]').text().trim();
      const timeText = $(row).find('.earnings-calendar__time, [data-column="time"]').text().trim().toLowerCase();
      const epsEstText = $(row).find('.earnings-calendar__eps-estimate, [data-column="eps-estimate"]').text().trim();

      let time: 'bmo' | 'amc' | 'tbd' = 'tbd';
      if (timeText.includes('before') || timeText.includes('pre')) {
        time = 'bmo';
      } else if (timeText.includes('after') || timeText.includes('post')) {
        time = 'amc';
      }

      const epsEstimate = parseFloat(epsEstText.replace(/[^0-9.-]/g, ''));

      if (symbol) {
        entries.push({
          symbol,
          companyName,
          date,
          time,
          epsEstimate: isNaN(epsEstimate) ? undefined : epsEstimate,
        });
      }
    });

    return entries;
  } catch (error) {
    console.error('Failed to crawl Nasdaq earnings:', error);
    throw error;
  }
}

// ============== Helper Functions ==============

function parseYahooDate(dateStr: string): string | null {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function parseVolume(volumeStr: string): number {
  const cleaned = volumeStr.replace(/,/g, '').trim();
  const multipliers: Record<string, number> = {
    'K': 1000,
    'M': 1000000,
    'B': 1000000000,
    'T': 1000000000000,
  };

  for (const [suffix, multiplier] of Object.entries(multipliers)) {
    if (cleaned.toUpperCase().endsWith(suffix)) {
      return parseFloat(cleaned.slice(0, -1)) * multiplier;
    }
  }

  return parseFloat(cleaned) || 0;
}

function parseMarketCap(capStr: string): number {
  return parseVolume(capStr);
}
