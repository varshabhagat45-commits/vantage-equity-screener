import { SECTORS } from "@/lib/stocks";
import { useScreener } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { Universe } from "@/lib/types";

const UNIVERSES: { id: Universe | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "large", label: "Large" },
  { id: "mid", label: "Mid" },
  { id: "small", label: "Small" },
];

export function UniverseBar() {
  const universe = useScreener((s) => s.universe);
  const setUniverse = useScreener((s) => s.setUniverse);
  const sector = useScreener((s) => s.sector);
  const setSector = useScreener((s) => s.setSector);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex rounded-full border border-border bg-surface p-0.5">
        {UNIVERSES.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setUniverse(u.id)}
            className={cn(
              "h-10 min-w-14 rounded-full px-3.5 text-sm font-medium",
              universe === u.id ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
            )}
          >
            {u.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        Sector
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <option value="all">All sectors</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
