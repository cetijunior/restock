import { ClipboardList, History as HistoryIcon, LayoutGrid, Plus, Search, Settings2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Catalog, type Sort } from "./components/Catalog";
import { History } from "./components/History";
import { ListPanel } from "./components/ListPanel";
import { ProductSheet } from "./components/ProductSheet";
import { Settings } from "./components/Settings";
import { Toaster, cx } from "./components/ui";
import { lek } from "./lib/format";
import { useListTotals, useStore } from "./lib/store";
import type { Product } from "./lib/types";

type Tab = "catalog" | "list" | "history" | "settings";
const SIDE_TABS: { id: Exclude<Tab, "catalog">; label: string; icon: typeof ClipboardList }[] = [
  { id: "list", label: "Lista", icon: ClipboardList },
  { id: "history", label: "Historia", icon: HistoryIcon },
  { id: "settings", label: "Cilësimet", icon: Settings2 },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("catalog");
  const [side, setSide] = useState<Exclude<Tab, "catalog">>("list");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("name");
  const [onlyListed, setOnlyListed] = useState(false);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const search = useRef<HTMLInputElement>(null);

  const products = useStore((s) => s.products);
  const { rows, total } = useListTotals();
  const categories = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1]);
  }, [products]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault(); setTab("catalog"); search.current?.focus();
      }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  const go = (t: Tab) => { setTab(t); if (t !== "catalog") setSide(t); scrollTo({ top: 0 }); };
  const onEdit = useCallback((p: Product) => setEditing(p), []);
  const panel = (t: Exclude<Tab, "catalog">) =>
    t === "list" ? <ListPanel onBrowse={() => go("catalog")} /> : t === "history" ? <History onLoaded={() => go("list")} /> : <Settings />;

  return (
    <div className="min-h-dvh overflow-x-clip pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-10">
      <Toaster />
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pt-[max(.75rem,env(safe-area-inset-top))] pb-3">
          <button onClick={() => go("catalog")} className="flex shrink-0 items-center gap-2.5">
            <img src="/MarketLogo.png" alt="" className="size-10 rounded-xl ring-1 ring-line" />
            <div className="hidden text-left leading-tight sm:block">
              <div className="font-extrabold tracking-tight">Market Lami</div>
              <div className="text-xs font-medium text-mute">Furnizim</div>
            </div>
          </button>
          <div className="relative min-w-0 flex-1">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
            <input ref={search} value={query} onChange={(e) => { setQuery(e.target.value); if (tab !== "catalog") setTab("catalog"); }}
              placeholder="Kërko produkte…" aria-label="Kërko produkte" enterKeyHint="search"
              className="w-full rounded-2xl border border-line bg-panel py-3 pl-10 pr-10 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25" />
            {query ? (
              <button aria-label="Pastro kërkimin" onClick={() => { setQuery(""); search.current?.focus(); }} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-mute hover:bg-raised"><X size={16} /></button>
            ) : (
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line px-1.5 font-mono text-xs text-mute sm:block">/</kbd>
            )}
          </div>
          <button onClick={() => setEditing("new")} aria-label="Produkt i ri" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-ink shadow-sm transition active:scale-95 sm:w-auto sm:gap-2 sm:px-4 sm:flex sm:font-semibold">
            <Plus size={20} strokeWidth={2.5} /><span className="hidden sm:inline">Produkt</span>
          </button>
        </div>
        {tab === "catalog" && (
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-3 lg:pr-[calc(26rem+2rem)]">
            <div className="no-scrollbar -mx-4 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-4">
              <Chip active={!category} onClick={() => setCategory(null)}>Të gjitha <span className="opacity-60">{products.length}</span></Chip>
              {categories.map(([c, n]) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>{c} <span className="opacity-60">{n}</span></Chip>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-4 lg:grid lg:grid-cols-[1fr_26rem] lg:gap-8">
        <section className={cx(tab !== "catalog" && "hidden lg:block")}>
          <div className="mb-3 flex items-center justify-between gap-2 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-mute">
              <input type="checkbox" checked={onlyListed} onChange={(e) => setOnlyListed(e.target.checked)} className="size-4 accent-[var(--accent)]" />
              Vetëm në listë {rows.length > 0 && <span className="font-mono text-ink">({rows.length})</span>}
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Rendit"
              className="rounded-lg border border-line bg-panel px-2.5 py-1.5 font-medium outline-none">
              <option value="name">Emri A–Z</option>
              <option value="category">Kategoria</option>
              <option value="price">Çmimi ↓</option>
            </select>
          </div>
          <Catalog query={query} category={category} sort={sort} onlyListed={onlyListed} onEdit={onEdit} onNew={() => setEditing("new")} />
        </section>

        <aside className={cx("lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pb-4", tab === "catalog" && "hidden")}>
          <div className="mb-4 hidden gap-1 rounded-2xl border border-line bg-panel p-1 lg:flex">
            {SIDE_TABS.map((t) => (
              <button key={t.id} onClick={() => setSide(t.id)}
                className={cx("flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition", side === t.id ? "bg-raised text-ink" : "text-mute hover:text-ink")}>
                <t.icon size={15} /> {t.label}{t.id === "list" && rows.length > 0 && <span className="rounded-full bg-accent px-1.5 font-mono text-[11px] text-accent-ink">{rows.length}</span>}
              </button>
            ))}
          </div>
          <h1 className="mb-4 text-2xl font-extrabold tracking-tight lg:hidden">{SIDE_TABS.find((t) => t.id === tab)?.label}</h1>
          <div className="hidden lg:block">{panel(side)}</div>
          <div className="lg:hidden">{tab !== "catalog" && panel(tab)}</div>
        </aside>
      </main>

      {tab === "catalog" && rows.length > 0 && (
        <button onClick={() => go("list")}
          className="anim-up fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-between rounded-2xl bg-ink px-5 py-3.5 text-bg shadow-2xl lg:hidden">
          <span className="text-sm font-semibold">{rows.length} artikuj në listë</span>
          <span className="tabular font-mono font-semibold">{lek(total)} →</span>
        </button>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {[{ id: "catalog" as Tab, label: "Katalogu", icon: LayoutGrid }, ...SIDE_TABS].map((t) => (
            <button key={t.id} onClick={() => go(t.id)} className={cx("relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition", tab === t.id ? "text-accent" : "text-mute")}>
              <t.icon size={22} strokeWidth={tab === t.id ? 2.5 : 2} />
              {t.label}
              {t.id === "list" && rows.length > 0 && <span className="absolute right-[calc(50%-1.4rem)] top-1.5 min-w-5 rounded-full bg-accent px-1 font-mono text-[10px] leading-5 text-accent-ink">{rows.length}</span>}
            </button>
          ))}
        </div>
      </nav>

      <ProductSheet product={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

const Chip = ({ active, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) => (
  <button {...p} className={cx("shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
    active ? "border-accent bg-accent text-accent-ink" : "border-line bg-panel text-ink hover:border-mute")} />
);
