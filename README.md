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

3. Get a Financial Modeling Prep API key:
   - Sign up at https://financialmodelingprep.com/developer/docs/
   - Free tier: 250 requests/day
   - Copy your API key

4. Create environment configuration:
```bash
cp .env.example .env.local
```

5. Update `.env.local` with your API key:
```env
FMP_API_KEY=your_actual_fmp_api_key_here
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

The application uses **Financial Modeling Prep (FMP)** API through secure Vercel serverless functions.

### Architecture

- **Frontend**: React app (runs in browser)
- **Backend**: Vercel serverless functions (`/api` folder)
- **API**: Financial Modeling Prep (accessed only from backend)

This architecture ensures:
- ✅ API keys are never exposed to the client
- ✅ Rate limiting can be implemented server-side
- ✅ Secure API access
- ✅ Better caching control

### API Endpoints

The app uses these Vercel serverless functions:

1. **`/api/earnings-calendar`** - Get earnings calendar for a date
2. **`/api/stock-quote`** - Get current stock quote
3. **`/api/stock-history`** - Get historical price data
4. **`/api/batch-quotes`** - Get multiple stock quotes at once

All endpoints automatically proxy requests to Financial Modeling Prep with your server-side API key.

### Switching APIs

To use a different financial API (Alpha Vantage, Polygon.io, etc.):

1. Update the serverless functions in `/api` folder
2. Modify the data transformation logic to match the new API's response format
3. Update environment variables with new API credentials

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

## Deployment to Production

### Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy this app since it has built-in support for Vite and serverless functions.

#### Option 1: Deploy via CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

4. Set environment variable:
```bash
vercel env add FMP_API_KEY
```
Enter your Financial Modeling Prep API key when prompted.

5. Redeploy to apply environment variables:
```bash
vercel --prod
```

#### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Configure environment variables:
   - Add `FMP_API_KEY` with your API key
5. Click "Deploy"

Vercel will automatically:
- Build your React app
- Deploy serverless functions from `/api` folder
- Set up HTTPS and CDN
- Provide a production URL

#### Option 3: Deploy Button

Click this button to deploy directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL&env=FMP_API_KEY)

### Environment Variables for Production

Set these in your Vercel project settings:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `FMP_API_KEY` | Financial Modeling Prep API key | https://financialmodelingprep.com/developer/docs/ |

### Deploy to Other Platforms

#### Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build: `npm run build`
3. Deploy: `netlify deploy --prod`
4. Set environment variables in Netlify dashboard
5. Note: Modify `/api` functions to Netlify function format

#### AWS Amplify

1. Connect your GitHub repository
2. Set build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Set environment variables in Amplify console
4. Note: Serverless functions require AWS Lambda setup

#### Traditional Server (VPS)

1. Clone repo on server: `git clone <your-repo>`
2. Install dependencies: `npm install`
3. Create `.env` with your API key
4. Build: `npm run build`
5. Serve with nginx or: `npx serve -s dist`
6. Note: You'll need to set up a Node.js backend to handle `/api` routes

### API Rate Limits

**Financial Modeling Prep Free Tier:**
- 250 API calls per day
- Sufficient for ~25 users/day with typical usage

**To increase limits:**
- Starter: $15/month (750 calls/day)
- Professional: $30/month (1,500 calls/day)
- Enterprise: Custom pricing

**Optimization tips:**
- Cache API responses (already implemented with 1-5 minute cache)
- Use batch endpoints when possible
- Implement rate limiting per user

### Production Checklist

- [ ] Get FMP API key
- [ ] Set environment variables in Vercel
- [ ] Test deployment in preview environment
- [ ] Monitor API usage at https://financialmodelingprep.com/developer/docs/dashboard
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (optional)
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React and TypeScript
