# Stock Earnings Tracker

A modern web application for tracking and displaying daily earnings reports from publicly traded companies, providing users with quick visual insights into stock performance trends.

![Stock Earnings Tracker](https://img.shields.io/badge/React-18.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) ![Tests](https://img.shields.io/badge/tests-83%20passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- **Daily Earnings Display**: View all companies reporting earnings for any selected day
- **Pre/Post Earnings States**: Automatic display of estimates before earnings release and actual results after
- **Real-time Price Data**: Current stock prices with after-hours trading information
- **Interactive Charts**: 30-day price trend visualization using Recharts
- **Market Status Tracking**: Displays current market status (pre-market, market hours, after-hours, closed)

### User Interface
- **Date Navigation**: Browse earnings by date with previous/next day controls
- **Search Functionality**: Quickly find stocks by symbol or company name
- **Filter Options**: Filter by earnings timing (BMO/AMC) or release status
- **Sort Options**: Sort stocks by symbol, company name, price change, or earnings timing
- **Auto-Refresh**: Automatic data refresh based on market status
- **Detailed Modal**: Click any stock card to view comprehensive earnings information
- **Responsive Design**: Fully responsive layout for desktop, tablet, and mobile devices

### Earnings Information

**Before Earnings Release:**
- Company name and stock ticker
- Current price and pre-market data
- Scheduled earnings time
- Analyst consensus estimates (EPS and Revenue)
- 30-day price history chart

**After Earnings Release:**
- Actual reported EPS and Revenue
- Beat/Miss/Meet indicators vs estimates
- After-hours price movement
- Earnings summary with key highlights
- Price reaction to earnings

## Tech Stack

- **Frontend**: React 18.2 with TypeScript
- **Build Tool**: Vite 5.0
- **Charts**: Recharts 2.10
- **HTTP Client**: Axios 1.6
- **Date Utilities**: date-fns 3.0
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS with responsive design

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-earnings
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Update `.env` with your API keys:
```env
VITE_FINANCIAL_API_KEY=your_api_key_here
VITE_FINANCIAL_API_BASE_URL=https://api.example.com
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## Project Structure

```
stock-earnings/
├── src/
│   ├── components/          # React components
│   │   ├── __tests__/      # Component tests
│   │   ├── Controls.tsx    # Sort and filter controls
│   │   ├── DateSelector.tsx # Date navigation
│   │   ├── ErrorMessage.tsx # Error display
│   │   ├── LoadingSpinner.tsx # Loading state
│   │   ├── SearchBar.tsx   # Search input
│   │   ├── StockCard.tsx   # Individual stock card
│   │   ├── StockChart.tsx  # Price chart
│   │   └── StockModal.tsx  # Detailed stock view
│   ├── services/           # API and data services
│   │   ├── __tests__/     # Service tests
│   │   ├── apiClient.ts   # HTTP client
│   │   ├── earningsService.ts # Earnings data
│   │   ├── mockData.ts    # Mock data generator
│   │   └── stockService.ts # Stock price data
│   ├── types/             # TypeScript definitions
│   │   └── stock.ts       # Type definitions
│   ├── config/            # Configuration
│   │   └── api.ts         # API config
│   ├── test/              # Test setup
│   │   └── setup.ts       # Test configuration
│   ├── App.tsx            # Main application
│   ├── App.css            # App styles
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── .env.example           # Environment template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
└── README.md             # This file
```

## API Integration

The application is designed to work with financial data APIs. Currently, it uses mock data for development. To integrate with a real API:

1. Update `src/services/earningsService.ts` and `src/services/stockService.ts`
2. Set `USE_MOCK_DATA = false` in both service files
3. Implement the API calls using the `apiClient`
4. Configure your API endpoints in `.env`

### Recommended APIs

- **Financial Modeling Prep**: Comprehensive financial data
- **Alpha Vantage**: Free stock market APIs
- **Polygon.io**: Real-time and historical market data
- **Yahoo Finance API**: Stock prices and earnings data
- **Earnings Whispers**: Earnings calendar and estimates

## Testing

The project includes comprehensive test coverage:

- **83 Total Tests**
  - 42 Service Tests (earningsService, stockService, mockData)
  - 41 Component Tests (StockCard, DateSelector, SearchBar, Controls)

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Performance

- **Page Load**: < 3 seconds
- **Auto-Refresh**:
  - Market Hours: Every 1 minute
  - Earnings Time: Every 30 seconds
  - Off Hours: Every 5 minutes
- **Supports**: 50+ stocks simultaneously

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- ARIA labels for screen readers
- Proper color contrast ratios

## Future Enhancements

- [ ] User accounts and watchlists
- [ ] Email/push alerts for earnings
- [ ] AI-generated earnings summaries
- [ ] Earnings call transcripts
- [ ] Social sentiment tracking
- [ ] International markets support
- [ ] Dark mode
- [ ] Export functionality (PDF, CSV)
- [ ] Historical earnings comparison

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- React and TypeScript communities
- Recharts for excellent charting library
- Vitest and Testing Library for testing tools

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React and TypeScript
