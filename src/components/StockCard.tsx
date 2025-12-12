import { Stock } from '../types/stock';
import { StockChart } from './StockChart';
import './StockCard.css';

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
}

export function StockCard({ stock, onClick }: StockCardProps) {
  const isPositive = stock.price.change >= 0;
  const hasAfterHours = stock.price.afterHours !== undefined;
  const earningsReleased = stock.earnings.status === 'released';

  const formatCurrency = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getBeatStatusClass = () => {
    switch (stock.earnings.beatStatus) {
      case 'beat':
        return 'beat';
      case 'miss':
        return 'miss';
      case 'meet':
        return 'meet';
      default:
        return '';
    }
  };

  const getBeatStatusText = () => {
    switch (stock.earnings.beatStatus) {
      case 'beat':
        return 'Beat Estimates';
      case 'miss':
        return 'Missed Estimates';
      case 'meet':
        return 'Met Estimates';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`stock-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="stock-card-header">
        <div className="stock-info">
          <div className="stock-symbol">{stock.symbol}</div>
          <div className="company-name">{stock.companyName}</div>
          <div className="stock-industry">{stock.industry || 'Unknown Industry'}</div>
        </div>
        <div className={`earnings-status ${earningsReleased ? 'released' : 'pending'}`}>
          {earningsReleased ? (
            <span className="status-badge released">Released</span>
          ) : (
            <span className="status-badge pending">Pending</span>
          )}
        </div>
      </div>

      <div className="stock-card-body">
        <div className="price-section">
          <div className="current-price">
            <span className="price-label">Current</span>
            <span className="price-value">{formatCurrency(stock.price.current)}</span>
          </div>
          <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
            <span>{formatCurrency(Math.abs(stock.price.change))}</span>
            <span className="percent">{formatPercent(stock.price.changePercent)}</span>
          </div>
        </div>

        {hasAfterHours && stock.price.afterHours && (
          <div className="after-hours">
            <span className="label">After Hours:</span>
            <span className="value">{formatCurrency(stock.price.afterHours.price)}</span>
            <span
              className={`change ${stock.price.afterHours.change >= 0 ? 'positive' : 'negative'
                }`}
            >
              {formatPercent(stock.price.afterHours.changePercent)}
            </span>
          </div>
        )}

        <div className="chart-container">
          <StockChart data={stock.priceHistory} isPositive={isPositive} compact />
        </div>

        <div className="earnings-info">
          <div className="earnings-timing">
            <span className="label">Timing:</span>
            <span className="value">{stock.earnings.timing}</span>
            {stock.earnings.scheduledTime && (
              <span className="time">{stock.earnings.scheduledTime}</span>
            )}
          </div>

          {!earningsReleased && stock.earnings.estimate && (
            <div className="estimates">
              <div className="estimate-row">
                <span className="label">Est. EPS:</span>
                <span className="value">${stock.earnings.estimate.eps?.toFixed(2)}</span>
              </div>
              {stock.earnings.estimate.revenue && (
                <div className="estimate-row">
                  <span className="label">Est. Revenue:</span>
                  <span className="value">
                    {formatCurrency(stock.earnings.estimate.revenue)}
                  </span>
                </div>
              )}
            </div>
          )}

          {earningsReleased && stock.earnings.actual && (
            <div className="actuals">
              <div className={`beat-status ${getBeatStatusClass()}`}>
                {getBeatStatusText()}
              </div>
              <div className="actual-row">
                <span className="label">EPS:</span>
                <span className="value">${stock.earnings.actual.eps.toFixed(2)}</span>
                {stock.earnings.actual.epsEstimate && (
                  <span className="estimate">
                    (Est: ${stock.earnings.actual.epsEstimate.toFixed(2)})
                  </span>
                )}
              </div>
              <div className="actual-row">
                <span className="label">Revenue:</span>
                <span className="value">{formatCurrency(stock.earnings.actual.revenue)}</span>
                {stock.earnings.actual.revenueEstimate && (
                  <span className="estimate">
                    (Est: {formatCurrency(stock.earnings.actual.revenueEstimate)})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="stock-card-footer">
        <span className="market-status">{stock.marketStatus.replace('-', ' ')}</span>
        <span className="last-updated">
          Updated: {new Date(stock.lastUpdated).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
