import { Stock, EarningsCalendarEntry, PriceData, MarketStatus } from '../types/stock';

// Helper to generate mock price history
export function generatePriceHistory(
  basePrice: number,
  days: number = 30,
  volatility: number = 0.02
): PriceData[] {
  const history: PriceData[] = [];
  let currentPrice = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    currentPrice += change;

    const open = currentPrice + (Math.random() - 0.5) * volatility * currentPrice;
    const close = currentPrice;
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);

    history.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    });
  }

  return history;
}

// Helper to determine current market status
export function getCurrentMarketStatus(): MarketStatus {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = hours * 60 + minutes;
  const dayOfWeek = now.getDay();

  // Weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'closed';
  }

  const preMarketStart = 4 * 60; // 4:00 AM
  const marketOpen = 9 * 60 + 30; // 9:30 AM
  const marketClose = 16 * 60; // 4:00 PM
  const afterHoursEnd = 20 * 60; // 8:00 PM

  if (time >= marketOpen && time < marketClose) {
    return 'market-hours';
  } else if (time >= preMarketStart && time < marketOpen) {
    return 'pre-market';
  } else if (time >= marketClose && time < afterHoursEnd) {
    return 'after-hours';
  }

  return 'closed';
}

// Mock earnings calendar data for today
export const mockEarningsCalendar: EarningsCalendarEntry[] = [
  {
    date: new Date().toISOString().split('T')[0],
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    timing: 'AMC',
    scheduledTime: '16:30',
    estimate: { eps: 1.54, revenue: 89500000000 },
  },
  {
    date: new Date().toISOString().split('T')[0],
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    timing: 'AMC',
    scheduledTime: '16:00',
    estimate: { eps: 2.65, revenue: 56200000000 },
  },
  {
    date: new Date().toISOString().split('T')[0],
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    timing: 'AMC',
    scheduledTime: '16:15',
    estimate: { eps: 1.45, revenue: 74800000000 },
  },
  {
    date: new Date().toISOString().split('T')[0],
    symbol: 'AMZN',
    companyName: 'Amazon.com Inc.',
    timing: 'AMC',
    scheduledTime: '16:30',
    estimate: { eps: 0.95, revenue: 145400000000 },
  },
  {
    date: new Date().toISOString().split('T')[0],
    symbol: 'TSLA',
    companyName: 'Tesla Inc.',
    timing: 'AMC',
    scheduledTime: '17:00',
    estimate: { eps: 0.85, revenue: 24500000000 },
  },
  {
    date: new Date().toISOString().split('T')[0],
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    timing: 'BMO',
    scheduledTime: '07:00',
    estimate: { eps: 4.12, revenue: 18200000000 },
  },
  {
    date: new Date().toISOString().split('T')[0],
    symbol: 'META',
    companyName: 'Meta Platforms Inc.',
    timing: 'AMC',
    scheduledTime: '16:00',
    estimate: { eps: 4.25, revenue: 34100000000 },
  },
  {
    date: new Date().toISOString().split('T')[0],
    symbol: 'JPM',
    companyName: 'JPMorgan Chase & Co.',
    timing: 'BMO',
    scheduledTime: '07:30',
    estimate: { eps: 3.97, revenue: 38500000000 },
  },
];

// Mock stock prices
const mockPrices: Record<string, number> = {
  AAPL: 185.92,
  MSFT: 374.58,
  GOOGL: 141.80,
  AMZN: 178.25,
  TSLA: 242.84,
  NVDA: 495.22,
  META: 482.32,
  JPM: 194.67,
};

export function generateMockStock(symbol: string, earningsEntry: EarningsCalendarEntry): Stock {
  const basePrice = mockPrices[symbol] || 100;
  const change = (Math.random() - 0.5) * 10;
  const changePercent = (change / basePrice) * 100;

  const marketStatus = getCurrentMarketStatus();
  const isAfterHours = marketStatus === 'after-hours';

  // Simulate released earnings for BMO stocks and some AMC stocks
  const earningsReleased = earningsEntry.timing === 'BMO' || (earningsEntry.timing === 'AMC' && Math.random() > 0.5);

  const stock: Stock = {
    symbol,
    companyName: earningsEntry.companyName,
    price: {
      current: basePrice + change,
      change,
      changePercent,
      afterHours: isAfterHours
        ? {
            price: basePrice + change + (Math.random() - 0.5) * 5,
            change: (Math.random() - 0.5) * 5,
            changePercent: ((Math.random() - 0.5) * 5 / basePrice) * 100,
          }
        : undefined,
    },
    marketStatus,
    earnings: {
      status: earningsReleased ? 'released' : 'pending',
      timing: earningsEntry.timing,
      scheduledTime: earningsEntry.scheduledTime,
      estimate: earningsEntry.estimate,
      actual: earningsReleased
        ? {
            eps: (earningsEntry.estimate?.eps || 1) * (0.9 + Math.random() * 0.2),
            revenue: (earningsEntry.estimate?.revenue || 1000000000) * (0.95 + Math.random() * 0.1),
            epsEstimate: earningsEntry.estimate?.eps,
            revenueEstimate: earningsEntry.estimate?.revenue,
          }
        : undefined,
      beatStatus: earningsReleased
        ? Math.random() > 0.3
          ? 'beat'
          : Math.random() > 0.5
          ? 'meet'
          : 'miss'
        : undefined,
      summary: earningsReleased
        ? {
            keyMetrics: [
              'Strong revenue growth driven by product sales',
              'Improved operating margins',
              'Record quarterly earnings',
            ],
            highlights: [
              'New product launches exceeded expectations',
              'Market share gains in key segments',
              'Successful cost reduction initiatives',
            ],
            guidance: 'Management provided optimistic guidance for next quarter',
            operationalUpdates: [
              'Expanded manufacturing capacity',
              'Strategic partnership announced',
            ],
            managementCommentary: 'CEO expressed confidence in long-term growth trajectory',
          }
        : undefined,
      releasedAt: earningsReleased ? new Date().toISOString() : undefined,
    },
    priceHistory: generatePriceHistory(basePrice, 30),
    lastUpdated: new Date().toISOString(),
  };

  return stock;
}
