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
          <TrendingUp className="size-6 text-accent" strokeWidth={2} />
          <span className="text-lg font-semibold tracking-tight">Vantage</span>
        </div>
        <Tooltip content="Coming soon">
          <Badge variant="outline">Beta</Badge>
        </Tooltip>
      </header>

      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-fg">
          Screen Indian equities that fit your criteria
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Filter NSE and BSE stocks by quality, value, growth, and ownership
          metrics. Wire this page up to your screening API or data source to
          get started.
        </p>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input placeholder="Search by symbol or company name" className="pl-9" />
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

      <section className="card flex flex-col items-center gap-2 p-10 text-center">
        <p className="text-sm text-muted">
          No results yet — connect a data source to populate the screener.
        </p>
        <Button variant="secondary" size="sm">
          View documentation
        </Button>
      </section>
    </main>
  );
}
