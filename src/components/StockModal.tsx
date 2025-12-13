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



  const [analysis, setAnalysis] = useState<any | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch analysis if earnings are released
    if (earningsReleased && !analysis) {
      const fetchAnalysis = async () => {
        setAnalyzing(true);
        try {
          // This call triggers the backend to search, download, and analyze
          const result = await import('../services/earningsService').then(m => m.earningsService.getEarningsAnalysis(stock.symbol));
          setAnalysis(result);
        } catch (err) {
          console.error('Analysis failed:', err);
          setAnalysisError('Detailed analysis unavailable.');
        } finally {
          setAnalyzing(false);
        }
      };

      fetchAnalysis();
    }
  }, [stock.symbol, earningsReleased, analysis]);

  // UI Helper for Sentiment
  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return '#4ade80';
    if (sentiment === 'negative') return '#f87171';
    return '#9ca3af';
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
          {/* AI Analysis Section - Top Priority if available */}
          {earningsReleased && (
            <section className="modal-section ai-analysis-section" style={{ borderLeft: '3px solid #60a5fa', background: 'rgba(96, 165, 250, 0.05)' }}>
              <div className="chart-header" style={{ marginBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', margin: 0 }}>
                  🤖 AI Earnings Analysis
                  {analyzing && <span className="spinner-small" style={{ fontSize: '0.8rem' }}>Analyzing...</span>}
                </h3>
                {analysis && (
                  <span className="sentiment-badge" style={{
                    background: getSentimentColor(analysis.sentiment),
                    color: '#000',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {analysis.sentiment}
                  </span>
                )}
              </div>

              {analyzing ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                  Reading report and generating summary...
                </div>
              ) : analysis ? (
                <div className="analysis-content">
                  <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>{analysis.summary}</p>

                  {analysis.keyTakeaways && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '6px' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Key Takeaways</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                        {analysis.keyTakeaways.map((point: string, i: number) => (
                          <li key={i} style={{ marginBottom: '0.3rem' }}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.reportUrl && (
                    <div style={{ marginTop: '0.8rem', fontSize: '0.8rem' }}>
                      <a href={analysis.reportUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>
                        View Full Report ({analysis.quarter}) →
                      </a>
                    </div>
                  )}
                </div>
              ) : analysisError ? (
                <div style={{ color: '#f87171', fontSize: '0.9rem' }}>
                  ⚠️ {analysisError}
                </div>
              ) : null}
            </section>
          )}

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
