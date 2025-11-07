# Quick Start Guide - Production Deployment

Get your Stock Earnings Tracker live in 5 minutes!

## 🚀 Fastest Path to Production

### 1. Get API Key (2 minutes)
```
1. Go to: https://financialmodelingprep.com/developer/docs/
2. Sign up (free)
3. Copy your API key
```

### 2. Deploy to Vercel (3 minutes)

#### Option A: One-Click Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add API key
vercel env add FMP_API_KEY production
# Paste your API key when prompted

# Enable real data
vercel env add VITE_USE_MOCK_DATA production
# Type: false

# Redeploy
vercel --prod
```

#### Option B: GitHub Deploy (Recommended)
```bash
# Push to GitHub
git add .
git commit -m "Production ready"
git push

# Go to: https://vercel.com/new
# Import your GitHub repo
# Add environment variables:
#   - FMP_API_KEY: your_api_key
#   - VITE_USE_MOCK_DATA: false
# Click Deploy
```

### 3. Done! ✅

Your app is live at: `https://your-app.vercel.app`

---

## 📋 Environment Variables

Set these in Vercel:

| Variable | Value | Purpose |
|----------|-------|---------|
| `FMP_API_KEY` | Your FMP API key | Server-side API access |
| `VITE_USE_MOCK_DATA` | `false` | Use real data (not mock) |

---

## 🔍 Verify It Works

Visit your app and check:
- [ ] Real company names appear
- [ ] Stock prices are realistic
- [ ] No "Mock Data" in console
- [ ] Charts load properly

---

## 📊 What You Built

```
┌─────────────────────────────────────────┐
│         React Frontend (Browser)        │
│    - No API keys exposed                │
│    - Fast & responsive UI               │
└──────────────────┬──────────────────────┘
                   │
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────┐
│    Vercel Serverless Functions          │
│    - /api/earnings-calendar             │
│    - /api/stock-quote                   │
│    - /api/stock-history                 │
│    - /api/batch-quotes                  │
│    - API keys stored securely           │
└──────────────────┬──────────────────────┘
                   │
                   │ Secure API calls
                   ▼
┌─────────────────────────────────────────┐
│    Financial Modeling Prep API          │
│    - Real earnings data                 │
│    - Live stock prices                  │
│    - Historical charts                  │
└─────────────────────────────────────────┘
```

---

## 💰 Costs

**Free Tier:**
- Vercel: Free (100GB bandwidth/month)
- FMP: Free (250 API calls/day)
- **Total: $0/month**
- Good for: ~25 users/day

**Need more?**
- FMP Pro: $30/month (1,500 calls/day)
- Vercel Pro: $20/month (unlimited bandwidth)

---

## 🆘 Quick Troubleshooting

**Still seeing mock data?**
```bash
# Check environment variables in Vercel dashboard
# Make sure VITE_USE_MOCK_DATA=false
# Redeploy after changing
```

**API errors?**
```bash
# Verify API key at:
# https://financialmodelingprep.com/developer/docs/dashboard
```

**Deploy failed?**
```bash
# Check build locally first:
npm run build

# If it works locally, check Vercel logs:
vercel logs
```

---

## 📚 Next Steps

1. ✅ Add custom domain (see DEPLOYMENT.md)
2. ✅ Enable analytics
3. ✅ Set up error monitoring
4. ✅ Share with users!

For detailed instructions, see **DEPLOYMENT.md**

---

## 🎯 Key Files

```
/api/                        ← Vercel serverless functions
  ├── earnings-calendar.ts   ← Get earnings calendar
  ├── stock-quote.ts         ← Get stock prices
  ├── stock-history.ts       ← Get price history
  └── batch-quotes.ts        ← Batch stock quotes

vercel.json                  ← Vercel configuration
.env.local.example           ← Environment variables template
DEPLOYMENT.md                ← Full deployment guide
```

---

## ✨ You're Done!

Your app is now:
- ✅ Live on production
- ✅ Using real financial data
- ✅ Secure (API keys hidden)
- ✅ Fast (global CDN)
- ✅ Free (on free tier)

Share it with the world! 🌍
