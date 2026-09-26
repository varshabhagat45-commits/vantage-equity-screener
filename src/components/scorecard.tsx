import type { Grade, Stock, ValueLabel } from "@/lib/types";
import {
  GRADE_LABEL,
  PILLAR_META,
  VALUE_LABEL,
  decision,
  formatChip,
  ratioChips,
  valuationCards,
} from "@/lib/ratios";
import { cn } from "@/lib/cn";

function Gauge({ grade }: { grade: Grade | ValueLabel }) {
  const map: Record<string, number> = {
    excellent: 18,
    undervalued: 16,
    good: 14,
    neutral: 11,
    average: 10,
    overvalued: 7,
    weak: 6,
    poor: 3,
    "highly-overvalued": 2,
    na: 0,
  };
  const t = map[grade] ?? 0;
  return (
    <svg viewBox="0 0 20 12" className="size-4 shrink-0" aria-hidden>
      <path
        d="M2 10 A8 8 0 0 1 18 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        className="text-border"
        strokeLinecap="round"
      />
      <path
        d="M2 10 A8 8 0 0 1 18 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        className="text-current"
        strokeLinecap="round"
        strokeDasharray={`${t} 40`}
      />
    </svg>
  );
}

export function VerdictBanner({ stock }: { stock: Stock }) {
  const d = decision(stock);
  return (
    <div
      data-verdict={d.verdict}
      className="verdict-banner rounded-md border px-3.5 py-3"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-sm font-semibold">{d.label}</p>
        <p className="text-xs tabular-nums">
          Excellence <span className="font-medium">{d.score}</span>
        </p>
      </div>
      <p className="mt-1 text-xs leading-relaxed opacity-90">{d.why}</p>
    </div>
  );
}

export function ValuationGrid({ stock }: { stock: Stock }) {
  const cards = valuationCards(stock);
  const main = cards.filter((c) => c.id !== "others");
  const others = cards.find((c) => c.id === "others");
  return (
    <div className="grid grid-cols-1 gap-3">
      {main.map((card) => (
        <div key={card.id} className="rounded-md border border-border bg-bg px-3 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{card.label}</p>
            <p className="font-display text-lg font-semibold tabular-nums">
              {card.value == null ? "N/A" : card.value.toFixed(2)}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MedianBox label="Industry Median" value={card.industry} grade={card.vsIndustry} />
            <MedianBox
              label={stock.universe === "large" ? "Large Cap Median" : stock.universe === "mid" ? "Mid Cap Median" : "Small Cap Median"}
              value={card.universe}
              grade={card.vsUniverse}
            />
          </div>
        </div>
      ))}
      {others ? (
        <div className="rounded-md border border-border bg-bg px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Others</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MedianBox label="PEG Ratio" value={stock.peg} grade={pegGrade(stock.peg)} />
            <MedianBox label="EV/EBITDA" value={stock.evEbitda} grade={evGrade(stock.evEbitda)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function pegGrade(peg: number): ValueLabel {
  if (peg <= 0) return "na";
  if (peg < 1) return "undervalued";
  if (peg < 1.5) return "neutral";
  if (peg < 2.2) return "overvalued";
  return "highly-overvalued";
}

function evGrade(ev: number): ValueLabel {
  if (ev <= 0) return "na";
  if (ev < 10) return "undervalued";
  if (ev < 14) return "neutral";
  if (ev < 18) return "overvalued";
  return "highly-overvalued";
}

function MedianBox({ label, value, grade }: { label: string; value: number; grade: ValueLabel }) {
  return (
    <div data-grade={grade} className="grade-tile rounded-sm border px-2.5 py-2">
      <div className="flex items-start gap-1.5">
        <Gauge grade={grade} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-current/80">{label}</p>
          <p className="mt-0.5 text-sm font-medium tabular-nums">
            {value > 0 ? value.toFixed(2) : "N/A"}
          </p>
          <span className="grade-pill mt-1 inline-flex rounded-full border px-1.5 py-0.5 text-xs">
            {VALUE_LABEL[grade]}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RatioPillars({ stock }: { stock: Stock }) {
  const chips = ratioChips(stock);
  return (
    <div className="space-y-5">
      {PILLAR_META.map((p) => {
        const rows = chips.filter((c) => c.pillar === p.id);
        if (rows.length === 0) return null;
        return (
          <section key={p.id}>
            <h3 className="font-display text-sm font-semibold">{p.title}</h3>
            <p className="mt-0.5 text-xs text-muted">{p.hint}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {rows.map((c) => (
                <div
                  key={c.id}
                  data-grade={c.grade}
                  className="grade-tile inline-flex min-h-11 items-center gap-2 rounded-md border px-2.5 py-1.5"
                >
                  <Gauge grade={c.grade} />
                  <span className="text-xs leading-snug">{c.label}</span>
                  <span className="grade-pill rounded-full border px-1.5 py-0.5 text-xs">
                    {GRADE_LABEL[c.grade]}
                  </span>
                  <span className="text-xs tabular-nums opacity-80">{formatChip(c)}</span>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function GradeMark({ stock, className }: { stock: Stock; className?: string }) {
  const d = decision(stock);
  return (
    <span
      data-verdict={d.verdict}
      className={cn("verdict-pill inline-flex rounded-full px-2 py-0.5 text-xs font-medium", className)}
    >
      {d.label}
    </span>
  );
}
