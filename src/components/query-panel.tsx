import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRESETS, buildEnglish, buildSql } from "@/lib/filters";
import { parseQuery } from "@/lib/query-lang";
import { useScreener } from "@/lib/store";
import { cn } from "@/lib/cn";

export function QueryPanel({ matchCount, universeSize }: { matchCount: number; universeSize: number }) {
  const selected = useScreener((s) => s.selected);
  const queryText = useScreener((s) => s.queryText);
  const setQuery = useScreener((s) => s.setQuery);
  const mode = useScreener((s) => s.mode);
  const setMode = useScreener((s) => s.setMode);
  const applyPreset = useScreener((s) => s.applyPreset);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"query" | "sql">("query");

  const parsed = useMemo(() => (queryText.trim() ? parseQuery(queryText) : null), [queryText]);
  const sql = useMemo(() => buildSql(selected, mode, queryText), [selected, mode, queryText]);
  const english = useMemo(() => buildEnglish(selected, mode, queryText), [selected, mode, queryText]);
  const parseError = parsed && !parsed.ok && parsed.error !== "empty" ? parsed.error : null;

  async function copy() {
    const text = tab === "sql" ? sql : queryText;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(tab === "sql" ? "SQL copied" : "Query copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Investment query
            </h2>
            <Badge variant="muted">
              {matchCount} of {universeSize}
            </Badge>
            {parseError ? <Badge variant="down">Fix query</Badge> : null}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted">{english}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-border p-0.5">
            {(["and", "or"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "h-10 rounded-full px-3 text-xs font-medium uppercase tracking-wide",
                  mode === m ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex rounded-full border border-border p-0.5">
            {(["query", "sql"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "h-10 rounded-full px-3 text-xs font-medium uppercase tracking-wide",
                  tab === t ? "bg-bg-subtle text-fg" : "text-muted hover:text-fg",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : tab === "sql" ? "Copy SQL" : "Copy query"}
          </Button>
        </div>
      </div>

      {tab === "query" ? (
        <label className="mt-4 block">
          <span className="sr-only">Investment screen</span>
          <textarea
            value={queryText}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
            rows={6}
            placeholder={"Return on equity > 18 AND\nROCE > 15 AND\nPEG < 2 AND\nCurrent ratio > 1.2"}
            className={cn(
              "query-pre min-h-36 w-full resize-y rounded-md border bg-bg px-4 py-3 text-xs leading-relaxed text-fg",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
              parseError ? "border-down/40" : "border-border",
            )}
          />
        </label>
      ) : (
        <pre className="query-pre mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-bg px-4 py-3 text-xs leading-relaxed text-fg">
          {sql}
        </pre>
      )}

      {parseError ? (
        <p className="mt-2 text-xs text-down">{parseError}</p>
      ) : (
        <p className="mt-2 text-xs text-subtle">
          Write clauses like Screener.in — join with AND / OR. Tiles insert the same lines.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const on = p.query
            ? queryText.trim() === p.query.trim()
            : !!(
                p.ids &&
                selected.length === p.ids.length &&
                p.ids.every((id) => selected.includes(id))
              );
          return (
            <button
              key={p.id}
              type="button"
              title={p.hint}
              onClick={() => applyPreset(p.id)}
              className={cn(
                "h-10 rounded-full border px-3 text-xs font-medium transition-colors duration-150",
                on
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-surface text-muted hover:text-fg",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
