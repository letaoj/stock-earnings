import { EarningsCalendarEntry, Stock } from '../types/stock';
import { mockEarningsCalendar, generateMockStock } from './mockData';
import { apiClient } from './apiClient';

// Use mock data flag - configurable via environment variable
// In production with API key: false
// In development/testing without API: true
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false' || import.meta.env.MODE === 'test';

export class EarningsService {
  /**
   * Fetch earnings calendar for a specific date
   */
  async getEarningsCalendar(date: Date): Promise<EarningsCalendarEntry[]> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockEarningsCalendar;
    }

    try {
      const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const response = await apiClient.get<any>(`/earnings-calendar?date=${dateStr}`);

      // FMP (via our proxy) returns direct array of earnings
      const calendarData = Array.isArray(response) ? response : [];

      // Transform FMP API response to our EarningsCalendarEntry format
      return calendarData.map((item: any) => ({
        symbol: item.symbol,
        companyName: item.symbol, // FMP calendar doesn't provide name in this endpoint
        timing: item.time === 'bmo' ? 'BMO' : item.time === 'amc' ? 'AMC' : 'DMH',
        date: item.date,
        scheduledTime: undefined, // FMP doesn't provide exact time in this endpoint
        epsEstimate: item.epsEstimated,
        epsActual: item.eps,
        revenueEstimate: item.revenueEstimated,
        revenueActual: item.revenue,
      }));
    } catch (error) {
      console.error('Failed to fetch earnings calendar:', error);
      throw error;
    }
  }

  /**
   * Fetch detailed stock information including earnings data
   */
  async getStockWithEarnings(symbol: string): Promise<Stock> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const earningsEntry = mockEarningsCalendar.find(e => e.symbol === symbol);
      if (!earningsEntry) {
        throw new Error(`Stock not found: ${symbol}`);
      }

      return generateMockStock(symbol, earningsEntry);
    }

    try {
      // Get stock quote from our API proxy
      const quoteData = await apiClient.get<any[]>(`/stock-quote?symbol=${symbol}`);

      if (!quoteData || quoteData.length === 0) {
        throw new Error(`Stock not found: ${symbol}`);
      }

      const quote = quoteData[0];

      // Transform FMP API response to our Stock format
      const stock: Stock = {
        symbol: quote.symbol,
        companyName: quote.name,
        price: {
          current: Number(quote.price) || 0,
          change: Number(quote.change) || 0,
          changePercent: Number(quote.changesPercentage) || 0,
          afterHours: quote.afterHoursPrice ? {
            price: Number(quote.afterHoursPrice) || 0,
            change: Number(quote.afterHoursChange) || 0,
            changePercent: Number(quote.afterHoursChangePercentage) || 0,
          } : undefined,
        },
        marketStatus: 'market-hours', // Would need to calculate based on current time
        earnings: {
          status: 'pending',
          timing: 'DMH', // Would need separate earnings data endpoint
        },
        priceHistory: [], // Will be fetched separately if needed
        lastUpdated: new Date().toISOString(),
      };

      return stock;
    } catch (error) {
      console.error(`Failed to fetch stock ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Fetch multiple stocks with earnings data
   */
  async getMultipleStocksWithEarnings(symbols: string[]): Promise<Stock[]> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const stocks = symbols.map(symbol => {
        const earningsEntry = mockEarningsCalendar.find(e => e.symbol === symbol);
        if (!earningsEntry) {
          throw new Error(`Stock not found: ${symbol}`);
        }
        return generateMockStock(symbol, earningsEntry);
      });

      return stocks;
    }

    try {
      // Use batch endpoint for better performance
      const quoteData = await apiClient.post<any[]>('/batch-quotes', { symbols });

      if (!Array.isArray(quoteData)) {
        console.warn('Expected array from batch quotes API but got:', quoteData);
        return [];
      }

      // Transform FMP API response to our Stock format
      const stocks: Stock[] = quoteData.map(quote => ({
        symbol: quote.symbol,
        companyName: quote.name,
        price: {
          current: Number(quote.price) || 0,
          change: Number(quote.change) || 0,
          changePercent: Number(quote.changesPercentage) || 0,
          afterHours: quote.afterHoursPrice ? {
            price: Number(quote.afterHoursPrice) || 0,
            change: Number(quote.afterHoursChange) || 0,
            changePercent: Number(quote.afterHoursChangePercentage) || 0,
          } : undefined,
        },
        marketStatus: 'market-hours',
        earnings: {
          status: 'pending',
          timing: 'DMH',
        },
        priceHistory: [],
        lastUpdated: new Date().toISOString(),
      }));

      return stocks;
    } catch (error) {
      console.error('Failed to fetch multiple stocks:', error);
      throw error;
    }
  }

  /**
   * Fetch earnings with full stock data for a specific date
   */
  async getEarningsForDate(date: Date = new Date()): Promise<Stock[]> {
    const calendar = await this.getEarningsCalendar(date);
    const symbols = calendar.map(entry => entry.symbol);

    // Chunk symbols to avoid hitting backend limits (30) or rate limits
    // Finnhub Free Tier is sensitive, so we use small chunks
    const CHUNK_SIZE = 5;
    const chunks = [];
    for (let i = 0; i < symbols.length; i += CHUNK_SIZE) {
      chunks.push(symbols.slice(i, i + CHUNK_SIZE));
    }

    const allStocks: Stock[] = [];

    // Process chunks sequentially to be gentle on rate limits
    for (const chunk of chunks) {
      try {
        const stocks = await this.getMultipleStocksWithEarnings(chunk);

        // Merge earnings data from calendar (estimate, timing) into the stock objects
        const enrichedStocks = stocks.map(stock => {
          const calendarEntry = calendar.find(c => c.symbol === stock.symbol);
          if (calendarEntry) {
            return {
              ...stock,
              earnings: {
                ...stock.earnings,
                timing: calendarEntry.timing,
                scheduledTime: calendarEntry.scheduledTime,
                estimate: calendarEntry.epsEstimate ? {
                  eps: calendarEntry.epsEstimate,
                  revenue: calendarEntry.revenueEstimate
                } : undefined,
                actual: calendarEntry.epsActual ? {
                  eps: calendarEntry.epsActual,
                  revenue: calendarEntry.revenueActual
                } : undefined
              }
            };
          }
          return stock;
        });

        allStocks.push(...enrichedStocks);

        // Small delay between chunks
        if (chunks.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (err) {
        console.warn('Failed to fetch chunk:', chunk, err);
        // Continue with other chunks
      }
    }

    return allStocks;
  }

  /**
   * Fetch AI-generated earnings analysis for a stock
   */
  async getEarningsAnalysis(symbol: string): Promise<any> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        summary: `Mock AI Analysis for ${symbol}: Strong revenue growth driven by cloud segment. Margins expanded due to cost cutting efficiency. Guidance raised for full year.`,
        sentiment: 'positive',
        keyTakeaways: [
          'Revenue beat estimates by 5%',
          'Cloud growth accelerated to 25% YoY',
          'Operating margin improved 200bps'
        ],
        reportUrl: 'https://example.com/mock-report',
        quarter: 'Q4 2024'
      };
    }

    try {
      const result = await apiClient.post<any>('/analyze-earnings', { symbol });
      return result;
    } catch (error) {
      console.error(`Failed to analyze earnings for ${symbol}:`, error);
      throw error;
    }
  }
}

export const earningsService = new EarningsService();
