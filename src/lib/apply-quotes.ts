import { enrich } from "./ratios";
import { STOCKS } from "./stocks";
import type { CoreStock, Stock } from "./types";

export type QuotePatch = {
  price: number;
  chg1d: number;
};

function coreOf(stock: Stock): CoreStock {
  return {
    ticker: stock.ticker,
    name: stock.name,
    sector: stock.sector,
    universe: stock.universe,
    price: stock.price,
    marketCap: stock.marketCap,
    pe: stock.pe,
    pb: stock.pb,
    dividendYield: stock.dividendYield,
    roe: stock.roe,
    roce: stock.roce,
    opm: stock.opm,
    debtToEquity: stock.debtToEquity,
    interestCoverage: stock.interestCoverage,
    salesGrowth: stock.salesGrowth,
    profitGrowth: stock.profitGrowth,
    salesGrowth5y: stock.salesGrowth5y,
    epsGrowth5y: stock.epsGrowth5y,
    fcfPositive: stock.fcfPositive,
    qualityScore: stock.qualityScore,
    promoterHolding: stock.promoterHolding,
    pledged: stock.pledged,
    fii: stock.fii,
    dii: stock.dii,
    qoqSales: stock.qoqSales,
    qoqProfit: stock.qoqProfit,
    chg1d: stock.chg1d,
  };
}

/** Scale valuation fields with the live price; fundamentals stay as last filed. */
export function applyLiveQuotes(
  quotes: Record<string, QuotePatch>,
  universe: Stock[] = STOCKS,
): Stock[] {
  return universe.map((stock) => {
    const q = quotes[stock.ticker];
    if (!q || !(q.price > 0) || !(stock.price > 0)) return stock;
    const factor = q.price / stock.price;
    if (!Number.isFinite(factor) || factor <= 0) return stock;
    const raw = coreOf(stock);
    raw.price = q.price;
    raw.chg1d = q.chg1d;
    raw.marketCap = stock.marketCap * factor;
    if (raw.pe > 0) raw.pe = Math.round(raw.pe * factor * 10) / 10;
    if (raw.pb > 0) raw.pb = Math.round(raw.pb * factor * 10) / 10;
    if (raw.dividendYield > 0) {
      raw.dividendYield = Math.round((raw.dividendYield / factor) * 10) / 10;
    }
    return enrich(raw);
  });
}
