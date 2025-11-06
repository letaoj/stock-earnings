import { describe, it, expect, beforeEach, vi } from 'vitest';
import { stockService } from '../stockService';
import { MarketStatus } from '../../types/stock';

describe('StockService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMarketStatus', () => {
    it('should return a valid market status', () => {
      const status = stockService.getMarketStatus();
      const validStatuses: MarketStatus[] = ['pre-market', 'market-hours', 'after-hours', 'closed'];

      expect(validStatuses).toContain(status);
    });

    it('should return consistent status on multiple calls', () => {
      const status1 = stockService.getMarketStatus();
      const status2 = stockService.getMarketStatus();

      expect(status1).toBe(status2);
    });
  });

  describe('getPriceHistory', () => {
    it('should fetch price history for a given symbol', async () => {
      const symbol = 'AAPL';
      const days = 30;
      const result = await stockService.getPriceHistory(symbol, days);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return price data with correct structure', async () => {
      const result = await stockService.getPriceHistory('AAPL', 30);
      const priceData = result[0];

      expect(priceData).toHaveProperty('date');
      expect(priceData).toHaveProperty('open');
      expect(priceData).toHaveProperty('high');
      expect(priceData).toHaveProperty('low');
      expect(priceData).toHaveProperty('close');
      expect(priceData).toHaveProperty('volume');

      expect(typeof priceData.open).toBe('number');
      expect(typeof priceData.high).toBe('number');
      expect(typeof priceData.low).toBe('number');
      expect(typeof priceData.close).toBe('number');
      expect(typeof priceData.volume).toBe('number');
    });

    it('should respect the days parameter', async () => {
      const days = 7;
      const result = await stockService.getPriceHistory('AAPL', days);

      // Should have approximately the requested number of days
      // Allow some variance for weekends/holidays
      expect(result.length).toBeGreaterThanOrEqual(days - 2);
      expect(result.length).toBeLessThanOrEqual(days + 5);
    });

    it('should have high >= low for all price points', async () => {
      const result = await stockService.getPriceHistory('AAPL', 30);

      result.forEach((priceData) => {
        expect(priceData.high).toBeGreaterThanOrEqual(priceData.low);
      });
    });

    it('should have high >= open and high >= close', async () => {
      const result = await stockService.getPriceHistory('AAPL', 30);

      result.forEach((priceData) => {
        expect(priceData.high).toBeGreaterThanOrEqual(priceData.open);
        expect(priceData.high).toBeGreaterThanOrEqual(priceData.close);
      });
    });

    it('should have low <= open and low <= close', async () => {
      const result = await stockService.getPriceHistory('AAPL', 30);

      result.forEach((priceData) => {
        expect(priceData.low).toBeLessThanOrEqual(priceData.open);
        expect(priceData.low).toBeLessThanOrEqual(priceData.close);
      });
    });
  });

  describe('getCurrentPrice', () => {
    it('should fetch current price for a given symbol', async () => {
      const symbol = 'AAPL';
      const result = await stockService.getCurrentPrice(symbol);

      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('change');
      expect(result).toHaveProperty('changePercent');

      expect(typeof result.current).toBe('number');
      expect(typeof result.change).toBe('number');
      expect(typeof result.changePercent).toBe('number');
    });

    it('should return positive prices', async () => {
      const result = await stockService.getCurrentPrice('AAPL');

      expect(result.current).toBeGreaterThan(0);
    });

    it('should have consistent change and changePercent relationship', async () => {
      const result = await stockService.getCurrentPrice('AAPL');

      // Calculate expected change percent
      const expectedChangePercent = (result.change / (result.current - result.change)) * 100;

      // Allow small floating point differences
      expect(Math.abs(result.changePercent - expectedChangePercent)).toBeLessThan(0.1);
    });

    it('should include after-hours data when market is in after-hours', async () => {
      const result = await stockService.getCurrentPrice('AAPL');
      const marketStatus = stockService.getMarketStatus();

      if (marketStatus === 'after-hours') {
        expect(result.afterHours).toBeDefined();
        expect(result.afterHours).toHaveProperty('price');
        expect(result.afterHours).toHaveProperty('change');
        expect(result.afterHours).toHaveProperty('changePercent');
      }
    });
  });

  describe('isMarketOpen', () => {
    it('should return a boolean value', () => {
      const result = stockService.isMarketOpen();

      expect(typeof result).toBe('boolean');
    });

    it('should be consistent with getMarketStatus', () => {
      const isOpen = stockService.isMarketOpen();
      const status = stockService.getMarketStatus();

      if (isOpen) {
        expect(['market-hours', 'pre-market', 'after-hours']).toContain(status);
      } else {
        expect(status).toBe('closed');
      }
    });
  });
});
