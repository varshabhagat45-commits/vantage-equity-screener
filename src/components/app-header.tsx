import { Bookmark, RefreshCw, Search } from "lucide-react";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useScreener } from "@/lib/store";
import { formatIst, refreshMarket } from "@/lib/use-live-universe";
import { cn } from "@/lib/cn";

export function AppHeader() {
  const search = useScreener((s) => s.search);
  const setSearch = useScreener((s) => s.setSearch);
  const watch = useScreener((s) => s.watch);
  const watchOnly = useScreener((s) => s.watchOnly);
  const setWatchOnly = useScreener((s) => s.setWatchOnly);
  const marketStatus = useScreener((s) => s.marketStatus);
  const marketAsOf = useScreener((s) => s.marketAsOf);
  const marketCovered = useScreener((s) => s.marketCovered);
  const marketError = useScreener((s) => s.marketError);
  const loading = marketStatus === "loading" || marketStatus === "idle";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        document.getElementById("stock-search")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex size-8 items-center justify-center rounded-sm bg-accent text-accent-fg font-display text-sm font-semibold">
            V
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-tight">Vantage</span>
            <span className="block text-xs text-muted">Equity screener</span>
          </span>
        </a>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input id="stock-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticker or name  ·  /" className="pl-9" aria-label="Search stocks" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => void refreshMarket(true)} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs text-muted hover:text-fg disabled:opacity-60" title={marketError ?? "Refresh NSE last prices"}>
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            <span className="text-left leading-tight">
              <span className="block font-medium text-fg">{marketStatus === "live" ? "Live NSE" : loading ? "Updating" : "Snapshot"}</span>
              <span className="block tabular-nums">{loading ? "Fetching last prices" : marketStatus === "live" ? `${formatIst(marketAsOf)} IST · ${marketCovered}` : "Using last filed snapshot"}</span>
            </span>
          </button>
          <Button variant={watchOnly ? "secondary" : "outline"} size="sm" onClick={() => setWatchOnly(!watchOnly)} className={cn("shrink-0", watchOnly && "ring-1 ring-accent/20")}>
            <Bookmark className={cn("size-3.5", watchOnly && "fill-accent")} />
            Watchlist
            <span className="tabular-nums text-muted">{watch.length}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
