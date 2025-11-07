# Production Deployment Guide

Complete guide for deploying the Stock Earnings Tracker to production with real API data.

## Overview

The application uses a secure architecture:
- **Frontend**: React app (browser)
- **Backend**: Vercel serverless functions (`/api` folder)
- **Data Source**: Financial Modeling Prep API (accessed via backend)

This ensures API keys are never exposed to clients.

---

## Step 1: Get API Key

### Financial Modeling Prep (Recommended)

1. Visit https://financialmodelingprep.com/developer/docs/
2. Sign up for a free account
3. Copy your API key from the dashboard

**Free Tier:**
- 250 API calls per day
- Sufficient for ~25 users/day
- Perfect for testing and small projects

**Paid Plans:**
- Starter: $15/month (750 calls/day)
- Professional: $30/month (1,500 calls/day)
- Enterprise: Custom pricing

---

## Step 2: Local Testing (Optional)

Before deploying to production, test the real API integration locally:

### 2.1 Create Environment File

```bash
cp .env.local.example .env.local
```

### 2.2 Configure Environment Variables

Edit `.env.local`:

```env
# Your actual FMP API key
FMP_API_KEY=your_actual_api_key_here

# Use real API (set to 'false' to enable)
VITE_USE_MOCK_DATA=false
```

### 2.3 Install Vercel CLI

```bash
npm install -g vercel
```

### 2.4 Run Locally with Serverless Functions

```bash
vercel dev
```

This starts:
- Frontend at http://localhost:3000
- Serverless functions at http://localhost:3000/api/*

The app will now fetch real earnings data and stock prices!

---

## Step 3: Deploy to Vercel

### Option A: Deploy via CLI (Quickest)

1. **Login to Vercel:**
```bash
vercel login
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Add Environment Variable:**
```bash
vercel env add FMP_API_KEY production
```
Paste your API key when prompted.

4. **Add Frontend Variable (to use real data):**
```bash
vercel env add VITE_USE_MOCK_DATA production
```
Enter: `false`

5. **Redeploy to apply variables:**
```bash
vercel --prod
```

### Option B: Deploy via GitHub (Recommended for Teams)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Add production deployment setup"
git push origin main
```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repository
   - Authorize Vercel to access your repo

3. **Configure Environment Variables:**
   - In Vercel dashboard, go to: Settings → Environment Variables
   - Add two variables:

| Name | Value | Environment |
|------|-------|-------------|
| `FMP_API_KEY` | `your_actual_api_key` | Production |
| `VITE_USE_MOCK_DATA` | `false` | Production |

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - You'll get a production URL (e.g., `your-app.vercel.app`)

5. **Automatic Deployments:**
   - Every push to `main` branch auto-deploys to production
   - Pull requests get preview deployments
   - No manual steps needed!

---

## Step 4: Verify Deployment

### 4.1 Check the App

Visit your production URL and verify:
- ✅ App loads without errors
- ✅ Earnings calendar shows real companies
- ✅ Stock prices are updating
- ✅ Charts display correctly
- ✅ No console errors

### 4.2 Monitor API Usage

Check your API usage at:
https://financialmodelingprep.com/developer/docs/dashboard

Monitor:
- Daily API calls remaining
- Response times
- Error rates

### 4.3 Test Key Features

1. **Date Navigation:** Change dates to see different earnings
2. **Search:** Search for specific stocks
3. **Filters:** Filter by BMO/AMC timing
4. **Sort:** Test different sort options
5. **Modal:** Click cards to view detailed info

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain to Vercel

1. Go to your project in Vercel dashboard
2. Settings → Domains
3. Add your custom domain (e.g., `earnings.yourdomain.com`)

### 5.2 Configure DNS

Add these records to your DNS provider:

**For subdomain (e.g., earnings.yourdomain.com):**
```
Type: CNAME
Name: earnings
Value: cname.vercel-dns.com
```

**For root domain (e.g., yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

### 5.3 Verify

- DNS propagation takes 5-60 minutes
- Vercel automatically provisions SSL certificate
- Your app will be available at your custom domain with HTTPS

---

## Step 6: Production Optimization

### 6.1 Enable Caching

The serverless functions already implement caching:
- Earnings calendar: 5 minutes
- Stock quotes: 1 minute
- Historical data: 5 minutes

No additional configuration needed!

### 6.2 Monitor Performance

Use Vercel Analytics (free):
1. Go to your project dashboard
2. Click "Analytics"
3. Enable Vercel Analytics

Track:
- Page load times
- Serverless function performance
- User traffic patterns

### 6.3 Error Monitoring (Optional)

Add Sentry for error tracking:

1. Sign up at https://sentry.io
2. Install Sentry:
```bash
npm install @sentry/react
```
3. Configure in `src/main.tsx`
4. Redeploy

---

## Troubleshooting

### Problem: "API key not configured" Error

**Solution:**
1. Verify environment variable is set in Vercel
2. Variable name must be exactly: `FMP_API_KEY`
3. Redeploy after adding environment variables

### Problem: Still Seeing Mock Data

**Solution:**
1. Set `VITE_USE_MOCK_DATA=false` in Vercel
2. Check browser console for errors
3. Clear browser cache and reload

### Problem: "Failed to fetch" Errors

**Possible Causes:**
1. Invalid or expired API key
2. API rate limit exceeded (250 calls/day on free tier)
3. FMP API service down

**Solution:**
1. Check API key at https://financialmodelingprep.com/developer/docs/
2. Monitor usage in FMP dashboard
3. Upgrade plan if hitting rate limits

### Problem: Serverless Function Timeout

**Solution:**
- Vercel free tier: 10 second timeout
- Vercel Pro: 60 second timeout
- Our functions complete in < 3 seconds typically
- If timing out, check FMP API status

---

## Maintenance

### Daily
- Check API usage to avoid hitting limits
- Monitor error rates in Vercel dashboard

### Weekly
- Review Vercel Analytics
- Check for dependency updates: `npm outdated`

### Monthly
- Review API costs and usage patterns
- Consider upgrading FMP plan if needed
- Update dependencies: `npm update`

---

## Cost Breakdown

### Free Tier (Hobby Project)

**Vercel:**
- Hosting: Free
- Bandwidth: 100 GB/month
- Serverless Functions: 100 GB-hrs
- Sufficient for: ~5,000 visitors/month

**Financial Modeling Prep:**
- API: Free (250 calls/day)
- Sufficient for: ~25 active users/day

**Total: $0/month**

### Paid Tier (Production App)

**Vercel Pro:** $20/month
- Unlimited bandwidth
- Better performance
- Team collaboration
- 60 second function timeout

**FMP Professional:** $30/month
- 1,500 API calls/day
- ~150 active users/day
- Better data quality

**Total: $50/month**

---

## Security Best Practices

✅ **Already Implemented:**
- API keys stored server-side only
- CORS headers configured
- HTTPS enforced by Vercel
- Environment variables encrypted

✅ **Additional Recommendations:**
1. Enable Vercel password protection for staging
2. Set up rate limiting per IP (Vercel Edge Functions)
3. Monitor for unusual API usage patterns
4. Rotate API keys periodically

---

## Scaling Considerations

### < 100 users/day
- Free tier is sufficient
- Monitor API usage

### 100-1,000 users/day
- Upgrade FMP to Professional ($30/month)
- Consider Vercel Pro ($20/month)
- Implement Redis caching

### 1,000+ users/day
- FMP Enterprise plan
- Vercel Pro with Edge caching
- Database for user preferences
- Consider WebSocket for real-time updates

---

## Success! 🎉

Your Stock Earnings Tracker is now live in production with:
- ✅ Real-time earnings data
- ✅ Live stock prices
- ✅ Secure API access
- ✅ Automatic deployments
- ✅ HTTPS enabled
- ✅ Global CDN

**Next Steps:**
1. Share your app with users
2. Gather feedback
3. Monitor usage and errors
4. Iterate and improve!

For support, open an issue on GitHub or contact [your email/support channel].
