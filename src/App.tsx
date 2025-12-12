import { useState, useEffect, useCallback } from 'react';
import { Stock } from './types/stock';
import { earningsService } from './services/earningsService';
import { stockService } from './services/stockService';
import { DateSelector } from './components/DateSelector';
import { ErrorMessage } from './components/ErrorMessage';
import { SearchBar } from './components/SearchBar';
import { Controls, SortOption, FilterOption } from './components/Controls';
import { StockCard } from './components/StockCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CompactStockList } from './components/CompactStockList';
import { StockModal } from './components/StockModal';
import { REFRESH_INTERVALS } from './config/api';
import { fetchSP500List, isSP500 } from './config/sp500';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sp500Set, setSp500Set] = useState<Set<string>>(new Set());

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('symbol');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // Modal state
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Derived unique industries
  const industries = Array.from(new Set(stocks.map(s => s.industry).filter(Boolean))) as string[];
  industries.sort();

  // Load S&P 500 list on mount
  useEffect(() => {
    fetchSP500List().then(setSp500Set);
  }, []);

  // Fetch stocks data
  const fetchStocks = useCallback(async () => {
    try {
      setError(null);
      const data = await earningsService.getEarningsForDate(selectedDate);
      setStocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedDate]); // Add selectedDate dependency

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchStocks();
  }, [fetchStocks]);

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

    // Apply industry filter
    if (selectedIndustry !== 'all') {
      result = result.filter(stock => stock.industry === selectedIndustry);
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
  }, [stocks, searchQuery, sortBy, filterBy, selectedIndustry]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStocks();
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchStocks();
  };

  // Split stocks for display
  const majorStocks = filteredStocks.filter(s => isSP500(s.symbol, sp500Set));
  const minorStocks = filteredStocks.filter(s => !isSP500(s.symbol, sp500Set));

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
              industries={industries}
              selectedIndustry={selectedIndustry}
              onIndustryChange={setSelectedIndustry}
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
          <>
            {/* Major Stocks Section */}
            {majorStocks.length > 0 && (
              <section className="stock-section">
                <h2 className="section-title">
                  S&P 500 & Major Movers <span className="count-badge">{majorStocks.length}</span>
                </h2>
                <div className="stocks-grid">
                  {majorStocks.map((stock) => (
                    <StockCard
                      key={stock.symbol}
                      stock={stock}
                      onClick={() => setSelectedStock(stock)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Other Stocks Section */}
            {minorStocks.length > 0 && (
              <section className="stock-section">
                <h2 className="section-title">
                  Other Reporting Companies <span className="count-badge">{minorStocks.length}</span>
                </h2>
                <CompactStockList
                  stocks={minorStocks}
                  onSelectStock={setSelectedStock}
                />
              </section>
            )}
          </>
        )}
      </main>

      {selectedStock && (
        <StockModal stock={selectedStock} onClose={() => setSelectedStock(null)} />
      )}
    </div>
  );
}

export default App;
