import type { CombineMode, FilterDef, Predicate, Stock } from "./types";
import {
  CORE_INVESTMENT_QUERY,
  DEFAULT_QUERY,
  VALUE_INCOME_QUERY,
  addPredicate,
  astHasPredicate,
  englishFromAst,
  evalPredicate,
  parseQuery,
  predToAst,
  prettyPrint,
  removePredicate,
  sqlFromAst,
} from "./query-lang";

function f(
  id: string,
  label: string,
  hint: string,
  sql: string,
  english: string,
  tint: FilterDef["tint"],
  predicate: Predicate,
): FilterDef {
  return {
    id,
    label,
    hint,
    sql,
    english,
    tint,
    predicate,
    test: (s: Stock) => evalPredicate(predicate, s),
  };
}

export const FILTERS: FilterDef[] = [
  f("excellent-profit", "Excellent Profitability", "ROE, ROCE, margins all high", "roe > 18 AND roce > 15 AND opm > 15 AND npm > 8", "excellent return ratios and margins", "mint", {
    all: [
      { field: "roe", op: ">", value: 18 },
      { field: "roce", op: ">", value: 15 },
      { field: "opm", op: ">", value: 15 },
      { field: "npm", op: ">", value: 8 },
    ],
  }),
  f("sensible-peg", "Sensible PEG", "PEG < 2", "peg < 2", "PEG below 2 — growth you are not overpaying for", "blue", {
    field: "peg",
    op: "<",
    value: 2,
  }),
  f("fortress-liq", "Fortress Liquidity", "Current > 1.2, Quick > 0.9", "current_ratio > 1.2 AND quick_ratio > 0.9", "current and quick ratios that pay the bills", "ink", {
    all: [
      { field: "currentRatio", op: ">", value: 1.2 },
      { field: "quickRatio", op: ">", value: 0.9 },
    ],
  }),
  f("clean-wc", "Clean Working Capital", "Receivable days < 70", "receivable_days < 70", "receivables collected inside 70 days", "peach", {
    field: "recvDays",
    op: "<",
    value: 70,
  }),
  f("high-roe", "High ROE Stocks", "ROE > 20%", "roe > 20", "return on equity above 20%", "ink", {
    field: "roe",
    op: ">",
    value: 20,
  }),
  f("low-debt", "Low Debt Stocks", "Debt/Equity < 0.5", "debt_equity < 0.5", "debt-to-equity below 0.5", "ink", {
    field: "debtToEquity",
    op: "<",
    value: 0.5,
  }),
  f("dividend", "Dividend Stars", "Dividend Yield > 2%", "dividend_yield > 2", "dividend yield above 2%", "gold", {
    field: "dividendYield",
    op: ">",
    value: 2,
  }),
  f("undervalued-pe", "Undervalued P/E", "P/E < 15", "pe < 15", "trading below 15× earnings", "blue", {
    field: "pe",
    op: "<",
    value: 15,
  }),
  f("high-opm", "High OPM Stocks", "OPM > 15%", "opm > 15", "operating margin above 15%", "peach", {
    field: "opm",
    op: ">",
    value: 15,
  }),
  f("growth", "Growth Champions", "Sales Growth > 15%", "sales_growth_1y > 15", "one-year sales growth above 15%", "peach", {
    field: "salesGrowth",
    op: ">",
    value: 15,
  }),
  f("cash-rich", "Cash Rich", "Positive FCF", "free_cash_flow > 0", "positive free cash flow", "mint", {
    field: "fcf",
    op: ">",
    value: 0,
  }),
  f("quality", "Quality Compounders", "Score > 70", "quality_score > 70", "quality score above 70", "ink", {
    field: "qualityScore",
    op: ">",
    value: 70,
  }),
  f("profit-growth", "Profit Growth Stars", "Profit Growth > 20%", "profit_growth_1y > 20", "one-year profit growth above 20%", "peach", {
    field: "profitGrowth",
    op: ">",
    value: 20,
  }),
  f("high-roce", "High ROCE Stocks", "ROCE > 20%", "roce > 20", "return on capital employed above 20%", "ink", {
    field: "roce",
    op: ">",
    value: 20,
  }),
  f("promoter", "Strong Promoter Holding", "Promoter > 50%", "promoter_holding > 50", "promoter holding above 50%", "ink", {
    field: "promoterHolding",
    op: ">",
    value: 50,
  }),
  f("pledged", "Low Pledged Stocks", "Pledged < 5%", "pledged_promoter < 5", "promoter pledge below 5%", "ink", {
    field: "pledged",
    op: "<",
    value: 5,
  }),
  f("interest", "High Interest Coverage", "Interest Coverage > 5", "interest_coverage > 5", "interest coverage above 5×", "blue", {
    field: "interestCoverage",
    op: ">",
    value: 5,
  }),
  f("lt-sales", "Long Term Sales Growth", "5Y Sales Growth > 15%", "sales_growth_5y > 15", "five-year sales CAGR above 15%", "peach", {
    field: "salesGrowth5y",
    op: ">",
    value: 15,
  }),
  f("eps", "EPS Growth Champions", "5Y EPS Growth > 20%", "eps_growth_5y > 20", "five-year EPS CAGR above 20%", "gold", {
    field: "epsGrowth5y",
    op: ">",
    value: 20,
  }),
  f("institutional", "Institutional Favorites", "FII + DII > 20%", "(fii + dii) > 20", "FII + DII ownership above 20%", "mint", {
    field: "institutional",
    op: ">",
    value: 20,
  }),
  f("best-quarter", "Best Quarter Results", "Strong Q-o-Q Growth", "qoq_sales > 8 AND qoq_profit > 12", "strong quarter-on-quarter growth", "mint", {
    all: [
      { field: "qoqSales", op: ">", value: 8 },
      { field: "qoqProfit", op: ">", value: 12 },
    ],
  }),
];

export const FILTER_MAP = Object.fromEntries(FILTERS.map((x) => [x.id, x]));

export const DEFAULT_SELECTED = ["excellent-profit", "sensible-peg", "fortress-liq"];

export const PRESETS: { id: string; label: string; hint: string; ids?: string[]; query?: string }[] = [
  {
    id: "wealth",
    label: "Wealth compounder",
    hint: "Excellent profits, fortress sheet, growth at a sensible PEG",
    query: DEFAULT_QUERY,
  },
  {
    id: "value-income",
    label: "Value income",
    hint: "Cheap, high-yield, high-margin names institutions already own",
    ids: ["dividend", "undervalued-pe", "high-opm", "institutional"],
    query: VALUE_INCOME_QUERY,
  },
  {
    id: "core",
    label: "Core investment",
    hint: "Size, quality, low leverage, yield, cheap PE, institutions",
    query: CORE_INVESTMENT_QUERY,
  },
  {
    id: "fortress",
    label: "Fortress sheet",
    hint: "Low leverage, high coverage, high ROE",
    ids: ["low-debt", "interest", "high-roe", "pledged"],
  },
  {
    id: "compounders",
    label: "Compounders",
    hint: "Quality score, long-term growth, aligned promoters",
    ids: ["quality", "lt-sales", "promoter", "cash-rich"],
  },
  {
    id: "garp",
    label: "Growth, still sane",
    hint: "Sales + EPS growth with a PE cap",
    ids: ["growth", "eps", "profit-growth", "undervalued-pe"],
  },
];

export function activeFilters(ids: string[]) {
  return ids.map((id) => FILTER_MAP[id]).filter(Boolean) as FilterDef[];
}

export function buildQuery(ids: string[], mode: CombineMode) {
  const filters = activeFilters(ids);
  if (filters.length === 0) return "";
  const ast = filters
    .map((x) => predToAst(x.predicate))
    .reduce((left, right) => ({ type: mode, left, right }));
  return prettyPrint(ast);
}

export function inferSelected(queryText: string): string[] {
  const parsed = parseQuery(queryText);
  if (!parsed.ok) return [];
  return FILTERS.filter((x) => astHasPredicate(parsed.ast, x.predicate)).map((x) => x.id);
}

export function toggleQuery(queryText: string, id: string, mode: CombineMode) {
  const filter = FILTER_MAP[id];
  if (!filter) return { queryText, selected: inferSelected(queryText) };
  const parsed = queryText.trim() ? parseQuery(queryText) : null;
  if (parsed && !parsed.ok) {
    const current = inferSelected(queryText);
    const nextIds = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    const q = buildQuery(nextIds, mode);
    return { queryText: q, selected: inferSelected(q) };
  }
  const ast = parsed && parsed.ok ? parsed.ast : null;
  const on = ast ? astHasPredicate(ast, filter.predicate) : false;
  const next = on
    ? ast
      ? removePredicate(ast, filter.predicate)
      : null
    : addPredicate(ast, filter.predicate, mode);
  const q = next ? prettyPrint(next) : "";
  return { queryText: q, selected: inferSelected(q) };
}

export function matchesStock(stock: Stock, ids: string[], mode: CombineMode) {
  const filters = activeFilters(ids);
  if (filters.length === 0) return true;
  return mode === "and"
    ? filters.every((x) => x.test(stock))
    : filters.some((x) => x.test(stock));
}

export function matchedFilterIds(stock: Stock, ids: string[]) {
  return activeFilters(ids)
    .filter((x) => x.test(stock))
    .map((x) => x.id);
}

export function buildSql(ids: string[], mode: CombineMode, queryText?: string) {
  if (queryText && queryText.trim()) {
    const parsed = parseQuery(queryText);
    if (parsed.ok) return sqlFromAst(parsed.ast);
  }
  const filters = activeFilters(ids);
  const joiner = mode === "and" ? "\n  AND " : "\n  OR ";
  const where = filters.length === 0 ? "TRUE" : filters.map((x) => x.sql).join(joiner);
  return `SELECT ticker, name, sector, pe, dividend_yield, opm, roe, quality_score
FROM nse_equities
WHERE ${where}
ORDER BY quality_score DESC;`;
}

export function buildEnglish(ids: string[], mode: CombineMode, queryText?: string) {
  if (queryText && queryText.trim()) {
    const parsed = parseQuery(queryText);
    if (parsed.ok) return englishFromAst(parsed.ast);
  }
  const filters = activeFilters(ids);
  if (filters.length === 0) {
    return "No screens applied — showing the full illustrative NSE universe.";
  }
  const parts = filters.map((x) => x.english);
  if (parts.length === 1) return `Find stocks with ${parts[0]}.`;
  const joinWord = mode === "and" ? "and" : "or";
  const head = parts.slice(0, -1).join(", ");
  return `Find stocks with ${head}, ${joinWord} ${parts[parts.length - 1]}.`;
}

export function applyPresetSpec(preset: (typeof PRESETS)[number], mode: CombineMode) {
  if (preset.query) {
    return { queryText: preset.query, selected: inferSelected(preset.query) };
  }
  const ids = preset.ids ?? [];
  return { queryText: buildQuery(ids, mode), selected: ids };
}
