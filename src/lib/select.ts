import { matchesStock } from "./filters";
import { evalAst, parseQuery } from "./query-lang";
import { STOCKS } from "./stocks";
import type { SortKey } from "./store";
import type { CombineMode, Stock, Universe } from "./types";

export function selectStocks(opts: {
  selected: string[];
  mode: CombineMode;
  queryText: string;
  universe: Universe | "all";
  sector: string | "all";
  search: string;
  watch: string[];
  watchOnly: boolean;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  stocks?: Stock[];
}): { rows: Stock[]; universeSize: number } {
  const list = opts.stocks ?? STOCKS;
  const q = opts.search.trim().toLowerCase();
  const scoped = list.filter((s) => {
    if (opts.universe !== "all" && s.universe !== opts.universe) return false;
    if (opts.sector !== "all" && s.sector !== opts.sector) return false;
    return true;
  });
  const searched = scoped.filter((s) => {
    if (!q) return true;
    return s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
  });
  const watched = opts.watchOnly
    ? searched.filter((s) => opts.watch.includes(s.ticker))
    : searched;

  const parsed = opts.queryText.trim() ? parseQuery(opts.queryText) : null;
  const filtered = watched.filter((s) => {
    if (!opts.queryText.trim()) return true;
    if (parsed && parsed.ok) return evalAst(parsed.ast, s);
    return matchesStock(s, opts.selected, opts.mode);
  });

  const dir = opts.sortDir === "asc" ? 1 : -1;
  const rows = [...filtered].sort((a, b) => {
    const av = a[opts.sortKey];
    const bv = b[opts.sortKey];
    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * dir;
    }
    return ((av as number) - (bv as number)) * dir;
  });
  return { rows, universeSize: watched.length };
}
