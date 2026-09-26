import { createServerFn } from "@tanstack/react-start";
import { STOCKS } from "./stocks";

export type MarketSnapshot = {
  quotes: Record<string, { price: number; chg1d: number }>;
  asOf: number | null;
  fetchedAt: number;
  covered: number;
  universe: number;
  source: "yahoo" | "snapshot";
  error?: string;
};

type Cache = {
  snapshot: MarketSnapshot;
  storedAt: number;
};

const TTL_MS = 15 * 60 * 1000;
let cache: Cache | null = null;

function emptySnapshot(): MarketSnapshot {
  return {
    quotes: {},
    asOf: null,
    fetchedAt: Date.now(),
    covered: 0,
    universe: STOCKS.length,
    source: "snapshot",
  };
}

export const getMarketQuotes = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = (input ?? {}) as { force?: boolean };
    return { force: Boolean(data.force) };
  })
  .handler(async ({ data }): Promise<MarketSnapshot> => {
    const now = Date.now();
    if (!data.force && cache && now - cache.storedAt < TTL_MS) {
      return cache.snapshot;
    }
    try {
      const { fetchNseQuotes } = await import("./yahoo.server");
      const quotes = await fetchNseQuotes(STOCKS.map((s) => s.ticker));
      const times = Object.values(quotes).map((q) => q.asOf);
      const snapshot: MarketSnapshot = {
        quotes: Object.fromEntries(
          Object.entries(quotes).map(([ticker, q]) => [ticker, { price: q.price, chg1d: q.chg1d }]),
        ),
        asOf: times.length ? Math.max(...times) : now,
        fetchedAt: now,
        covered: Object.keys(quotes).length,
        universe: STOCKS.length,
        source: Object.keys(quotes).length ? "yahoo" : "snapshot",
      };
      cache = { snapshot, storedAt: now };
      return snapshot;
    } catch (err) {
      const fallback = cache?.snapshot ?? emptySnapshot();
      return {
        ...fallback,
        fetchedAt: now,
        error: err instanceof Error ? err.message : "Price feed unavailable",
      };
    }
  });
