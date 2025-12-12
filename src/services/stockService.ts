import { PriceData, StockPrice, MarketStatus } from '../types/stock';
import { getCurrentMarketStatus, generatePriceHistory } from './mockData';
import { apiClient } from './apiClient';

// Use mock data flag - configurable via environment variable
// In production with API key: false
// In development/testing without API: true
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false' || import.meta.env.MODE === 'test';

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

    try {
      const data = await apiClient.get<any>(`/stock-history?symbol=${symbol}&days=${days}`);

      // Finnhub (via our proxy) returns data in { historical: [...] } format
      const historical = data.historical || [];

      // Transform Finnhub API response to our Stock format
      return historical.map((item: any) => ({
        date: item.date,
        close: item.close,
        high: item.high,
        low: item.low,
        open: item.open,
        volume: item.volume,
      })).reverse(); // FMP returns newest first, we want oldest first
    } catch (error) {
      console.error(`Failed to fetch price history for ${symbol}:`, error);
      // Fallback to mock data on error
      return generatePriceHistory(100, days);
    }
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

    try {
      const data = await apiClient.get<any[]>(`/stock-quote?symbol=${symbol}`);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`No price data for ${symbol}`);
      }

      const quote = data[0];
      const marketStatus = this.getMarketStatus();

      return {
        current: quote.price,
        change: quote.change,
        changePercent: quote.changesPercentage,
        afterHours:
          (marketStatus === 'after-hours' && quote.afterHoursPrice)
            ? {
              price: quote.afterHoursPrice,
              change: quote.afterHoursChange || 0,
              changePercent: quote.afterHoursChangePercentage || 0,
            }
            : undefined,
      };
    } catch (error) {
      console.error(`Failed to fetch current price for ${symbol}:`, error);
      throw error;
    }
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
