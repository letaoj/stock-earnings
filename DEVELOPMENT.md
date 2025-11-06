# Development Guide

## Architecture Overview

The Stock Earnings Tracker follows a modular architecture with clear separation of concerns:

### Components Layer
React components handle the UI and user interactions. Each component is self-contained with its own styles and logic.

### Services Layer
Services handle all API interactions and data fetching. This abstraction allows easy switching between mock data and real APIs.

### Types Layer
TypeScript types ensure type safety across the application and serve as documentation.

## Component Structure

### StockCard
The main component for displaying individual stock information.

**Props:**
- `stock: Stock` - Stock data to display
- `onClick?: () => void` - Optional click handler

**Features:**
- Displays both pre and post-earnings states
- Shows price charts
- Handles after-hours data
- Responsive design

### DateSelector
Allows users to navigate between different dates.

**Props:**
- `selectedDate: Date` - Currently selected date
- `onDateChange: (date: Date) => void` - Callback when date changes

**Features:**
- Previous/Next day navigation
- "Today" quick jump
- Disables future dates

### Controls
Provides sorting and filtering controls.

**Props:**
- `sortBy: SortOption` - Current sort option
- `filterBy: FilterOption` - Current filter option
- `onSortChange: (sort: SortOption) => void` - Sort change handler
- `onFilterChange: (filter: FilterOption) => void` - Filter change handler
- `onRefresh: () => void` - Refresh handler
- `isRefreshing: boolean` - Refresh state

### StockModal
Detailed view of stock earnings information.

**Props:**
- `stock: Stock` - Stock to display
- `onClose: () => void` - Close handler

**Features:**
- Full earnings details
- Expanded price chart
- Earnings summary
- Analyst estimates comparison

## Service Architecture

### EarningsService
Handles all earnings-related data fetching.

**Methods:**
- `getEarningsCalendar(date: Date)` - Fetch earnings calendar
- `getStockWithEarnings(symbol: string)` - Get stock with earnings data
- `getMultipleStocksWithEarnings(symbols: string[])` - Batch fetch
- `getTodayEarnings()` - Get all today's earnings

### StockService
Handles stock price data.

**Methods:**
- `getMarketStatus()` - Current market status
- `getPriceHistory(symbol: string, days: number)` - Historical prices
- `getCurrentPrice(symbol: string)` - Current price
- `isMarketOpen()` - Check if market is open

### APIClient
Base HTTP client with retry logic and error handling.

**Features:**
- Automatic retries on failure
- API key injection
- Request/response interceptors
- Configurable timeout

## State Management

The application uses React hooks for state management:

### App State
```typescript
const [stocks, setStocks] = useState<Stock[]>([])
const [filteredStocks, setFilteredStocks] = useState<Stock[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [searchQuery, setSearchQuery] = useState('')
const [sortBy, setSortBy] = useState<SortOption>('symbol')
const [filterBy, setFilterBy] = useState<FilterOption>('all')
const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
```

### Effects
- **Data Fetching**: Fetches stocks on mount and date change
- **Auto-Refresh**: Sets up interval based on market status
- **Filtering**: Updates filtered stocks when filters change

## Type Definitions

### Stock
Complete stock information including price and earnings data.

```typescript
interface Stock {
  symbol: string
  companyName: string
  price: StockPrice
  marketStatus: MarketStatus
  earnings: EarningsReport
  priceHistory: PriceData[]
  lastUpdated: string
}
```

### EarningsReport
Earnings information with status-dependent fields.

```typescript
interface EarningsReport {
  status: EarningsStatus
  scheduledTime?: string
  timing: EarningsTiming
  estimate?: EarningsEstimate
  actual?: EarningsActual
  beatStatus?: EarningsBeatStatus
  summary?: EarningsSummary
  releasedAt?: string
}
```

## Testing Strategy

### Unit Tests
Test individual functions and services in isolation.

**Example:**
```typescript
describe('EarningsService', () => {
  it('should fetch earnings calendar', async () => {
    const result = await earningsService.getEarningsCalendar(new Date())
    expect(Array.isArray(result)).toBe(true)
  })
})
```

### Component Tests
Test component rendering and user interactions.

**Example:**
```typescript
describe('StockCard', () => {
  it('should render stock symbol', () => {
    render(<StockCard stock={mockStock} />)
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })
})
```

### Integration Tests
Test multiple components working together.

## Performance Optimization

### Memoization
Use `useMemo` and `useCallback` for expensive computations:

```typescript
const fetchStocks = useCallback(async () => {
  // Fetch logic
}, [])
```

### Lazy Loading
Components are loaded synchronously but could be lazy-loaded:

```typescript
const StockModal = lazy(() => import('./components/StockModal'))
```

### Auto-Refresh Strategy
Refresh intervals are adjusted based on market status:
- Market Hours: 1 minute (active trading)
- Earnings Time: 30 seconds (high volatility)
- Off Hours: 5 minutes (minimal changes)

## Code Style

### TypeScript
- Always use explicit types for function parameters and returns
- Use interfaces for object shapes
- Avoid `any` type
- Use enums for fixed sets of values

### React
- Functional components with hooks
- Use TypeScript for props
- Keep components focused and small
- Extract reusable logic into custom hooks

### CSS
- Component-scoped CSS files
- Use BEM-like naming convention
- Mobile-first responsive design
- Consistent spacing and colors

### Testing
- Test user-facing behavior, not implementation
- Use descriptive test names
- Mock external dependencies
- Aim for high coverage of critical paths

## Debugging

### React DevTools
Use React DevTools to inspect component hierarchy and state.

### Network Monitoring
Monitor API calls in browser DevTools Network tab.

### Console Logging
Add strategic console logs during development:

```typescript
console.log('Fetching stocks for date:', date)
```

### Error Boundaries
Add error boundaries for graceful error handling:

```typescript
<ErrorBoundary fallback={<ErrorMessage />}>
  <App />
</ErrorBoundary>
```

## Deployment

### Build Optimization
```bash
npm run build
```

Creates optimized production build in `dist/` directory.

### Environment Variables
Set production environment variables:
```env
VITE_FINANCIAL_API_KEY=prod_key
VITE_FINANCIAL_API_BASE_URL=https://api.production.com
```

### Hosting Options
- **Vercel**: Automatic deployments from Git
- **Netlify**: Easy setup with continuous deployment
- **AWS S3 + CloudFront**: Scalable static hosting
- **GitHub Pages**: Free hosting for public repos

## Troubleshooting

### Common Issues

**Tests failing with ResizeObserver error:**
- Ensure test setup includes ResizeObserver mock

**API calls failing:**
- Check API key configuration
- Verify API endpoint URLs
- Check network connectivity

**Chart not rendering:**
- Ensure container has width/height
- Check if data is being passed correctly

**Slow performance:**
- Check if too many re-renders
- Verify auto-refresh intervals
- Profile with React DevTools

## Best Practices

1. **Component Design**: Keep components small and focused
2. **State Management**: Lift state up only when necessary
3. **Error Handling**: Always handle errors gracefully
4. **Testing**: Write tests as you develop
5. **Documentation**: Document complex logic
6. **Performance**: Monitor and optimize as needed
7. **Accessibility**: Test with keyboard and screen readers
8. **Security**: Never commit API keys to Git

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Guide](https://vitest.dev)
- [Recharts Documentation](https://recharts.org)
- [Testing Library](https://testing-library.com)
