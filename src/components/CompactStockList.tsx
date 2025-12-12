import { Stock } from '../types/stock';
import './CompactStockList.css';

interface CompactStockListProps {
    stocks: Stock[];
    onSelectStock: (stock: Stock) => void;
}

export function CompactStockList({ stocks, onSelectStock }: CompactStockListProps) {
    const formatCurrency = (value: number) => {
        if (value >= 1e9) {
            return `$${(value / 1e9).toFixed(2)}B`;
        } else if (value >= 1e6) {
            return `$${(value / 1e6).toFixed(2)}M`;
        }
        return `$${value.toFixed(2)}`;
    };

    const getBeatStatusClass = (stock: Stock) => {
        switch (stock.earnings.beatStatus) {
            case 'beat': return 'beat';
            case 'miss': return 'miss';
            case 'meet': return 'meet';
            default: return '';
        }
    };

    return (
        <div className="compact-list-container">
            <table className="compact-stock-table">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Company</th>
                        <th>Timing</th>
                        <th>EPS (Act/Est)</th>
                        <th className="hide-mobile">Revenue</th>
                        <th className="hide-mobile">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {stocks.map((stock) => {
                        const isPositive = stock.price.change >= 0;
                        const earningsReleased = stock.earnings.status === 'released';

                        return (
                            <tr key={stock.symbol} onClick={() => onSelectStock(stock)} className="stock-row">
                                <td className="col-symbol">
                                    <span className="symbol-text">{stock.symbol}</span>
                                </td>
                                <td className="col-company">
                                    <div className="company-text">{stock.companyName}</div>
                                    <div className="industry-text">{stock.industry || 'Unknown'}</div>
                                </td>
                                <td className="col-timing">
                                    <span className={`timing-badge ${stock.earnings.timing}`}>
                                        {stock.earnings.timing}
                                    </span>
                                </td>
                                <td className="col-eps">
                                    {earningsReleased && stock.earnings.actual ? (
                                        <div className={`eps-cell ${getBeatStatusClass(stock)}`}>
                                            <span className="actual">{stock.earnings.actual.eps.toFixed(2)}</span>
                                            {stock.earnings.actual.epsEstimate && (
                                                <span className="estimate"> / {stock.earnings.actual.epsEstimate.toFixed(2)}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="estimate">Est: {stock.earnings.estimate?.eps?.toFixed(2) || 'N/A'}</span>
                                    )}
                                </td>
                                <td className="col-revenue hide-mobile">
                                    {earningsReleased && stock.earnings.actual?.revenue ? (
                                        formatCurrency(stock.earnings.actual.revenue)
                                    ) : stock.earnings.estimate?.revenue ? (
                                        <span className="estimate-text">{formatCurrency(stock.earnings.estimate.revenue)}</span>
                                    ) : '-'}
                                </td>
                                <td className="col-price hide-mobile">
                                    <div className={`price-cell ${isPositive ? 'positive' : 'negative'}`}>
                                        <div>${stock.price.current.toFixed(2)}</div>
                                        <div className="price-change">{stock.price.changePercent.toFixed(2)}%</div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
