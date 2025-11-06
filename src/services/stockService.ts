import { PriceData, StockPrice, MarketStatus } from '../types/stock';
import { getCurrentMarketStatus, generatePriceHistory } from './mockData';

// Use mock data flag - set to false when real API is available
const USE_MOCK_DATA = true;

export class StockService {
  /**
   * Get current market status
   */
  getMarketStatus(): MarketStatus {
    return getCurrentMarketStatus();
  }

  /**
   * Fetch historical price data for a stock
   */
  async getPriceHistory(
    symbol: string,
    days: number = 30
  ): Promise<PriceData[]> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return generatePriceHistory(100, days);
    }

    // TODO: Replace with real API call
    // Example: const response = await apiClient.get<PriceData[]>(`/stocks/${symbol}/history?days=${days}`);
    throw new Error('Real API not implemented yet');
  }

  /**
   * Fetch current price for a stock
   */
  async getCurrentPrice(symbol: string): Promise<StockPrice> {
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const basePrice = 100 + Math.random() * 400;
      const change = (Math.random() - 0.5) * 10;
      const changePercent = (change / basePrice) * 100;
      const marketStatus = this.getMarketStatus();

      return {
        current: basePrice + change,
        change,
        changePercent,
        afterHours:
          marketStatus === 'after-hours'
            ? {
                price: basePrice + change + (Math.random() - 0.5) * 5,
                change: (Math.random() - 0.5) * 5,
                changePercent: (((Math.random() - 0.5) * 5) / basePrice) * 100,
              }
            : undefined,
      };
    }

    // TODO: Replace with real API call
    // Example: const response = await apiClient.get<StockPrice>(`/stocks/${symbol}/price`);
    throw new Error('Real API not implemented yet');
  }

  /**
   * Determine if market is currently open
   */
  isMarketOpen(): boolean {
    const status = this.getMarketStatus();
    return status === 'market-hours' || status === 'pre-market' || status === 'after-hours';
  }
}

export const stockService = new StockService();
