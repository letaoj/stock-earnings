export type EarningsTiming = 'BMO' | 'AMC' | 'DMH'; // Before Market Open, After Market Close, During Market Hours

export type MarketStatus = 'pre-market' | 'market-hours' | 'after-hours' | 'closed';

export type EarningsStatus = 'pending' | 'released';

export interface StockPrice {
  current: number;
  change: number;
  changePercent: number;
  afterHours?: {
    price: number;
    change: number;
    changePercent: number;
  };
}

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface EarningsEstimate {
  eps?: number;
  revenue?: number;
}

export interface EarningsActual {
  eps: number;
  revenue?: number;
  epsEstimate?: number;
  revenueEstimate?: number;
}

export type EarningsBeatStatus = 'beat' | 'miss' | 'meet' | 'unknown';

export interface EarningsSummary {
  keyMetrics?: string[];
  highlights?: string[];
  guidance?: string;
  operationalUpdates?: string[];
  managementCommentary?: string;
}

export interface EarningsReport {
  status: EarningsStatus;
  scheduledTime?: string;
  timing: EarningsTiming;
  estimate?: EarningsEstimate;
  actual?: EarningsActual;
  beatStatus?: EarningsBeatStatus;
  summary?: EarningsSummary;
  releasedAt?: string;
}

export interface Stock {
  symbol: string;
  companyName: string;
  industry?: string;
  price: StockPrice;
  marketStatus: MarketStatus;
  earnings: EarningsReport;
  priceHistory: PriceData[];
  lastUpdated: string;
}

export interface EarningsCalendarEntry {
  date: string;
  symbol: string;
  companyName: string;
  timing: EarningsTiming;
  scheduledTime?: string;
  estimate?: EarningsEstimate;
  epsEstimate?: number;
  revenueEstimate?: number;
  epsActual?: number;
  revenueActual?: number;
}
