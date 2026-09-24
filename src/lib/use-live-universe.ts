import { useEffect, useMemo } from "react";
import { applyLiveQuotes } from "./apply-quotes";
import { getMarketQuotes } from "./market";
import { STOCKS } from "./stocks";
import { useScreener } from "./store";
import type { Stock } from "./types";

async function loadQuotes(force: boolean) {
  const { setMarketLoading, setMarket } = useScreener.getState();
  setMarketLoading();
  try {
    const snap = await getMarketQuotes({ data: { force } });
    setMarket(snap);
  } catch (err) {
    setMarket({
      quotes: {},
      asOf: null,
      fetchedAt: Date.now(),
      covered: 0,
      source: "snapshot",
      error: err instanceof Error ? err.message : "Price feed unavailable",
    });
  }
}

export function refreshMarket(force = true) {
  return loadQuotes(force);
}

export function useLiveUniverse(): Stock[] {
  const quotes = useScreener((s) => s.quotes);
  const status = useScreener((s) => s.marketStatus);

  useEffect(() => {
    if (status === "idle") void loadQuotes(false);
  }, [status]);

  return useMemo(() => applyLiveQuotes(quotes, STOCKS), [quotes]);
}

export function formatIst(ms: number | null) {
  if (!ms) return "awaiting first print";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}
