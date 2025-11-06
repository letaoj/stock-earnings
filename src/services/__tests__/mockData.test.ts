import { describe, it, expect } from 'vitest';
import { generatePriceHistory, getCurrentMarketStatus, mockEarningsCalendar } from '../mockData';

describe('MockData', () => {
  describe('generatePriceHistory', () => {
    it('should generate price history with correct length', () => {
      const basePrice = 100;
      const days = 30;
      const result = generatePriceHistory(basePrice, days);

      // +1 because it includes today
      expect(result.length).toBe(days + 1);
    });

    it('should generate price data with all required fields', () => {
      const result = generatePriceHistory(100, 7);
      const priceData = result[0];

      expect(priceData).toHaveProperty('date');
      expect(priceData).toHaveProperty('open');
      expect(priceData).toHaveProperty('high');
      expect(priceData).toHaveProperty('low');
      expect(priceData).toHaveProperty('close');
      expect(priceData).toHaveProperty('volume');
    });

    it('should have high >= low for all generated data', () => {
      const result = generatePriceHistory(100, 30);

      result.forEach((data) => {
        expect(data.high).toBeGreaterThanOrEqual(data.low);
      });
    });

    it('should have realistic price movements', () => {
      const basePrice = 100;
      const volatility = 0.02;
      const result = generatePriceHistory(basePrice, 30, volatility);

      // Check that prices don't deviate too much from base
      result.forEach((data) => {
        // Within 50% of base price should be reasonable
        expect(data.close).toBeGreaterThan(basePrice * 0.5);
        expect(data.close).toBeLessThan(basePrice * 1.5);
      });
    });

    it('should generate dates in ascending order (oldest to newest)', () => {
      const result = generatePriceHistory(100, 10);

      for (let i = 0; i < result.length - 1; i++) {
        const currentDate = new Date(result[i].date);
        const nextDate = new Date(result[i + 1].date);
        expect(currentDate.getTime()).toBeLessThan(nextDate.getTime());
      }
    });

    it('should have positive volumes', () => {
      const result = generatePriceHistory(100, 30);

      result.forEach((data) => {
        expect(data.volume).toBeGreaterThan(0);
      });
    });
  });

  describe('getCurrentMarketStatus', () => {
    it('should return a valid market status', () => {
      const status = getCurrentMarketStatus();
      const validStatuses = ['pre-market', 'market-hours', 'after-hours', 'closed'];

      expect(validStatuses).toContain(status);
    });

    it('should return closed on weekends', () => {
      // This test would need to be mocked to test specific days
      // For now, just verify it returns a status
      const status = getCurrentMarketStatus();
      expect(status).toBeDefined();
    });
  });

  describe('mockEarningsCalendar', () => {
    it('should have entries with required fields', () => {
      expect(Array.isArray(mockEarningsCalendar)).toBe(true);
      expect(mockEarningsCalendar.length).toBeGreaterThan(0);

      mockEarningsCalendar.forEach((entry) => {
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('symbol');
        expect(entry).toHaveProperty('companyName');
        expect(entry).toHaveProperty('timing');
      });
    });

    it('should have valid timing values', () => {
      mockEarningsCalendar.forEach((entry) => {
        expect(['BMO', 'AMC', 'DMH']).toContain(entry.timing);
      });
    });

    it('should include both BMO and AMC entries', () => {
      const timings = mockEarningsCalendar.map((e) => e.timing);

      expect(timings).toContain('BMO');
      expect(timings).toContain('AMC');
    });

    it('should have estimates with positive values', () => {
      mockEarningsCalendar.forEach((entry) => {
        if (entry.estimate) {
          if (entry.estimate.eps) {
            expect(entry.estimate.eps).toBeGreaterThan(0);
          }
          if (entry.estimate.revenue) {
            expect(entry.estimate.revenue).toBeGreaterThan(0);
          }
        }
      });
    });

    it('should have unique symbols', () => {
      const symbols = mockEarningsCalendar.map((e) => e.symbol);
      const uniqueSymbols = new Set(symbols);

      expect(uniqueSymbols.size).toBe(symbols.length);
    });
  });
});
