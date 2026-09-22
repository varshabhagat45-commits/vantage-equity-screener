# Vantage — Equity Screener

Screen Indian listed companies on quality, value, and ownership. Last prices refresh from the NSE feed; valuation multiples scale with the live price.

**Not investment advice.**

## Free public site (no Grok paid plan)

The in-chat **Publish → grok.me** button is a paid Grok Build feature. This repo is the free path.

### One-click deploy on Vercel (Hobby is free)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/varshabhagat45-commits/vantage-equity-screener)

Or open [vercel.com/new](https://vercel.com/new) → Import this GitHub repo → Deploy.

You get a `*.vercel.app` URL. A custom domain is optional and free on Hobby.

## What updates daily

- NSE last price and 1-day change
- Market cap, P/E, P/B, and dividend yield move with that price
- Quality / growth / promoter data stay on the last filing

Prices are fetched server-side and cached for about 15 minutes.
