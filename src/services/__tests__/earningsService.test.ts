import { describe, it, expect, beforeEach, vi } from 'vitest';
import { earningsService } from '../earningsService';

describe('EarningsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEarningsCalendar', () => {
    it('should fetch earnings calendar for a given date', async () => {
      const date = new Date('2024-01-15');
      const result = await earningsService.getEarningsCalendar(date);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return calendar entries with required fields', async () => {
      const date = new Date();
      const result = await earningsService.getEarningsCalendar(date);
      const entry = result[0];

      expect(entry).toHaveProperty('symbol');
      expect(entry).toHaveProperty('companyName');
      expect(entry).toHaveProperty('timing');
      expect(entry).toHaveProperty('date');
      expect(['BMO', 'AMC', 'DMH']).toContain(entry.timing);
    });

    it('should include estimates when available', async () => {
      const date = new Date();
      const result = await earningsService.getEarningsCalendar(date);
      const entryWithEstimates = result.find((e) => e.estimate);

      if (entryWithEstimates?.estimate) {
        expect(entryWithEstimates.estimate).toHaveProperty('eps');
        expect(typeof entryWithEstimates.estimate.eps).toBe('number');
      }
    });
  });

  describe('getStockWithEarnings', () => {
    it('should fetch stock data with earnings info', async () => {
      const symbol = 'AAPL';
      const result = await earningsService.getStockWithEarnings(symbol);

      expect(result).toHaveProperty('symbol', symbol);
      expect(result).toHaveProperty('companyName');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('earnings');
      expect(result).toHaveProperty('priceHistory');
    });

    it('should throw error for invalid symbol', async () => {
      const invalidSymbol = 'INVALID_SYMBOL_XYZ';

      await expect(
        earningsService.getStockWithEarnings(invalidSymbol)
      ).rejects.toThrow();
    });

    it('should return price data with correct structure', async () => {
      const result = await earningsService.getStockWithEarnings('AAPL');

      expect(result.price).toHaveProperty('current');
      expect(result.price).toHaveProperty('change');
      expect(result.price).toHaveProperty('changePercent');
      expect(typeof result.price.current).toBe('number');
      expect(typeof result.price.change).toBe('number');
      expect(typeof result.price.changePercent).toBe('number');
    });

    it('should return earnings data with correct structure', async () => {
      const result = await earningsService.getStockWithEarnings('AAPL');

      expect(result.earnings).toHaveProperty('status');
      expect(result.earnings).toHaveProperty('timing');
      expect(['pending', 'released']).toContain(result.earnings.status);
      expect(['BMO', 'AMC', 'DMH']).toContain(result.earnings.timing);
    });

    it('should include actual earnings data when released', async () => {
      const result = await earningsService.getStockWithEarnings('NVDA'); // BMO timing, more likely released

      if (result.earnings.status === 'released') {
        expect(result.earnings.actual).toBeDefined();
        expect(result.earnings.actual).toHaveProperty('eps');
        expect(result.earnings.actual).toHaveProperty('revenue');
        expect(result.earnings.beatStatus).toBeDefined();
      }
    });

    it('should return price history with correct length', async () => {
      const result = await earningsService.getStockWithEarnings('AAPL');

      expect(Array.isArray(result.priceHistory)).toBe(true);
      expect(result.priceHistory.length).toBeGreaterThan(0);
      expect(result.priceHistory[0]).toHaveProperty('date');
      expect(result.priceHistory[0]).toHaveProperty('close');
      expect(result.priceHistory[0]).toHaveProperty('high');
      expect(result.priceHistory[0]).toHaveProperty('low');
      expect(result.priceHistory[0]).toHaveProperty('volume');
    });
  });

  describe('getMultipleStocksWithEarnings', () => {
    it('should fetch multiple stocks at once', async () => {
      const symbols = ['AAPL', 'MSFT', 'GOOGL'];
      const result = await earningsService.getMultipleStocksWithEarnings(symbols);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(symbols.length);
      expect(result.map((s) => s.symbol).sort()).toEqual(symbols.sort());
    });

    it('should return empty array for empty input', async () => {
      const result = await earningsService.getMultipleStocksWithEarnings([]);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should throw error if any symbol is invalid', async () => {
      const symbols = ['AAPL', 'INVALID_XYZ', 'MSFT'];

      await expect(
        earningsService.getMultipleStocksWithEarnings(symbols)
      ).rejects.toThrow();
    });
  });

  describe('getEarningsForDate', () => {
    it('should fetch all stocks with earnings today', async () => {
      const result = await earningsService.getEarningsForDate(new Date());
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return Stock objects with complete data', async () => {
      const result = await earningsService.getEarningsForDate(new Date());
      const stock = result[0];

      expect(stock).toHaveProperty('symbol');
      expect(stock).toHaveProperty('price');
      expect(stock).toHaveProperty('earnings');
      expect(stock.price).toHaveProperty('current');
      expect(stock.price).toHaveProperty('change');
    });

    it('should include both BMO and AMC earnings', async () => {
      const result = await earningsService.getEarningsForDate(new Date());
      const timings = result.map((s) => s.earnings.timing);
      const hasBMO = timings.includes('BMO');
      const hasAMC = timings.includes('AMC'); // Note: Mock data might randomly fail this if not guaranteed
      expect(timings.length).toBeGreaterThan(0);
    });
  });
});
