export type Universe = "large" | "mid" | "small";

export type Tint = "gold" | "blue" | "peach" | "mint" | "ink";

export type CmpOp = ">" | "<" | ">=" | "<=" | "=";

export type Grade = "excellent" | "good" | "average" | "weak" | "poor" | "na";

export type ValueLabel = "undervalued" | "neutral" | "overvalued" | "highly-overvalued" | "na";

export type Verdict = "compound" | "watch" | "avoid";

export type PillarId =
  | "valuation"
  | "growth"
  | "perShare"
  | "profit"
  | "efficiency"
  | "coverage"
  | "leverage"
  | "liquidity";

export type FieldId =
  | "pe"
  | "pb"
  | "ps"
  | "peg"
  | "evEbitda"
  | "marketCap"
  | "dividendYield"
  | "roe"
  | "roce"
  | "roa"
  | "opm"
  | "gpm"
  | "npm"
  | "debtToEquity"
  | "debtRatio"
  | "equityRatio"
  | "debtToAsset"
  | "interestCoverage"
  | "dividendCoverage"
  | "salesGrowth"
  | "profitGrowth"
  | "salesGrowth5y"
  | "epsGrowth5y"
  | "assetGrowth"
  | "opGrowth"
  | "niGrowth"
  | "adjEpsGrowth"
  | "cashEpsGrowth"
  | "bvpsGrowth"
  | "dpsGrowth"
  | "capexIntensity"
  | "currentRatio"
  | "quickRatio"
  | "cashRatio"
  | "ocfRatio"
  | "assetTurnover"
  | "inventoryTurnover"
  | "recvTurnover"
  | "dsi"
  | "recvDays"
  | "capitalTurnover"
  | "promoterHolding"
  | "pledged"
  | "institutional"
  | "fii"
  | "dii"
  | "qualityScore"
  | "excellenceScore"
  | "fcf"
  | "qoqSales"
  | "qoqProfit"
  | "price";

export type PredCmp = { field: FieldId; op: CmpOp; value: number };

export type Predicate = PredCmp | { all: Predicate[] };

export type CoreStock = {
  ticker: string;
  name: string;
  sector: string;
  universe: Universe;
  price: number;
  marketCap: number;
  pe: number;
  pb: number;
  dividendYield: number;
  roe: number;
  roce: number;
  opm: number;
  debtToEquity: number;
  interestCoverage: number;
  salesGrowth: number;
  profitGrowth: number;
  salesGrowth5y: number;
  epsGrowth5y: number;
  fcfPositive: boolean;
  qualityScore: number;
  promoterHolding: number;
  pledged: number;
  fii: number;
  dii: number;
  qoqSales: number;
  qoqProfit: number;
  chg1d: number;
};

export type DerivedRatios = {
  ps: number;
  peg: number;
  evEbitda: number;
  gpm: number;
  npm: number;
  roa: number;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  ocfRatio: number;
  assetTurnover: number;
  inventoryTurnover: number;
  recvTurnover: number;
  dsi: number;
  recvDays: number;
  capitalTurnover: number;
  debtRatio: number;
  equityRatio: number;
  debtToAsset: number;
  dividendCoverage: number;
  assetGrowth: number;
  opGrowth: number;
  niGrowth: number;
  adjEpsGrowth: number;
  cashEpsGrowth: number;
  bvpsGrowth: number;
  dpsGrowth: number;
  capexIntensity: number;
  excellenceScore: number;
};

export type Stock = CoreStock & DerivedRatios;

export type FilterDef = {
  id: string;
  label: string;
  hint: string;
  sql: string;
  english: string;
  tint: Tint;
  predicate: Predicate;
  test: (stock: Stock) => boolean;
};

export type CombineMode = "and" | "or";
