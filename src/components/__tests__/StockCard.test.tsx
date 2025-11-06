import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StockCard } from '../StockCard';
import { Stock } from '../../types/stock';

const mockStock: Stock = {
  symbol: 'AAPL',
  companyName: 'Apple Inc.',
  price: {
    current: 185.92,
    change: 2.5,
    changePercent: 1.36,
  },
  marketStatus: 'market-hours',
  earnings: {
    status: 'pending',
    timing: 'AMC',
    scheduledTime: '16:30',
    estimate: {
      eps: 1.54,
      revenue: 89500000000,
    },
  },
  priceHistory: [
    { date: '2024-01-01', open: 180, high: 186, low: 179, close: 185, volume: 50000000 },
    { date: '2024-01-02', open: 185, high: 190, low: 184, close: 189, volume: 52000000 },
  ],
  lastUpdated: new Date().toISOString(),
};

const mockReleasedStock: Stock = {
  ...mockStock,
  earnings: {
    status: 'released',
    timing: 'AMC',
    scheduledTime: '16:30',
    estimate: {
      eps: 1.54,
      revenue: 89500000000,
    },
    actual: {
      eps: 1.62,
      revenue: 91200000000,
      epsEstimate: 1.54,
      revenueEstimate: 89500000000,
    },
    beatStatus: 'beat',
    releasedAt: new Date().toISOString(),
  },
};

describe('StockCard', () => {
  it('should render stock symbol and company name', () => {
    render(<StockCard stock={mockStock} />);

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
  });

  it('should render current price', () => {
    render(<StockCard stock={mockStock} />);

    expect(screen.getByText(/\$185\.92/)).toBeInTheDocument();
  });

  it('should render price change with positive styling', () => {
    render(<StockCard stock={mockStock} />);

    const changeElement = screen.getByText(/\+1\.36%/);
    expect(changeElement).toBeInTheDocument();
    expect(changeElement.parentElement).toHaveClass('positive');
  });

  it('should render price change with negative styling for negative changes', () => {
    const negativeStock = {
      ...mockStock,
      price: { ...mockStock.price, change: -2.5, changePercent: -1.36 },
    };
    render(<StockCard stock={negativeStock} />);

    const changeElement = screen.getByText(/-1\.36%/);
    expect(changeElement).toBeInTheDocument();
    expect(changeElement.parentElement).toHaveClass('negative');
  });

  it('should show pending status badge for unreleased earnings', () => {
    render(<StockCard stock={mockStock} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should show released status badge for released earnings', () => {
    render(<StockCard stock={mockReleasedStock} />);

    expect(screen.getByText('Released')).toBeInTheDocument();
  });

  it('should display earnings timing', () => {
    render(<StockCard stock={mockStock} />);

    expect(screen.getByText('AMC')).toBeInTheDocument();
    expect(screen.getByText('16:30')).toBeInTheDocument();
  });

  it('should show estimates for pending earnings', () => {
    render(<StockCard stock={mockStock} />);

    expect(screen.getByText(/Est\. EPS:/)).toBeInTheDocument();
    expect(screen.getByText('$1.54')).toBeInTheDocument();
  });

  it('should show actual results for released earnings', () => {
    render(<StockCard stock={mockReleasedStock} />);

    expect(screen.getByText('Beat Estimates')).toBeInTheDocument();
    expect(screen.getByText('$1.62')).toBeInTheDocument();
  });

  it('should display after-hours data when available', () => {
    const stockWithAfterHours = {
      ...mockStock,
      price: {
        ...mockStock.price,
        afterHours: {
          price: 187.5,
          change: 1.58,
          changePercent: 0.85,
        },
      },
    };
    render(<StockCard stock={stockWithAfterHours} />);

    expect(screen.getByText(/After Hours:/)).toBeInTheDocument();
    expect(screen.getByText('$187.50')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<StockCard stock={mockStock} onClick={handleClick} />);

    const card = screen.getByText('AAPL').closest('.stock-card');
    await user.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have clickable class when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<StockCard stock={mockStock} onClick={handleClick} />);

    const card = screen.getByText('AAPL').closest('.stock-card');
    expect(card).toHaveClass('clickable');
  });

  it('should display market status', () => {
    render(<StockCard stock={mockStock} />);

    expect(screen.getByText('market hours')).toBeInTheDocument();
  });

  it('should format large revenue numbers correctly', () => {
    render(<StockCard stock={mockStock} />);

    // Should show $89.50B
    expect(screen.getByText(/\$89\.50B/)).toBeInTheDocument();
  });
});
