import { EarningsCalendarEntry, Stock } from '../types/stock';
import { mockEarningsCalendar, generateMockStock } from './mockData';

// Use mock data flag - set to false when real API is available
const USE_MOCK_DATA = true;

export class EarningsService {
  /**
   * Fetch earnings calendar for a specific date
   */
  async getEarningsCalendar(_date: Date): Promise<EarningsCalendarEntry[]> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockEarningsCalendar;
    }

    // TODO: Replace with real API call
    // Example: const response = await apiClient.get<EarningsCalendarEntry[]>(`/earnings/calendar?date=${dateStr}`);
    throw new Error('Real API not implemented yet');
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

    // TODO: Replace with real API call
    // Example: const response = await apiClient.get<Stock>(`/stocks/${symbol}/earnings`);
    throw new Error('Real API not implemented yet');
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

    // TODO: Replace with real API call
    // Example: const response = await apiClient.post<Stock[]>('/stocks/batch', { symbols });
    throw new Error('Real API not implemented yet');
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
