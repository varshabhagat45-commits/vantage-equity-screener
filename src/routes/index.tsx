import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({ component: Home });

const FILTERS = ["ROE > 15%", "D/E < 0.5", "PEG < 1.5", "Promoter holding > 50%"];

function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-sm bg-accent text-accent-fg font-display text-sm font-semibold">
          V
        </span>
        <span className="leading-tight">
          <span className="block font-display text-sm font-semibold tracking-tight">Vantage</span>
          <span className="block text-xs text-muted">Equity screener</span>
        </span>
      </header>

      <section>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Buy excellent businesses. Pay a sane price.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Screen Indian listed companies on quality, value, and ownership. The full live NSE
          screener is shipping next. Not investment advice.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input placeholder="Search ticker or name" className="pl-9" />
          </div>
          <Button>Run Screen</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
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
