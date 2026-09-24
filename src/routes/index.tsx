import { createFileRoute } from "@tanstack/react-router";
import { Search, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";

export const Route = createFileRoute("/")({
  component: Home,
});

const FILTERS = ["ROE > 15%", "D/E < 0.5", "PEG < 1.5", "Promoter holding > 50%"];

function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-sm bg-accent text-accent-fg font-display text-sm font-semibold">
            V
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-tight">Vantage</span>
            <span className="block text-xs text-muted">Equity screener</span>
          </span>
        </div>
        <Tooltip content="Live NSE prices come next">
          <Badge variant="outline">Beta</Badge>
        </Tooltip>
      </header>

      <section className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
          Buy excellent businesses. Pay a sane price.
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Screen Indian listed companies on quality, value, and ownership. The full filter set and
          live NSE last prices are being wired into this public site.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input placeholder="Search by ticker or company name" className="pl-9" />
          </div>
          <Button>Run Screen</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <Badge key={filter} variant="muted">
              {filter}
            </Badge>
          ))}
        </div>
      </section>
    </main>
  );
}
