import { useState, useEffect } from 'react';
import { Stock, PriceData } from '../types/stock';
import { StockChart } from './StockChart';
import { stockService } from '../services/stockService';
import { useSettings } from '../contexts/SettingsContext';
import './StockModal.css';

interface StockModalProps {
  stock: Stock;
  onClose: () => void;
}

export function StockModal({ stock, onClose }: StockModalProps) {
  const { timezone } = useSettings();
  const [priceHistory, setPriceHistory] = useState<PriceData[]>(stock.priceHistory || []);
  const [range, setRange] = useState<'30' | '90' | '365'>('30');
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isPositive = stock.price.change >= 0;
  const earningsReleased = stock.earnings.status === 'released';

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const history = await stockService.getPriceHistory(stock.symbol, parseInt(range));
        setPriceHistory(history);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [stock.symbol, range]);

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



  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <div className="modal-header">
          <div>
            <h2 className="modal-symbol">{stock.symbol}</h2>
            <p className="modal-company">{stock.companyName}</p>
          </div>
          <div className="modal-price-section">
            <div className="modal-price">{formatCurrency(stock.price.current)}</div>
            <div className={`modal-change ${isPositive ? 'positive' : 'negative'}`}>
              {formatCurrency(Math.abs(stock.price.change))} ({formatPercent(stock.price.changePercent)})
            </div>
          </div>
        </div>

        <div className="modal-body">
          <section className="modal-section">
            <div className="chart-header">
              <h3>Price History</h3>
              <div className="range-selector">
                <button
                  className={range === '30' ? 'active' : ''}
                  onClick={() => setRange('30')}
                >
                  1M
                </button>
                <button
                  className={range === '90' ? 'active' : ''}
                  onClick={() => setRange('90')}
                >
                  3M
                </button>
                <button
                  className={range === '365' ? 'active' : ''}
                  onClick={() => setRange('365')}
                >
                  1Y
                </button>
              </div>
            </div>
            <div className="modal-chart">
              {loadingHistory ? (
                <div className="chart-loading">Loading chart data...</div>
              ) : (
                <StockChart data={priceHistory} isPositive={isPositive} showAxis />
              )}
            </div>
          </section>

          {stock.price.afterHours && (
            <section className="modal-section">
              <h3>After Hours Trading</h3>
              <div className="after-hours-details">
                <div className="detail-row">
                  <span>Price:</span>
                  <span>{formatCurrency(stock.price.afterHours.price)}</span>
                </div>
                <div className="detail-row">
                  <span>Change:</span>
                  <span className={stock.price.afterHours.change >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(Math.abs(stock.price.afterHours.change))} (
                    {formatPercent(stock.price.afterHours.changePercent)})
                  </span>
                </div>
              </div>
            </section>
          )}

          <section className="modal-section">
            <h3>Earnings Information</h3>
            <div className="earnings-details">
              <div className="detail-row">
                <span>Status:</span>
                <span className={`status-badge ${earningsReleased ? 'released' : 'pending'}`}>
                  {earningsReleased ? 'Released' : 'Pending'}
                </span>
              </div>
              <div className="detail-row">
                <span>Timing:</span>
                <span>{stock.earnings.timing} {stock.earnings.scheduledTime && `at ${stock.earnings.scheduledTime}`}</span>
              </div>
            </div>
          </section>

          {earningsReleased && stock.earnings.actual ? (
            <>
              <section className="modal-section">
                <h3>Earnings Results</h3>
                <div className="earnings-details">
                  <div className="detail-row">
                    <span>EPS:</span>
                    <span>
                      ${stock.earnings.actual.eps.toFixed(2)}
                      {stock.earnings.actual.epsEstimate && (
                        <span className="estimate-text">
                          {' '}(Est: ${stock.earnings.actual.epsEstimate.toFixed(2)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Revenue:</span>
                    <span>
                      {formatCurrency(stock.earnings.actual.revenue || 0)}
                      {stock.earnings.actual.revenueEstimate && (
                        <span className="estimate-text">
                          {' '}(Est: {formatCurrency(stock.earnings.actual.revenueEstimate || 0)})
                        </span>
                      )}
                    </span>
                  </div>
                  {stock.earnings.beatStatus && (
                    <div className="detail-row">
                      <span>Performance:</span>
                      <span className={`beat-badge ${stock.earnings.beatStatus}`}>
                        {stock.earnings.beatStatus === 'beat' && 'Beat Estimates'}
                        {stock.earnings.beatStatus === 'miss' && 'Missed Estimates'}
                        {stock.earnings.beatStatus === 'meet' && 'Met Estimates'}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {stock.earnings.summary && (
                <section className="modal-section">
                  <h3>Earnings Summary</h3>
                  {stock.earnings.summary.keyMetrics && stock.earnings.summary.keyMetrics.length > 0 && (
                    <div className="summary-subsection">
                      <h4>Key Metrics</h4>
                      <ul>
                        {stock.earnings.summary.keyMetrics.map((metric, i) => (
                          <li key={i}>{metric}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {stock.earnings.summary.highlights && stock.earnings.summary.highlights.length > 0 && (
                    <div className="summary-subsection">
                      <h4>Highlights</h4>
                      <ul>
                        {stock.earnings.summary.highlights.map((highlight, i) => (
                          <li key={i}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {stock.earnings.summary.guidance && (
                    <div className="summary-subsection">
                      <h4>Guidance</h4>
                      <p>{stock.earnings.summary.guidance}</p>
                    </div>
                  )}
                </section>
              )}
            </>
          ) : (
            stock.earnings.estimate && (
              <section className="modal-section">
                <h3>Analyst Estimates</h3>
                <div className="earnings-details">
                  {stock.earnings.estimate.eps && (
                    <div className="detail-row">
                      <span>EPS Estimate:</span>
                      <span>${stock.earnings.estimate.eps.toFixed(2)}</span>
                    </div>
                  )}
                  {stock.earnings.estimate.revenue && (
                    <div className="detail-row">
                      <span>Revenue Estimate:</span>
                      <span>{formatCurrency(stock.earnings.estimate.revenue || 0)}</span>
                    </div>
                  )}
                </div>
              </section>
            )
          )}

          <section className="modal-section">
            <h3>Market Status</h3>
            <div className="earnings-details">
              <div className="detail-row">
                <span>Status:</span>
                <span className="market-status-text">{stock.marketStatus.replace('-', ' ')}</span>
              </div>
              <div className="detail-row">
                <span>Last Updated:</span>
                <span>{new Date(stock.lastUpdated).toLocaleString('en-US', { timeZone: timezone === 'local' ? undefined : timezone })}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
