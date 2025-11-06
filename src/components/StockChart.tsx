import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceData } from '../types/stock';
import './StockChart.css';

interface StockChartProps {
  data: PriceData[];
  isPositive: boolean;
  compact?: boolean;
  showAxis?: boolean;
}

export function StockChart({ data, isPositive, compact = false, showAxis = false }: StockChartProps) {
  // Format data for chart
  const chartData = data.map((item) => ({
    date: item.date,
    price: item.close,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  const lineColor = isPositive ? '#10b981' : '#ef4444';
  const gradientId = `gradient-${isPositive ? 'positive' : 'negative'}`;

  return (
    <div className={`stock-chart ${compact ? 'compact' : ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showAxis && (
            <>
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: lineColor }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={compact ? 1.5 : 2}
            dot={false}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
