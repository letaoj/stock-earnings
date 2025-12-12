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

      // Finnhub returns { earningsCalendar: [...] }
      const calendarData = response.earningsCalendar;

      // Guard clause for invalid data
      if (!Array.isArray(calendarData)) {
        console.warn('Expected earningsCalendar array from API but got:', response);
        return [];
      }

      // Transform Finnhub API response to our EarningsCalendarEntry format
      return calendarData.map((item: any) => ({
        symbol: item.symbol,
        companyName: item.symbol, // Finnhub calendar doesn't provide name
        timing: this.parseEarningsTime(item.hour),
        date: item.date || dateStr,
        scheduledTime: item.hour,
        epsEstimate: item.epsEstimate,
        epsActual: item.epsActual,
        revenueEstimate: item.revenueEstimate,
        revenueActual: item.revenueActual,
      }));
    } catch (error) {
      console.error('Failed to fetch earnings calendar:', error);
      throw error;
    }
  }

  /**
   * Parse earnings time from FMP API response
   */
  private parseEarningsTime(time: string): 'BMO' | 'AMC' | 'DMH' {
    if (!time) return 'DMH';
    const timeLower = time.toLowerCase();
    if (timeLower.includes('bmo') || timeLower.includes('before')) return 'BMO';
    if (timeLower.includes('amc') || timeLower.includes('after')) return 'AMC';
    return 'DMH';
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
          current: quote.price,
          change: quote.change,
          changePercent: quote.changesPercentage,
          afterHours: quote.afterHoursPrice ? {
            price: quote.afterHoursPrice,
            change: quote.afterHoursChange || 0,
            changePercent: quote.afterHoursChangePercentage || 0,
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
          current: quote.price,
          change: quote.change,
          changePercent: quote.changesPercentage,
          afterHours: quote.afterHoursPrice ? {
            price: quote.afterHoursPrice,
            change: quote.afterHoursChange || 0,
            changePercent: quote.afterHoursChangePercentage || 0,
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
   * Fetch today's earnings with full stock data
   */
  async getTodayEarnings(): Promise<Stock[]> {
    const calendar = await this.getEarningsCalendar(new Date());
    const symbols = calendar.map(entry => entry.symbol);
    return this.getMultipleStocksWithEarnings(symbols);
  }
}

export const earningsService = new EarningsService();
