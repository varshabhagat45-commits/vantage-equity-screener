import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { QuickFilters } from "@/components/quick-filters";
import { QueryPanel } from "@/components/query-panel";
import { ResultsTable } from "@/components/results-table";
import { StockDetail } from "@/components/stock-detail";
import { UniverseBar } from "@/components/universe-bar";
import { selectStocks } from "@/lib/select";
import { useScreener } from "@/lib/store";
import { useLiveUniverse } from "@/lib/use-live-universe";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const selected = useScreener((s) => s.selected);
  const queryText = useScreener((s) => s.queryText);
  const mode = useScreener((s) => s.mode);
  const universe = useScreener((s) => s.universe);
  const sector = useScreener((s) => s.sector);
  const search = useScreener((s) => s.search);
  const watch = useScreener((s) => s.watch);
  const watchOnly = useScreener((s) => s.watchOnly);
  const sortKey = useScreener((s) => s.sortKey);
  const sortDir = useScreener((s) => s.sortDir);
  const stocks = useLiveUniverse();

  const { rows, universeSize } = selectStocks({
    selected,
    mode,
    queryText,
    universe,
    sector,
    search,
    watch,
    watchOnly,
    sortKey,
    sortDir,
    stocks,
  });

  return (
    <div className="min-h-dvh bg-bg">
      <AppHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            NSE last prices · refreshed through the day
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Buy excellent businesses. Pay a sane price.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            The wealth screen grades profitability, growth, leverage, liquidity, and PEG — then
            keeps names that can compound. Last prices update from the exchange feed; ratios
            scale with price until the next filing. Not advice.
          </p>
        </div>
        <QuickFilters stocks={stocks} />
        <QueryPanel matchCount={rows.length} universeSize={universeSize} />
        <UniverseBar />
        <ResultsTable rows={rows} />
      </main>
      <StockDetail stocks={stocks} />
    </div>
  );
}
