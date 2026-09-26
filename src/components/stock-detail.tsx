import * as Dialog from "@radix-ui/react-dialog";
import { Bookmark, X } from "lucide-react";
import { RatioPillars, ValuationGrid, VerdictBanner } from "@/components/scorecard";
import { Button } from "@/components/ui/button";
import { crore, inrPrice, pct, signedPct } from "@/lib/format";
import type { Stock } from "@/lib/types";
import { useScreener } from "@/lib/store";
import { cn } from "@/lib/cn";

export function StockDetail({ stocks }: { stocks: Stock[] }) {
  const ticker = useScreener((s) => s.activeTicker);
  const setActive = useScreener((s) => s.setActive);
  const watch = useScreener((s) => s.watch);
  const toggleWatch = useScreener((s) => s.toggleWatch);
  const stock = stocks.find((s) => s.ticker === ticker) ?? null;
  const saved = stock ? watch.includes(stock.ticker) : false;

  return (
    <Dialog.Root open={!!stock} onOpenChange={(open) => !open && setActive(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-fg/30 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-xl border border-border bg-surface p-5 shadow-lift",
            "sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-full sm:max-w-xl sm:rounded-none sm:border-y-0 sm:border-r-0",
            "focus:outline-none",
          )}
        >
          {stock ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Dialog.Title className="font-display text-xl font-semibold tracking-tight">
                    {stock.name}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-muted">
                    {stock.ticker} · {stock.sector} · {stock.universe} cap
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Close">
                    <X />
                  </Button>
                </Dialog.Close>
              </div>

              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <p className="font-display text-3xl font-semibold tabular-nums tracking-tight">
                    {inrPrice(stock.price)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm tabular-nums",
                      stock.chg1d >= 0 ? "text-up" : "text-down",
                    )}
                  >
                    {signedPct(stock.chg1d)} today
                  </p>
                </div>
                <Button
                  variant={saved ? "secondary" : "outline"}
                  onClick={() => toggleWatch(stock.ticker)}
                >
                  <Bookmark className={cn(saved && "fill-accent")} />
                  {saved ? "Watching" : "Watch"}
                </Button>
              </div>

              <div className="mt-5">
                <VerdictBanner stock={stock} />
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label="Market cap" value={crore(stock.marketCap)} />
                <Stat label="P/E" value={stock.pe.toFixed(1)} />
                <Stat label="PEG" value={stock.peg > 0 ? stock.peg.toFixed(2) : "—"} />
                <Stat label="Div. yield" value={pct(stock.dividendYield)} />
              </dl>

              <h3 className="mt-7 font-display text-sm font-semibold">Valuation vs peers</h3>
              <p className="mt-0.5 text-xs text-muted">
                Cheap versus the industry is not the same as cheap versus history. PEG keeps you honest.
              </p>
              <div className="mt-3">
                <ValuationGrid stock={stock} />
              </div>

              <div className="mt-7">
                <RatioPillars stock={stock} />
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-bg px-3 py-2.5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
    </div>
  );
}
