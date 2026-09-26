import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  Droplets,
  Gauge,
  LineChart,
  Percent,
  RefreshCcw,
  RotateCcw,
  Shield,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Wallet,
  Zap,
  Landmark,
} from "lucide-react";
import { FILTERS } from "@/lib/filters";
import type { Stock } from "@/lib/types";
import { useScreener } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const ICONS: Record<string, LucideIcon> = {
  "excellent-profit": Gauge,
  "sensible-peg": BarChart3,
  "fortress-liq": Droplets,
  "clean-wc": RefreshCcw,
  "high-roe": Target,
  "low-debt": Shield,
  dividend: Star,
  "undervalued-pe": BarChart3,
  "high-opm": Percent,
  growth: TrendingUp,
  "cash-rich": Wallet,
  quality: Zap,
  "profit-growth": TrendingUp,
  "high-roce": Target,
  promoter: Building2,
  pledged: ShieldCheck,
  interest: Activity,
  "lt-sales": LineChart,
  eps: Landmark,
  institutional: RefreshCcw,
  "best-quarter": TrendingUp,
};

export function QuickFilters({ stocks }: { stocks: Stock[] }) {
  const selected = useScreener((s) => s.selected);
  const toggle = useScreener((s) => s.toggle);
  const clear = useScreener((s) => s.clear);

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Quick Filters
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={selected.length === 0}
          className="rounded-full"
        >
          <RotateCcw className="size-3.5" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {FILTERS.map((filter, i) => {
          const on = selected.includes(filter.id);
          const Icon = ICONS[filter.id] ?? Target;
          const count = stocks.filter(filter.test).length;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(filter.id)}
              style={{ "--i": i } as CSSProperties}
              data-on={on ? "true" : "false"}
              data-tint={filter.tint}
              className={cn(
                "filter-tile flex min-h-14 items-start gap-3 rounded-lg border border-border bg-surface px-3.5 py-3 text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                !on && "text-fg",
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0 opacity-80" strokeWidth={2} />
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="font-display text-sm font-semibold leading-snug">
                    {filter.label}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs tabular-nums",
                      on ? "opacity-80" : "text-subtle",
                    )}
                  >
                    {count}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs",
                    on ? "opacity-80" : "text-muted",
                  )}
                >
                  {filter.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
