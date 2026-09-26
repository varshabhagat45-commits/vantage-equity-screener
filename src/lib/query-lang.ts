import type { CombineMode, CmpOp, FieldId, Predicate, Stock } from "./types";

export type Ast =
  | { type: "cmp"; field: FieldId; op: CmpOp; value: number }
  | { type: "and"; left: Ast; right: Ast }
  | { type: "or"; left: Ast; right: Ast };

export type ParseResult =
  | { ok: true; ast: Ast }
  | { ok: false; error: string };

type FieldMeta = {
  id: FieldId;
  label: string;
  sql: string;
  english: (op: CmpOp, value: number) => string;
  aliases: string[];
};

const OP_WORDS: Record<CmpOp, { above: string; below: string; eq: string }> = {
  ">": { above: "above", below: "above", eq: "equal to" },
  ">=": { above: "at least", below: "at least", eq: "equal to" },
  "<": { above: "below", below: "below", eq: "equal to" },
  "<=": { above: "at most", below: "at most", eq: "equal to" },
  "=": { above: "equal to", below: "equal to", eq: "equal to" },
};

function pctPhrase(label: string, op: CmpOp, value: number) {
  const word = op === ">" || op === ">=" ? OP_WORDS[op].above : OP_WORDS[op].below;
  if (op === "=") return `${label} of ${value}%`;
  return `${label} ${word} ${value}%`;
}

export const FIELDS: FieldMeta[] = [
  {
    id: "pe",
    label: "Price to Earning",
    sql: "pe",
    aliases: ["price to earnings", "price to earning", "p/e", "pe"],
    english: (op, v) =>
      op === "<" || op === "<="
        ? `trading ${OP_WORDS[op].below} ${v}× earnings`
        : `P/E ${OP_WORDS[op].above} ${v}`,
  },
  {
    id: "pb",
    label: "Price to book",
    sql: "pb",
    aliases: ["price to book", "p/b", "pb"],
    english: (op, v) => `price-to-book ${OP_WORDS[op].below} ${v}`,
  },
  {
    id: "marketCap",
    label: "Market Capitalization",
    sql: "market_cap",
    aliases: ["market capitalization", "market cap", "mcap"],
    english: (op, v) => `market cap ${OP_WORDS[op].above} ₹${v} Cr`,
  },
  {
    id: "dividendYield",
    label: "Dividend yield",
    sql: "dividend_yield",
    aliases: ["dividend yield", "div yield", "dividend_yield", "dividend"],
    english: (op, v) => pctPhrase("dividend yield", op, v),
  },
  {
    id: "roe",
    label: "Return on equity",
    sql: "roe",
    aliases: ["return on equity", "roe"],
    english: (op, v) => pctPhrase("return on equity", op, v),
  },
  {
    id: "roce",
    label: "ROCE",
    sql: "roce",
    aliases: ["return on capital employed", "roce"],
    english: (op, v) => pctPhrase("return on capital employed", op, v),
  },
  {
    id: "opm",
    label: "OPM",
    sql: "opm",
    aliases: ["operating profit margin", "operating margin", "opm"],
    english: (op, v) => pctPhrase("operating margin", op, v),
  },
  {
    id: "debtToEquity",
    label: "Debt to equity",
    sql: "debt_equity",
    aliases: ["debt to equity", "debt/equity", "debt_equity", "d/e"],
    english: (op, v) => `debt-to-equity ${OP_WORDS[op].below} ${v}`,
  },
  {
    id: "interestCoverage",
    label: "Interest Coverage",
    sql: "interest_coverage",
    aliases: ["interest coverage", "interest cover", "interest_coverage"],
    english: (op, v) => `interest coverage ${OP_WORDS[op].above} ${v}×`,
  },
  {
    id: "salesGrowth",
    label: "Sales growth",
    sql: "sales_growth_1y",
    aliases: ["sales growth 1y", "sales_growth_1y", "sales growth"],
    english: (op, v) => pctPhrase("one-year sales growth", op, v),
  },
  {
    id: "profitGrowth",
    label: "Profit growth",
    sql: "profit_growth_1y",
    aliases: ["profit growth 1y", "profit_growth_1y", "profit growth"],
    english: (op, v) => pctPhrase("one-year profit growth", op, v),
  },
  {
    id: "salesGrowth5y",
    label: "Sales growth 5Years",
    sql: "sales_growth_5y",
    aliases: ["sales growth 5years", "5y sales growth", "sales growth 5y", "sales_growth_5y"],
    english: (op, v) => pctPhrase("five-year sales CAGR", op, v),
  },
  {
    id: "epsGrowth5y",
    label: "EPS growth 5Years",
    sql: "eps_growth_5y",
    aliases: ["eps growth 5years", "5y eps growth", "eps growth 5y", "eps_growth_5y"],
    english: (op, v) => pctPhrase("five-year EPS CAGR", op, v),
  },
  {
    id: "promoterHolding",
    label: "Promoter holding",
    sql: "promoter_holding",
    aliases: ["promoter holding", "promoter_holding", "promoter"],
    english: (op, v) => pctPhrase("promoter holding", op, v),
  },
  {
    id: "pledged",
    label: "Pledged percentage",
    sql: "pledged_promoter",
    aliases: ["pledged percentage", "pledged promoter", "pledged_promoter", "pledged"],
    english: (op, v) => pctPhrase("promoter pledge", op, v),
  },
  {
    id: "institutional",
    label: "(FII + DII)",
    sql: "(fii + dii)",
    aliases: ["(fii + dii)", "fii + dii", "fii+dii", "institutional"],
    english: (op, v) => pctPhrase("FII + DII ownership", op, v),
  },
  {
    id: "fii",
    label: "FII",
    sql: "fii",
    aliases: ["fii"],
    english: (op, v) => pctPhrase("FII holding", op, v),
  },
  {
    id: "dii",
    label: "DII",
    sql: "dii",
    aliases: ["dii"],
    english: (op, v) => pctPhrase("DII holding", op, v),
  },
  {
    id: "qualityScore",
    label: "Quality score",
    sql: "quality_score",
    aliases: ["quality score", "quality_score", "quality"],
    english: (op, v) => `quality score ${OP_WORDS[op].above} ${v}`,
  },
  {
    id: "fcf",
    label: "Free cash flow",
    sql: "free_cash_flow",
    aliases: ["free cash flow", "free_cash_flow", "fcf"],
    english: (op, v) => (op === ">" && v === 0 ? "positive free cash flow" : `free cash flow ${OP_WORDS[op].above} ${v}`),
  },
  {
    id: "qoqSales",
    label: "QoQ sales",
    sql: "qoq_sales",
    aliases: ["qoq sales", "qoq_sales"],
    english: (op, v) => pctPhrase("quarter-on-quarter sales", op, v),
  },
  {
    id: "qoqProfit",
    label: "QoQ profit",
    sql: "qoq_profit",
    aliases: ["qoq profit", "qoq_profit"],
    english: (op, v) => pctPhrase("quarter-on-quarter profit", op, v),
  },
  {
    id: "price",
    label: "Price",
    sql: "price",
    aliases: ["current price", "price"],
    english: (op, v) => `price ${OP_WORDS[op].below} ₹${v}`,
  },
  {
    id: "peg",
    label: "PEG",
    sql: "peg",
    aliases: ["peg ratio", "peg"],
    english: (op, v) => `PEG ${OP_WORDS[op].below} ${v}`,
  },
  {
    id: "ps",
    label: "Price to sales",
    sql: "ps",
    aliases: ["price to sales", "p/s", "ps"],
    english: (op, v) => `price-to-sales ${OP_WORDS[op].below} ${v}`,
  },
  {
    id: "evEbitda",
    label: "EV/EBITDA",
    sql: "ev_ebitda",
    aliases: ["ev/ebitda", "ev ebitda", "evebitda"],
    english: (op, v) => `EV/EBITDA ${OP_WORDS[op].below} ${v}`,
  },
  {
    id: "gpm",
    label: "Gross margin",
    sql: "gpm",
    aliases: ["gross profit margin", "gross margin", "gpm"],
    english: (op, v) => pctPhrase("gross margin", op, v),
  },
  {
    id: "npm",
    label: "Net margin",
    sql: "npm",
    aliases: ["net profit margin", "net margin", "npm"],
    english: (op, v) => pctPhrase("net margin", op, v),
  },
  {
    id: "roa",
    label: "ROA",
    sql: "roa",
    aliases: ["return on assets", "roa"],
    english: (op, v) => pctPhrase("return on assets", op, v),
  },
  {
    id: "currentRatio",
    label: "Current ratio",
    sql: "current_ratio",
    aliases: ["current ratio", "current_ratio"],
    english: (op, v) => `current ratio ${OP_WORDS[op].above} ${v}`,
  },
  {
    id: "quickRatio",
    label: "Quick ratio",
    sql: "quick_ratio",
    aliases: ["quick ratio", "acid test", "quick_ratio"],
    english: (op, v) => `quick ratio ${OP_WORDS[op].above} ${v}`,
  },
  {
    id: "cashRatio",
    label: "Cash ratio",
    sql: "cash_ratio",
    aliases: ["cash ratio", "cash_ratio"],
    english: (op, v) => `cash ratio ${OP_WORDS[op].above} ${v}`,
  },
  {
    id: "ocfRatio",
    label: "Operating cash flow ratio",
    sql: "ocf_ratio",
    aliases: ["operating cash flow ratio", "ocf ratio", "ocf_ratio"],
    english: (op, v) => `operating cash flow ratio ${OP_WORDS[op].above} ${v}`,
  },
  {
    id: "assetTurnover",
    label: "Asset turnover",
    sql: "asset_turnover",
    aliases: ["fixed asset turnover", "asset turnover", "asset_turnover"],
    english: (op, v) => `asset turnover ${OP_WORDS[op].above} ${v}`,
  },
  {
    id: "inventoryTurnover",
    label: "Inventory turnover",
    sql: "inventory_turnover",
    aliases: ["inventory turnover", "inventory_turnover"],
    english: (op, v) => `inventory turnover ${OP_WORDS[op].above} ${v}`,
  },
  {
    id: "recvDays",
    label: "Receivable days",
    sql: "receivable_days",
    aliases: ["receivable days", "days sales outstanding", "dso"],
    english: (op, v) => `receivable days ${OP_WORDS[op].below} ${v}`,
  },
  {
    id: "debtRatio",
    label: "Debt ratio",
    sql: "debt_ratio",
    aliases: ["debt ratio", "debt_ratio"],
    english: (op, v) => `debt ratio ${OP_WORDS[op].below} ${v}`,
  },
  {
    id: "equityRatio",
    label: "Equity ratio",
    sql: "equity_ratio",
    aliases: ["equity ratio", "equity_ratio"],
    english: (op, v) => `equity ratio ${OP_WORDS[op].above} ${v}`,
  },
  {
    id: "assetGrowth",
    label: "Asset growth",
    sql: "asset_growth",
    aliases: ["asset growth rate", "asset growth"],
    english: (op, v) => pctPhrase("asset growth", op, v),
  },
  {
    id: "excellenceScore",
    label: "Excellence score",
    sql: "excellence_score",
    aliases: ["excellence score", "wealth score", "excellence"],
    english: (op, v) => `excellence score ${OP_WORDS[op].above} ${v}`,
  },
];

const FIELD_BY_ID = Object.fromEntries(FIELDS.map((f) => [f.id, f])) as Record<FieldId, FieldMeta>;

const ALIASES = FIELDS.flatMap((f) =>
  f.aliases.map((alias) => ({
    alias,
    field: f.id,
    re: new RegExp("^" + alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\?\s+/g, "\\s+") + "(?![a-z0-9])", "i"),
  })),
).sort((a, b) => b.alias.length - a.alias.length);

type Tok =
  | { t: "field"; field: FieldId }
  | { t: "op"; op: CmpOp }
  | { t: "num"; n: number }
  | { t: "and" }
  | { t: "or" }
  | { t: "lp" }
  | { t: "rp" };

function tokenize(input: string): { tokens: Tok[]; error?: string } {
  const tokens: Tok[] = [];
  let i = 0;
  const n = input.length;

  const skip = () => {
    while (i < n && /[\s,]+/.test(input[i] ?? "")) {
      // commas are skippable separators; AND is implied later if missing
      i += 1;
    }
  };

  while (i < n) {
    skip();
    if (i >= n) break;

    const rest = input.slice(i);
    const lower = rest.toLowerCase();

    let matched = false;
    for (const a of ALIASES) {
      const m = lower.match(a.re);
      if (m) {
        tokens.push({ t: "field", field: a.field });
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    if (/^and\b/i.test(rest)) {
      tokens.push({ t: "and" });
      i += 3;
      continue;
    }
    if (/^or\b/i.test(rest)) {
      tokens.push({ t: "or" });
      i += 2;
      continue;
    }

    if (rest.startsWith(">=")) {
      tokens.push({ t: "op", op: ">=" });
      i += 2;
      continue;
    }
    if (rest.startsWith("<=")) {
      tokens.push({ t: "op", op: "<=" });
      i += 2;
      continue;
    }
    if (rest.startsWith(">")) {
      tokens.push({ t: "op", op: ">" });
      i += 1;
      continue;
    }
    if (rest.startsWith("<")) {
      tokens.push({ t: "op", op: "<" });
      i += 1;
      continue;
    }
    if (rest.startsWith("=") || rest.startsWith("==")) {
      tokens.push({ t: "op", op: "=" });
      i += rest.startsWith("==") ? 2 : 1;
      continue;
    }

    const num = rest.match(/^[-+]?\d+(\.\d+)?/);
    if (num) {
      tokens.push({ t: "num", n: Number(num[0]) });
      i += num[0].length;
      continue;
    }

    if (rest[0] === "(") {
      tokens.push({ t: "lp" });
      i += 1;
      continue;
    }
    if (rest[0] === ")") {
      tokens.push({ t: "rp" });
      i += 1;
      continue;
    }

    const bad = rest.match(/^\S+/)?.[0] ?? rest[0];
    return {
      tokens,
      error: `Don't recognize “${bad}”. Try PE, PEG, ROE, ROA, OPM, Current ratio, Debt to equity.`,
    };
  }

  return { tokens };
}

export function parseQuery(input: string): ParseResult {
  const text = input.trim();
  if (!text) return { ok: false, error: "empty" };

  const { tokens, error } = tokenize(text);
  if (error) return { ok: false, error };

  let p = 0;
  const peek = () => tokens[p];
  const take = () => tokens[p++];

  function comparison(): Ast {
    const fieldTok = take();
    if (!fieldTok || fieldTok.t !== "field") {
      throw new Error("Expected a field (PE, ROE, Dividend yield…)");
    }
    const opTok = take();
    if (!opTok || opTok.t !== "op") {
      throw new Error(`Expected >, <, >=, or <= after ${FIELD_BY_ID[fieldTok.field].label}`);
    }
    const numTok = take();
    if (!numTok || numTok.t !== "num") {
      throw new Error(`Expected a number after ${FIELD_BY_ID[fieldTok.field].label} ${opTok.op}`);
    }
    return { type: "cmp", field: fieldTok.field, op: opTok.op, value: numTok.n };
  }

  function primary(): Ast {
    if (peek()?.t === "lp") {
      take();
      // Could be (FII + DII) already consumed as a field — leftover lp is grouping
      const inner = orExpr();
      if (peek()?.t !== "rp") throw new Error("Missing closing parenthesis");
      take();
      return inner;
    }
    return comparison();
  }

  function andExpr(): Ast {
    let left = primary();
    while (true) {
      const t = peek();
      if (t?.t === "and") {
        take();
        left = { type: "and", left, right: primary() };
        continue;
      }
      // Implicit AND: field or '(' follows a complete comparison
      if (t?.t === "field" || t?.t === "lp") {
        left = { type: "and", left, right: primary() };
        continue;
      }
      break;
    }
    return left;
  }

  function orExpr(): Ast {
    let left = andExpr();
    while (peek()?.t === "or") {
      take();
      left = { type: "or", left, right: andExpr() };
    }
    return left;
  }

  try {
    const ast = orExpr();
    if (p !== tokens.length) {
      return { ok: false, error: "Extra text after the query. Join clauses with AND or OR." };
    }
    return { ok: true, ast };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not parse query" };
  }
}

export function getField(stock: Stock, field: FieldId): number {
  if (field === "pe") return stock.pe > 0 ? stock.pe : Number.POSITIVE_INFINITY;
  if (field === "fcf") return stock.fcfPositive ? 1 : 0;
  if (field === "institutional") return stock.fii + stock.dii;
  const v = stock[field as keyof Stock];
  return typeof v === "number" ? v : Number.NaN;
}

export function evalCmp(a: number, op: CmpOp, b: number) {
  switch (op) {
    case ">":
      return a > b;
    case "<":
      return a < b;
    case ">=":
      return a >= b;
    case "<=":
      return a <= b;
    case "=":
      return Math.abs(a - b) < 1e-9;
  }
}

export function evalAst(ast: Ast, stock: Stock): boolean {
  if (ast.type === "cmp") return evalCmp(getField(stock, ast.field), ast.op, ast.value);
  if (ast.type === "and") return evalAst(ast.left, stock) && evalAst(ast.right, stock);
  return evalAst(ast.left, stock) || evalAst(ast.right, stock);
}

export function evalPredicate(pred: Predicate, stock: Stock): boolean {
  if ("all" in pred) return pred.all.every((p) => evalPredicate(p, stock));
  return evalCmp(getField(stock, pred.field), pred.op, pred.value);
}

export function predToAst(pred: Predicate): Ast {
  if ("all" in pred) {
    return pred.all.map(predToAst).reduce((left, right) => ({ type: "and", left, right }));
  }
  return { type: "cmp", field: pred.field, op: pred.op, value: pred.value };
}

function sameFieldOp(a: { field: FieldId; op: CmpOp }, b: { field: FieldId; op: CmpOp }) {
  return a.field === b.field && a.op === b.op;
}

function isAtLeastAsStrict(query: { field: FieldId; op: CmpOp; value: number }, filter: { field: FieldId; op: CmpOp; value: number }) {
  if (!sameFieldOp(query, filter)) return false;
  if (query.op === ">" || query.op === ">=") return query.value >= filter.value;
  if (query.op === "<" || query.op === "<=") return query.value <= filter.value;
  return Math.abs(query.value - filter.value) < 1e-9;
}

function flatten(ast: Ast, kind: "and" | "or"): Ast[] {
  if (ast.type === kind) return [...flatten(ast.left, kind), ...flatten(ast.right, kind)];
  return [ast];
}

function collectCmps(ast: Ast): Extract<Ast, { type: "cmp" }>[] {
  if (ast.type === "cmp") return [ast];
  return [...collectCmps(ast.left), ...collectCmps(ast.right)];
}

export function astHasPredicate(ast: Ast, pred: Predicate): boolean {
  if ("all" in pred) return pred.all.every((p) => astHasPredicate(ast, p));
  return collectCmps(ast).some((c) => isAtLeastAsStrict(c, pred));
}

export function removePredicate(ast: Ast, pred: Predicate): Ast | null {
  if ("all" in pred) {
    let cur: Ast | null = ast;
    for (const p of pred.all) {
      if (!cur) return null;
      cur = removePredicate(cur, p);
    }
    return cur;
  }
  if (ast.type === "cmp") return sameFieldOp(ast, pred) ? null : ast;
  const left = removePredicate(ast.left, pred);
  const right = removePredicate(ast.right, pred);
  if (!left) return right;
  if (!right) return left;
  return { type: ast.type, left, right };
}

export function addPredicate(ast: Ast | null, pred: Predicate, mode: CombineMode): Ast {
  const piece = predToAst(pred);
  if (!ast) return piece;
  return { type: mode, left: ast, right: piece };
}

function formatValue(n: number) {
  if (Number.isInteger(n)) return String(n);
  const t = n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return t;
}

export function prettyPrint(ast: Ast): string {
  const mix = containsMix(ast);
  return print(ast, mix, ast.type === "or" ? "or" : "and");
}

function containsMix(ast: Ast): boolean {
  if (ast.type === "cmp") return false;
  const kinds = new Set<string>();
  const walk = (n: Ast) => {
    if (n.type === "cmp") return;
    kinds.add(n.type);
    walk(n.left);
    walk(n.right);
  };
  walk(ast);
  return kinds.has("and") && kinds.has("or");
}

function print(ast: Ast, mix: boolean, parent: "and" | "or" | "root"): string {
  if (ast.type === "cmp") {
    const label = FIELD_BY_ID[ast.field].label;
    return `${label} ${ast.op} ${formatValue(ast.value)}`;
  }
  const joiner = ast.type === "and" ? " AND\n" : " OR\n";
  const parts = flatten(ast, ast.type).map((n) => {
    const inner = print(n, mix, ast.type);
    if (mix && n.type !== "cmp" && n.type !== ast.type) return `(${inner.replace(/\n/g, " ")})`;
    return inner;
  });
  const body = parts.join(joiner);
  if (mix && parent !== "root" && parent !== ast.type) return `(${body.replace(/\n/g, " ")})`;
  return body;
}

export function sqlFromAst(ast: Ast): string {
  const where = sqlExpr(ast);
  return `SELECT ticker, name, sector, pe, dividend_yield, opm, roe, quality_score
FROM nse_equities
WHERE ${where}
ORDER BY quality_score DESC;`;
}

function sqlExpr(ast: Ast): string {
  if (ast.type === "cmp") {
    const col = FIELD_BY_ID[ast.field].sql;
    const cmp = `${col} ${ast.op} ${formatValue(ast.value)}`;
    if (ast.field === "pe" && (ast.op === "<" || ast.op === "<=")) {
      return `(pe > 0 AND ${cmp})`;
    }
    return cmp;
  }
  const op = ast.type === "and" ? "AND" : "OR";
  const parts = flatten(ast, ast.type).map((n) => {
    const inner = sqlExpr(n);
    return n.type !== "cmp" && n.type !== ast.type ? `(${inner})` : inner;
  });
  return parts.join(`\n  ${op} `);
}

export function englishFromAst(ast: Ast): string {
  const parts = flattenTop(ast);
  if (parts.length === 0) return "No screens applied — showing the full illustrative NSE universe.";
  if (parts.length === 1) return `Find stocks with ${parts[0].text}.`;
  const joinWord = parts.every((p) => p.op === "and") ? "and" : parts.every((p) => p.op === "or") ? "or" : "and";
  const head = parts.slice(0, -1).map((p) => p.text).join(", ");
  return `Find stocks with ${head}, ${joinWord} ${parts[parts.length - 1]?.text}.`;
}

function flattenTop(ast: Ast): { text: string; op: "and" | "or" }[] {
  if (ast.type === "cmp") {
    return [{ text: FIELD_BY_ID[ast.field].english(ast.op, ast.value), op: "and" }];
  }
  return flatten(ast, ast.type).flatMap((n) => {
    if (n.type === "cmp") {
      return [{ text: FIELD_BY_ID[n.field].english(n.op, n.value), op: ast.type }];
    }
    return [{ text: englishFromAst(n).replace(/^Find stocks with /, "").replace(/\.$/, ""), op: ast.type }];
  });
}

export const DEFAULT_QUERY = `Return on equity > 18 AND
ROCE > 15 AND
OPM > 15 AND
Net margin > 8 AND
Debt to equity < 0.5 AND
Interest Coverage > 5 AND
Current ratio > 1.2 AND
PEG < 2 AND
EPS growth 5Years > 10 AND
Excellence score > 72`;

export const CORE_INVESTMENT_QUERY = `Market Capitalization > 500 AND
Return on equity > 15 AND
Debt to equity < 0.5 AND
Interest Coverage > 5 AND
Dividend yield > 2 AND
Price to Earning < 15 AND
OPM > 15 AND
Pledged percentage < 5 AND
(FII + DII) > 20`;

export const VALUE_INCOME_QUERY = `Dividend yield > 2 AND
Price to Earning < 15 AND
OPM > 15 AND
(FII + DII) > 20`;
