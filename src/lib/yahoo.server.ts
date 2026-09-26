export type LiveQuote = {
  price: number;
  chg1d: number;
  asOf: number;
};

/** NSE ticker in this app → Yahoo Finance symbol (without .NS). */
export const YAHOO_SYMBOL: Record<string, string> = {
  NALCO: "NATIONALUM",
  TATACONS: "TATACONSUM",
  TATAMOTORS: "TMCV",
};

const REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(YAHOO_SYMBOL).map(([ticker, yahoo]) => [yahoo, ticker]),
);

const UA =
  "Mozilla/5.0 (compatible; VantageScreener/1.0; +https://grok.com) AppleWebKit/537.36";

function yahooSymbol(ticker: string) {
  return `${YAHOO_SYMBOL[ticker] ?? ticker}.NS`;
}

function tickerFromYahoo(symbol: string) {
  const bare = symbol.replace(/\.NS$/i, "");
  return REVERSE[bare] ?? bare;
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function parseSparkItem(item: {
  symbol?: string;
  response?: Array<{
    meta?: {
      regularMarketPrice?: number;
      chartPreviousClose?: number;
      previousClose?: number;
      regularMarketTime?: number;
    };
  }>;
}): { ticker: string; quote: LiveQuote } | null {
  const symbol = item.symbol;
  const meta = item.response?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  if (!symbol || !price || !Number.isFinite(price) || price <= 0) return null;
  const prev = meta?.chartPreviousClose || meta?.previousClose || price;
  const chg1d = prev > 0 ? ((price - prev) / prev) * 100 : 0;
  const asOf = (meta?.regularMarketTime ?? Math.floor(Date.now() / 1000)) * 1000;
  return {
    ticker: tickerFromYahoo(symbol),
    quote: {
      price: Math.round(price * 100) / 100,
      chg1d: Math.round(chg1d * 100) / 100,
      asOf,
    },
  };
}

async function fetchSparkChunk(tickers: string[]): Promise<Record<string, LiveQuote>> {
  const symbols = tickers.map(yahooSymbol).join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(symbols)}&range=5d&interval=1d`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Yahoo spark ${res.status}`);
  }
  const data = (await res.json()) as {
    spark?: { result?: Parameters<typeof parseSparkItem>[0][] };
  };
  const out: Record<string, LiveQuote> = {};
  for (const item of data.spark?.result ?? []) {
    const parsed = parseSparkItem(item);
    if (parsed) out[parsed.ticker] = parsed.quote;
  }
  return out;
}

export async function fetchNseQuotes(tickers: string[]): Promise<Record<string, LiveQuote>> {
  const unique = [...new Set(tickers)];
  const quotes: Record<string, LiveQuote> = {};
  for (const group of chunk(unique, 15)) {
    const part = await fetchSparkChunk(group);
    Object.assign(quotes, part);
  }
  return quotes;
}
