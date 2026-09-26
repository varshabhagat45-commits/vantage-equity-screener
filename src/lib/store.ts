import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SELECTED, PRESETS, applyPresetSpec, inferSelected, toggleQuery } from "./filters";
import { DEFAULT_QUERY } from "./query-lang";
import type { CombineMode, Universe } from "./types";

export type SortKey =
  | "excellenceScore"
  | "qualityScore"
  | "pe"
  | "peg"
  | "dividendYield"
  | "roe"
  | "marketCap"
  | "name"
  | "opm";

export type MarketStatus = "idle" | "loading" | "live" | "snapshot";

type ScreenerState = {
  selected: string[];
  queryText: string;
  mode: CombineMode;
  universe: Universe | "all";
  sector: string | "all";
  search: string;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  watch: string[];
  watchOnly: boolean;
  activeTicker: string | null;
  quotes: Record<string, { price: number; chg1d: number }>;
  marketAsOf: number | null;
  marketFetchedAt: number | null;
  marketCovered: number;
  marketStatus: MarketStatus;
  marketError: string | null;
  toggle: (id: string) => void;
  clear: () => void;
  applyPreset: (id: string) => void;
  setMode: (mode: CombineMode) => void;
  setQuery: (queryText: string) => void;
  setUniverse: (universe: Universe | "all") => void;
  setSector: (sector: string | "all") => void;
  setSearch: (search: string) => void;
  setSort: (key: SortKey) => void;
  toggleWatch: (ticker: string) => void;
  setWatchOnly: (on: boolean) => void;
  setActive: (ticker: string | null) => void;
  setMarketLoading: () => void;
  setMarket: (payload: {
    quotes: Record<string, { price: number; chg1d: number }>;
    asOf: number | null;
    fetchedAt: number;
    covered: number;
    source: "yahoo" | "snapshot";
    error?: string;
  }) => void;
};

export const useScreener = create<ScreenerState>()(
  persist(
    (set, get) => ({
      selected: DEFAULT_SELECTED,
      queryText: DEFAULT_QUERY,
      mode: "and",
      universe: "all",
      sector: "all",
      search: "",
      sortKey: "excellenceScore",
      sortDir: "desc",
      watch: [],
      watchOnly: false,
      activeTicker: null,
      quotes: {},
      marketAsOf: null,
      marketFetchedAt: null,
      marketCovered: 0,
      marketStatus: "idle",
      marketError: null,
      toggle: (id) => {
        const { queryText, mode } = get();
        set(toggleQuery(queryText, id, mode));
      },
      clear: () => set({ selected: [], queryText: "" }),
      applyPreset: (id) => {
        const preset = PRESETS.find((p) => p.id === id);
        if (!preset) return;
        set(applyPresetSpec(preset, get().mode));
      },
      setMode: (mode) => set({ mode }),
      setQuery: (queryText) =>
        set({
          queryText,
          selected: inferSelected(queryText),
        }),
      setUniverse: (universe) => set({ universe }),
      setSector: (sector) => set({ sector }),
      setSearch: (search) => set({ search }),
      setSort: (key) => {
        const { sortKey, sortDir } = get();
        if (sortKey === key) {
          set({ sortDir: sortDir === "asc" ? "desc" : "asc" });
        } else {
          set({
            sortKey: key,
            sortDir: key === "name" || key === "pe" || key === "peg" ? "asc" : "desc",
          });
        }
      },
      toggleWatch: (ticker) =>
        set((s) => ({
          watch: s.watch.includes(ticker)
            ? s.watch.filter((t) => t !== ticker)
            : [...s.watch, ticker],
        })),
      setWatchOnly: (on) => set({ watchOnly: on }),
      setActive: (ticker) => set({ activeTicker: ticker }),
      setMarketLoading: () => set({ marketStatus: "loading", marketError: null }),
      setMarket: (payload) =>
        set({
          quotes: payload.quotes,
          marketAsOf: payload.asOf,
          marketFetchedAt: payload.fetchedAt,
          marketCovered: payload.covered,
          marketStatus: payload.source === "yahoo" && payload.covered > 0 ? "live" : "snapshot",
          marketError: payload.error ?? null,
        }),
    }),
    {
      name: "vantage-screener",
      partialize: (s) => ({ watch: s.watch }),
    },
  ),
);
