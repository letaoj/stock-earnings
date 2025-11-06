import { useState, useEffect, useCallback } from 'react';
import { Stock } from './types/stock';
import { earningsService } from './services/earningsService';
import { stockService } from './services/stockService';
import { DateSelector } from './components/DateSelector';
import { SearchBar } from './components/SearchBar';
import { Controls, SortOption, FilterOption } from './components/Controls';
import { StockCard } from './components/StockCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { StockModal } from './components/StockModal';
import { REFRESH_INTERVALS } from './config/api';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('symbol');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Modal state
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Fetch stocks data
  const fetchStocks = useCallback(async () => {
    try {
      setError(null);
      const data = await earningsService.getTodayEarnings();
      setStocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchStocks();
  }, [fetchStocks, selectedDate]);

  // Auto-refresh based on market status
  useEffect(() => {
    const marketStatus = stockService.getMarketStatus();
    let interval: number;

    if (marketStatus === 'market-hours') {
      interval = window.setInterval(fetchStocks, REFRESH_INTERVALS.MARKET_HOURS);
    } else if (marketStatus === 'after-hours' || marketStatus === 'pre-market') {
      interval = window.setInterval(fetchStocks, REFRESH_INTERVALS.EARNINGS_TIME);
    } else {
      interval = window.setInterval(fetchStocks, REFRESH_INTERVALS.OFF_HOURS);
    }

    return () => clearInterval(interval);
  }, [fetchStocks]);

  // Filter and sort stocks
  useEffect(() => {
    let result = [...stocks];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      if (filterBy === 'BMO' || filterBy === 'AMC') {
        result = result.filter((stock) => stock.earnings.timing === filterBy);
      } else if (filterBy === 'released' || filterBy === 'pending') {
        result = result.filter((stock) => stock.earnings.status === filterBy);
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        case 'name':
          return a.companyName.localeCompare(b.companyName);
        case 'change':
          return b.price.changePercent - a.price.changePercent;
        case 'timing':
          return a.earnings.timing.localeCompare(b.earnings.timing);
        default:
          return 0;
      }
    });

    setFilteredStocks(result);
  }, [stocks, searchQuery, sortBy, filterBy]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStocks();
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchStocks();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Stock Earnings Tracker</h1>
        <p className="subtitle">Track daily earnings reports and stock performance</p>
      </header>

      <main className="app-main">
        <div className="controls-section">
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

          <div className="controls-row">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <Controls
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterBy={filterBy}
              onFilterChange={setFilterBy}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading earnings data..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={handleRetry} />
        ) : filteredStocks.length === 0 ? (
          <div className="no-results">
            <p>No earnings reports found for the selected filters.</p>
          </div>
        ) : (
          <div className="stocks-grid">
            {filteredStocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onClick={() => setSelectedStock(stock)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedStock && (
        <StockModal stock={selectedStock} onClose={() => setSelectedStock(null)} />
      )}
    </div>
  );
}

export default App;
