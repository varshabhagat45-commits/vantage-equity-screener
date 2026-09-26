import type {
  CoreStock,
  DerivedRatios,
  Grade,
  PillarId,
  Stock,
  Universe,
  ValueLabel,
  Verdict,
} from "./types";

function r(n: number, d = 1) {
  if (!Number.isFinite(n)) return 0;
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

export function isFinancial(stock: { sector: string }) {
  return stock.sector === "Banking" || stock.sector === "NBFC";
}

const LIGHT = new Set(["IT", "FMCG", "Consumer", "Pharma"]);
const HEAVY = new Set(["Metals", "Infra", "Power", "Cement", "Oil & Gas", "Energy", "Capital Goods"]);
const WORKING = new Set(["FMCG", "Consumer", "Retail", "Consumer Durables", "Auto"]);

export const SECTOR_MEDIAN: Record<string, { pe: number; pb: number; ps: number }> = {
  IT: { pe: 28, pb: 7.2, ps: 5.4 },
  FMCG: { pe: 52, pb: 11.4, ps: 7.8 },
  Consumer: { pe: 48, pb: 10.2, ps: 6.6 },
  "Consumer Durables": { pe: 58, pb: 9.4, ps: 4.8 },
  Retail: { pe: 86, pb: 16, ps: 5.2 },
  Banking: { pe: 16, pb: 2.4, ps: 0 },
  NBFC: { pe: 18, pb: 3.2, ps: 0 },
  Metals: { pe: 12, pb: 2.2, ps: 1.6 },
  "Oil & Gas": { pe: 14, pb: 1.8, ps: 1.4 },
  Energy: { pe: 22, pb: 2.4, ps: 2.2 },
  Power: { pe: 18, pb: 2.6, ps: 2.8 },
  Pharma: { pe: 34, pb: 6.2, ps: 5.6 },
  Auto: { pe: 28, pb: 5.4, ps: 2.8 },
  "Capital Goods": { pe: 52, pb: 10.8, ps: 5.8 },
  Defence: { pe: 42, pb: 9.6, ps: 6.4 },
  Cement: { pe: 38, pb: 4.6, ps: 3.8 },
  Infra: { pe: 28, pb: 4.4, ps: 4.2 },
  Telecom: { pe: 42, pb: 7.2, ps: 4.6 },
  Chemicals: { pe: 36, pb: 6.8, ps: 4.8 },
  Industrials: { pe: 42, pb: 8.4, ps: 4.2 },
};

export const UNIVERSE_MEDIAN: Record<Universe, { pe: number; pb: number; ps: number }> = {
  large: { pe: 24, pb: 4.2, ps: 3.8 },
  mid: { pe: 32, pb: 5.4, ps: 4.4 },
  small: { pe: 36, pb: 6.1, ps: 5.2 },
};

function derive(raw: CoreStock): DerivedRatios {
  const fin = isFinancial(raw);
  const de = Math.max(0, raw.debtToEquity);
  const equityRatio = fin ? 0 : r(1 / (1 + de), 2);
  const debtRatio = fin ? 0 : r(1 - equityRatio, 2);
  const npm = fin ? 0 : raw.opm > 0 ? r(Math.max(2, raw.opm * 0.58), 1) : 0;
  const gpm = fin ? 0 : raw.opm > 0 ? r(Math.min(78, raw.opm + (LIGHT.has(raw.sector) ? 22 : 14)), 1) : 0;
  const ps = !fin && npm > 0 && raw.pe > 0 ? r((raw.pe * npm) / 100, 2) : 0;
  const peg = raw.pe > 0 && raw.epsGrowth5y > 1 ? r(raw.pe / raw.epsGrowth5y, 2) : raw.pe > 0 ? 9 : 0;
  const evEbitda = fin || raw.pe <= 0 ? 0 : r(raw.pe * (0.52 + de * 0.18), 2);
  const roa = fin ? r(raw.roe * 0.12, 1) : r(raw.roe * equityRatio, 1);
  const q = raw.qualityScore / 100;
  const currentRatio = fin ? 0 : r(Math.max(0.6, 0.9 + q * 2.1 - de * 0.55), 2);
  const quickRatio = fin ? 0 : r(Math.max(0.3, currentRatio - (WORKING.has(raw.sector) ? 0.55 : 0.22)), 2);
  const cashRatio = fin ? 0 : r(Math.max(0.1, quickRatio * (raw.fcfPositive ? 0.55 : 0.28)), 2);
  const ocfRatio = fin ? 0 : r(Math.max(0.15, 0.35 + q * 0.9 - de * 0.2), 2);
  const assetTurnover = fin ? 0 : r(LIGHT.has(raw.sector) ? 0.7 + q * 0.5 : HEAVY.has(raw.sector) ? 0.45 + q * 0.25 : WORKING.has(raw.sector) ? 1.1 + q * 0.4 : 0.85, 2);
  const inventoryTurnover = fin || raw.sector === "IT" || raw.sector === "Power" ? 0 : r(WORKING.has(raw.sector) ? 3.2 + q * 2 : HEAVY.has(raw.sector) ? 5 + q * 3 : 6 + q * 4, 1);
  const recvDays = fin ? 0 : r(raw.sector === "IT" ? 68 - q * 10 : WORKING.has(raw.sector) ? 42 + (1 - q) * 38 : HEAVY.has(raw.sector) ? 55 + (1 - q) * 30 : 48, 0);
  const recvTurnover = recvDays > 0 ? r(365 / recvDays, 1) : 0;
  const dsi = inventoryTurnover > 0 ? r(365 / inventoryTurnover, 0) : 0;
  const capitalTurnover = fin ? 0 : r(assetTurnover * (1 + de * 0.3), 2);
  const payout = raw.roe > 0 ? Math.min(0.85, (raw.dividendYield / Math.max(raw.roe, 1)) * raw.pb) : 0.3;
  const dividendCoverage = raw.dividendYield > 0.2 ? r(Math.max(0.8, 1 / Math.max(payout, 0.12)), 1) : 0;
  const assetGrowth = r(raw.salesGrowth5y * (HEAVY.has(raw.sector) ? 0.85 : 0.62), 1);
  const opGrowth = r(raw.profitGrowth * 0.92 + raw.salesGrowth * 0.08, 1);
  const niGrowth = r(raw.profitGrowth * 0.96, 1);
  const adjEpsGrowth = raw.epsGrowth5y;
  const cashEpsGrowth = r(raw.epsGrowth5y * (raw.fcfPositive ? 0.95 : 0.55), 1);
  const bvpsGrowth = r(Math.max(2, raw.roe * (1 - Math.min(0.7, payout)) * 0.85), 1);
  const dpsGrowth = r(raw.dividendYield >= 2 ? Math.min(18, 4 + raw.epsGrowth5y * 0.35) : Math.max(0, raw.epsGrowth5y * 0.25), 1);
  const capexIntensity = fin ? 0 : r(
    (LIGHT.has(raw.sector) ? 4 : HEAVY.has(raw.sector) ? 16 : 9) + de * 6 + (raw.fcfPositive ? 0 : 5),
    1,
  );

  return {
    ps,
    peg,
    evEbitda,
    gpm,
    npm,
    roa,
    currentRatio,
    quickRatio,
    cashRatio,
    ocfRatio,
    assetTurnover,
    inventoryTurnover,
    recvTurnover,
    dsi,
    recvDays,
    capitalTurnover,
    debtRatio,
    equityRatio,
    debtToAsset: debtRatio,
    dividendCoverage,
    assetGrowth,
    opGrowth,
    niGrowth,
    adjEpsGrowth,
    cashEpsGrowth,
    bvpsGrowth,
    dpsGrowth,
    capexIntensity,
    excellenceScore: 0,
  };
}

export function enrich(raw: CoreStock): Stock {
  const derived = derive(raw);
  const stock: Stock = { ...raw, ...derived };
  stock.excellenceScore = excellenceScore(stock);
  return stock;
}

export type RatioChip = {
  id: string;
  label: string;
  value: number;
  unit: "x" | "pct" | "days" | "plain";
  grade: Grade;
  pillar: PillarId;
};

export type ValueCard = {
  id: string;
  label: string;
  value: number | null;
  industry: number;
  universe: number;
  vsIndustry: ValueLabel;
  vsUniverse: ValueLabel;
};

function bandHigh(v: number, cuts: [number, number, number, number]): Grade {
  if (v >= cuts[3]) return "excellent";
  if (v >= cuts[2]) return "good";
  if (v >= cuts[1]) return "average";
  if (v >= cuts[0]) return "weak";
  return "poor";
}

function bandLow(v: number, cuts: [number, number, number, number]): Grade {
  if (v <= cuts[0]) return "excellent";
  if (v <= cuts[1]) return "good";
  if (v <= cuts[2]) return "average";
  if (v <= cuts[3]) return "weak";
  return "poor";
}

function vsMedian(value: number, median: number): ValueLabel {
  if (median <= 0 || value <= 0) return "na";
  const x = value / median;
  if (x <= 0.72) return "undervalued";
  if (x <= 1.05) return "neutral";
  if (x <= 1.35) return "overvalued";
  return "highly-overvalued";
}

function chip(id: string, label: string, value: number, unit: RatioChip["unit"], grade: Grade, pillar: PillarId): RatioChip {
  return { id, label, value, unit, grade, pillar };
}

export function ratioChips(stock: Stock): RatioChip[] {
  const fin = isFinancial(stock);
  const noOp = fin || stock.opm === 0;
  const noInv = fin || stock.inventoryTurnover === 0;
  const chips: RatioChip[] = [
    chip("rev-g", "Revenue Growth Rate", stock.salesGrowth5y, "pct", bandHigh(stock.salesGrowth5y, [4, 8, 12, 18]), "growth"),
    chip("op-g", "Operating Profit Growth Rate", stock.opGrowth, "pct", noOp ? "na" : bandHigh(stock.opGrowth, [4, 8, 14, 20]), "growth"),
    chip("eps-g", "Earnings Per Share (EPS) Growth", stock.epsGrowth5y, "pct", bandHigh(stock.epsGrowth5y, [5, 10, 15, 20]), "growth"),
    chip("asset-g", "Asset Growth Rate", stock.assetGrowth, "pct", fin ? "na" : bandHigh(stock.assetGrowth, [3, 6, 10, 14]), "growth"),
    chip("ni-g", "Net Income Growth Rate", stock.niGrowth, "pct", bandHigh(stock.niGrowth, [4, 8, 14, 20]), "growth"),

    chip("adj-eps", "Adjusted EPS", stock.adjEpsGrowth, "pct", bandHigh(stock.adjEpsGrowth, [5, 10, 15, 20]), "perShare"),
    chip("cash-eps", "Cash EPS", stock.cashEpsGrowth, "pct", bandHigh(stock.cashEpsGrowth, [4, 8, 14, 18]), "perShare"),
    chip("bvps", "Book Value Per Share", stock.bvpsGrowth, "pct", bandHigh(stock.bvpsGrowth, [4, 8, 12, 16]), "perShare"),
    chip("dps", "Dividend Per Share (DPS)", stock.dpsGrowth, "pct", bandHigh(stock.dpsGrowth, [2, 5, 8, 12]), "perShare"),
    chip("capex", "Capital Expenditures (CapEx)", stock.capexIntensity, "pct", fin ? "na" : bandLow(stock.capexIntensity, [6, 10, 14, 18]), "perShare"),

    chip("gpm", "Gross Profit Margin", stock.gpm, "pct", noOp ? "na" : bandHigh(stock.gpm, [18, 28, 38, 48]), "profit"),
    chip("roce", "Return on Capital Employed (ROCE)", stock.roce, "pct", stock.roce === 0 ? "na" : bandHigh(stock.roce, [10, 15, 20, 25]), "profit"),
    chip("roe", "Return on Equity (ROE)", stock.roe, "pct", bandHigh(stock.roe, [10, 15, 20, 25]), "profit"),
    chip("roa", "Return on Assets (ROA)", stock.roa, "pct", bandHigh(stock.roa, [4, 8, 12, 16]), "profit"),
    chip("opm", "Operating Margin", stock.opm, "pct", noOp ? "na" : bandHigh(stock.opm, [8, 12, 18, 24]), "profit"),
    chip("npm", "Net Margin", stock.npm, "pct", noOp ? "na" : bandHigh(stock.npm, [5, 8, 12, 16]), "profit"),

    chip("fat", "Fixed Asset Turnover Ratio", stock.assetTurnover, "x", fin ? "na" : bandHigh(stock.assetTurnover, [0.45, 0.7, 1.0, 1.4]), "efficiency"),
    chip("invt", "Inventory Turnover Ratio", stock.inventoryTurnover, "x", noInv ? "na" : bandHigh(stock.inventoryTurnover, [3, 5, 8, 12]), "efficiency"),
    chip("recvt", "Receivables Turnover Ratio", stock.recvTurnover, "x", fin ? "na" : bandHigh(stock.recvTurnover, [4, 6, 8, 12]), "efficiency"),
    chip("dsi", "Days Sales in Inventory Ratio", stock.dsi, "days", noInv ? "na" : bandLow(stock.dsi, [35, 55, 80, 110]), "efficiency"),
    chip("rcvd", "Receivable Days", stock.recvDays, "days", fin ? "na" : bandLow(stock.recvDays, [35, 50, 70, 90]), "efficiency"),
    chip("cap-t", "Capital Turnover Ratio", stock.capitalTurnover, "x", fin ? "na" : bandHigh(stock.capitalTurnover, [0.5, 0.8, 1.1, 1.5]), "efficiency"),

    chip("int", "Interest Coverage Ratio", stock.interestCoverage, "x", stock.interestCoverage === 0 ? "na" : bandHigh(stock.interestCoverage, [3, 5, 8, 12]), "coverage"),
    chip("divc", "Equity Dividend Coverage Ratio", stock.dividendCoverage, "x", stock.dividendCoverage === 0 ? "na" : bandHigh(stock.dividendCoverage, [1.2, 1.6, 2.2, 3]), "coverage"),

    chip("debt-r", "Debt Ratio", stock.debtRatio, "x", fin ? "na" : bandLow(stock.debtRatio, [0.2, 0.35, 0.5, 0.65]), "leverage"),
    chip("de", "Debt to Equity Ratio", stock.debtToEquity, "x", fin ? "na" : bandLow(stock.debtToEquity, [0.3, 0.5, 0.9, 1.4]), "leverage"),
    chip("eq", "Equity Ratio", stock.equityRatio, "x", fin ? "na" : bandHigh(stock.equityRatio, [0.4, 0.55, 0.7, 0.82]), "leverage"),
    chip("da", "Debt To Asset Ratio", stock.debtToAsset, "x", fin ? "na" : bandLow(stock.debtToAsset, [0.2, 0.35, 0.5, 0.65]), "leverage"),

    chip("cr", "Current Ratio", stock.currentRatio, "x", fin ? "na" : bandHigh(stock.currentRatio, [1.0, 1.3, 1.8, 2.2]), "liquidity"),
    chip("qr", "Quick Ratio", stock.quickRatio, "x", fin ? "na" : bandHigh(stock.quickRatio, [0.7, 1.0, 1.3, 1.7]), "liquidity"),
    chip("cash-r", "Cash Ratio", stock.cashRatio, "x", fin ? "na" : bandHigh(stock.cashRatio, [0.2, 0.35, 0.5, 0.7]), "liquidity"),
    chip("ocf-r", "Operating Cash Flow Ratio", stock.ocfRatio, "x", fin ? "na" : bandHigh(stock.ocfRatio, [0.3, 0.5, 0.7, 0.95]), "liquidity"),
  ];
  return chips;
}

export function valuationCards(stock: Stock): ValueCard[] {
  const industry = SECTOR_MEDIAN[stock.sector] ?? { pe: 24, pb: 4, ps: 3.5 };
  const universe = UNIVERSE_MEDIAN[stock.universe];
  const fin = isFinancial(stock);
  return [
    {
      id: "pe",
      label: "P/E Ratio (TTM)",
      value: stock.pe > 0 ? stock.pe : null,
      industry: industry.pe,
      universe: universe.pe,
      vsIndustry: vsMedian(stock.pe, industry.pe),
      vsUniverse: vsMedian(stock.pe, universe.pe),
    },
    {
      id: "pb",
      label: "P/B Ratio",
      value: stock.pb > 0 ? stock.pb : null,
      industry: industry.pb,
      universe: universe.pb,
      vsIndustry: vsMedian(stock.pb, industry.pb),
      vsUniverse: vsMedian(stock.pb, universe.pb),
    },
    {
      id: "ps",
      label: "P/S Ratio",
      value: fin || stock.ps <= 0 ? null : stock.ps,
      industry: industry.ps,
      universe: universe.ps,
      vsIndustry: fin || industry.ps <= 0 ? "na" : vsMedian(stock.ps, industry.ps),
      vsUniverse: fin || universe.ps <= 0 ? "na" : vsMedian(stock.ps, universe.ps),
    },
    {
      id: "others",
      label: "Others",
      value: null,
      industry: 0,
      universe: 0,
      vsIndustry: "na",
      vsUniverse: "na",
    },
  ];
}

const POINTS: Record<Grade, number> = {
  excellent: 5,
  good: 4,
  average: 3,
  weak: 2,
  poor: 1,
  na: 0,
};

const PILLAR_WEIGHT: Record<PillarId, number> = {
  profit: 0.26,
  growth: 0.18,
  leverage: 0.14,
  liquidity: 0.1,
  coverage: 0.1,
  valuation: 0.12,
  efficiency: 0.06,
  perShare: 0.04,
};

function pillarAvg(chips: RatioChip[], id: PillarId) {
  const xs = chips.filter((c) => c.pillar === id && c.grade !== "na");
  if (xs.length === 0) return null;
  return xs.reduce((a, c) => a + POINTS[c.grade], 0) / xs.length;
}

function valuationPoints(stock: Stock) {
  const cards = valuationCards(stock).filter((c) => c.id !== "others");
  const labels = cards.flatMap((c) => [c.vsIndustry, c.vsUniverse]).filter((x) => x !== "na");
  if (labels.length === 0) return null;
  const map: Record<ValueLabel, number> = {
    undervalued: 5,
    neutral: 4,
    overvalued: 2,
    "highly-overvalued": 1,
    na: 0,
  };
  const pegBonus = stock.peg > 0 && stock.peg < 1.2 ? 0.4 : stock.peg > 2.5 ? -0.6 : 0;
  return labels.reduce((a, l) => a + map[l], 0) / labels.length + pegBonus;
}

export function excellenceScore(stock: Stock) {
  const chips = ratioChips(stock);
  let acc = 0;
  let w = 0;
  (Object.keys(PILLAR_WEIGHT) as PillarId[]).forEach((id) => {
    const avg = id === "valuation" ? valuationPoints(stock) : pillarAvg(chips, id);
    if (avg == null) return;
    acc += avg * PILLAR_WEIGHT[id];
    w += PILLAR_WEIGHT[id];
  });
  if (w === 0) return 0;
  return Math.round((acc / w / 5) * 100);
}

export function gradeCounts(stock: Stock) {
  const chips = ratioChips(stock);
  const counts = { excellent: 0, good: 0, average: 0, weak: 0, poor: 0, na: 0 };
  chips.forEach((c) => {
    counts[c.grade] += 1;
  });
  return { chips, counts };
}

export function decision(stock: Stock): { verdict: Verdict; label: string; why: string; score: number } {
  const { chips, counts } = gradeCounts(stock);
  const score = stock.excellenceScore;
  const profit = pillarAvg(chips, "profit") ?? 0;
  const leverage = pillarAvg(chips, "leverage");
  const growth = pillarAvg(chips, "growth") ?? 0;
  const leak = chips.filter((c) => c.grade === "poor" || c.grade === "weak");
  const leakNames = leak.slice(0, 2).map((c) => c.label.replace(/ Ratio.*/, "").replace(/ Rate/, ""));

  const fortress = leverage != null && leverage >= 4 && profit >= 4;
  const paidUp = stock.peg > 2.2 || (stock.pe > 40 && stock.epsGrowth5y < 12);
  const compoundOk = score >= 76 && profit >= 3.8 && (leverage == null || leverage >= 3.4) && !paidUp;
  const watchOk = score >= 64 && growth >= 3.2;

  if (compoundOk && fortress) {
    return {
      verdict: "compound",
      label: "Compound",
      score,
      why: leakNames.length
        ? `Profits and the balance sheet both grade Excellent. Watch ${leakNames.join(" and ").toLowerCase()} — size the position, don't skip the name.`
        : "High return on capital, low leverage, and growth you are not overpaying for. This is the wealth-creation profile.",
    };
  }
  if (compoundOk) {
    return {
      verdict: "compound",
      label: "Compound",
      score,
      why: "Return ratios and growth grade well. Valuation is acceptable on PEG. Use a smaller weight if working capital is sloppy.",
    };
  }
  if (watchOk) {
    return {
      verdict: "watch",
      label: "Watch",
      score,
      why: paidUp
        ? "The engine is fine; the price is not. Wait for PEG to compress before building a full position."
        : `Decent business, incomplete screen — ${counts.poor} poor and ${counts.weak} weak ratios. Add on a better entry or after the leak improves.`,
    };
  }
  return {
    verdict: "avoid",
    label: "Pass",
    score,
    why: "Too many weak ratios for a long-term compounding book. Don't confuse a story with a balance sheet.",
  };
}

export const PILLAR_META: { id: PillarId; title: string; hint: string }[] = [
  { id: "growth", title: "Growth", hint: "Can earnings keep compounding from here?" },
  { id: "perShare", title: "Per-share value", hint: "EPS, book, and dividend growth versus capex drain" },
  { id: "profit", title: "Profitability", hint: "The engine. ROE / ROCE / margins must be excellent" },
  { id: "efficiency", title: "Efficiency", hint: "Working capital leaks — a yellow flag, not always a knockout" },
  { id: "coverage", title: "Coverage", hint: "Can profits service interest and the dividend?" },
  { id: "leverage", title: "Leverage", hint: "Fortress sheets survive the cycle" },
  { id: "liquidity", title: "Liquidity", hint: "Bills get paid without diluting you" },
];

export function formatChip(chip: RatioChip) {
  if (chip.grade === "na") return "N/A";
  if (chip.unit === "pct") return `${chip.value.toFixed(chip.value >= 10 ? 0 : 1)}%`;
  if (chip.unit === "days") return `${Math.round(chip.value)}d`;
  if (chip.unit === "x") return `${chip.value.toFixed(chip.value >= 10 ? 1 : 2)}×`;
  return chip.value.toFixed(1);
}

export const GRADE_LABEL: Record<Grade, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  weak: "Weak",
  poor: "Poor",
  na: "N/A",
};

export const VALUE_LABEL: Record<ValueLabel, string> = {
  undervalued: "Undervalued",
  neutral: "Neutral",
  overvalued: "Overvalued",
  "highly-overvalued": "Highly Overvalued",
  na: "N/A",
};
