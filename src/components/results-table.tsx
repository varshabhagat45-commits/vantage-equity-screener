import { Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { GradeMark } from "@/components/scorecard";
import type { Stock } from "@/lib/types";
import { crore, inrPrice, pct, signedPct } from "@/lib/format";
import { decision } from "@/lib/ratios";
import { useScreener, type SortKey } from "@/lib/store";
import { cn } from "@/lib/cn";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Company" },
  { key: "marketCap", label: "Mcap", align: "right" },
  { key: "pe", label: "P/E", align: "right" },
  { key: "peg", label: "PEG", align: "right" },
  { key: "roe", label: "ROE", align: "right" },
  { key: "excellenceScore", label: "Excel.", align: "right" },
];

export function ResultsTable({ rows }: { rows: Stock[] }) {
  const sortKey = useScreener((s) => s.sortKey);
  const sortDir = useScreener((s) => s.sortDir);
  const setSort = useScreener((s) => s.setSort);
  const watch = useScreener((s) => s.watch);
  const toggleWatch = useScreener((s) => s.toggleWatch);
  const setActive = useScreener((s) => s.setActive);

  const compounds = rows.filter((s) => decision(s).verdict === "compound").length;

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center shadow-card">
        <p className="font-display text-base font-semibold">No names pass this query</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Wealth screens are strict on purpose. Drop PEG or current ratio, or open Value income if you
          want yield instead of compounding quality.
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <p className="text-sm text-muted">
          <span className="font-medium text-fg">{compounds}</span> look like compounders in this list.
          Open a row for the full ratio card.
        </p>
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle/60 text-left text-xs text-muted">
              <th className="w-10 px-2 py-3" />
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-2 py-3 font-medium", col.align === "right" && "text-right")}
                >
                  <button
                    type="button"
                    onClick={() => setSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-fg"
                  >
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="size-3" />
                      ) : (
                        <ChevronDown className="size-3" />
                      )
                    ) : null}
                  </button>
                </th>
              ))}
              <th className="px-2 py-3 text-right font-medium">Call</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((stock) => {
              const saved = watch.includes(stock.ticker);
              return (
                <tr
                  key={stock.ticker}
                  onClick={() => setActive(stock.ticker)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-bg-subtle/50"
                >
                  <td className="px-2 py-2.5">
                    <button
                      type="button"
                      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatch(stock.ticker);
                      }}
                      className="flex size-10 items-center justify-center rounded-md text-subtle hover:bg-bg-subtle hover:text-accent"
                    >
                      <Bookmark className={cn("size-4", saved && "fill-accent text-accent")} />
                    </button>
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="shrink-0 font-medium">{stock.ticker}</span>
                      <span className="truncate text-muted">{stock.name}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-subtle">
                      <span>{stock.sector}</span>
                      <span className="tabular-nums">{inrPrice(stock.price)}</span>
                      <span
                        className={cn(
                          "tabular-nums",
                          stock.chg1d >= 0 ? "text-up" : "text-down",
                        )}
                      >
                        {signedPct(stock.chg1d)}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{crore(stock.marketCap)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{stock.pe.toFixed(1)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">
                    {stock.peg > 0 ? stock.peg.toFixed(2) : "—"}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{pct(stock.roe)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums font-medium">
                    {stock.excellenceScore}
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <GradeMark stock={stock} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {rows.map((stock) => {
          const saved = watch.includes(stock.ticker);
          return (
            <div key={stock.ticker} className="flex items-start gap-1 px-2 py-2">
              <button
                type="button"
                aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
                onClick={() => toggleWatch(stock.ticker)}
                className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-md text-subtle"
              >
                <Bookmark className={cn("size-4", saved && "fill-accent text-accent")} />
              </button>
              <button
                type="button"
                onClick={() => setActive(stock.ticker)}
                className="min-w-0 flex-1 px-2 py-1.5 text-left"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium">{stock.name}</span>
                  <GradeMark stock={stock} />
                </span>
                <span className="mt-0.5 flex items-center justify-between text-xs text-muted">
                  <span>
                    {stock.ticker} · {stock.sector}
                  </span>
                  <span
                    className={cn(
                      "tabular-nums",
                      stock.chg1d >= 0 ? "text-up" : "text-down",
                    )}
                  >
                    {signedPct(stock.chg1d)}
                  </span>
                </span>
                <span className="mt-2 grid grid-cols-4 gap-2 text-xs">
                  <Metric label="P/E" value={stock.pe.toFixed(1)} />
                  <Metric label="PEG" value={stock.peg > 0 ? stock.peg.toFixed(2) : "—"} />
                  <Metric label="ROE" value={pct(stock.roe, 0)} />
                  <Metric label="Excel." value={String(stock.excellenceScore)} />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="block text-subtle">{label}</span>
      <span className="tabular-nums text-fg">{value}</span>
    </span>
  );
}
