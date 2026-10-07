import { PackagePlus, Pencil, Plus, SearchX } from "lucide-react";
import { memo, useDeferredValue, useMemo } from "react";
import { useStore } from "../lib/store";
import type { Product } from "../lib/types";
import { fold, lek, margin } from "../lib/format";
import { Stepper, Thumb, cx } from "./ui";

export type Sort = "name" | "category" | "price";

export function Catalog({ query, category, sort, onlyListed, onEdit, onNew }: {
  query: string; category: string | null; sort: Sort; onlyListed: boolean;
  onEdit: (p: Product) => void; onNew: () => void;
}) {
  const products = useStore((s) => s.products);
  const lines = useStore((s) => s.lines);
  const q = fold(useDeferredValue(query));
  const qtyById = useMemo(() => new Map(lines.map((l) => [l.id, l.qty])), [lines]);

  const items = useMemo(() => {
    const words = q.split(/\s+/).filter(Boolean);
    const list = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (onlyListed && !qtyById.has(p.id)) return false;
      const hay = fold(`${p.name} ${p.category}`);
      return words.every((w) => hay.includes(w));
    });
    const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, "sq");
    return list.sort(sort === "price" ? (a, b) => b.buy - a.buy : sort === "category" ? (a, b) => a.category.localeCompare(b.category, "sq") || byName(a, b) : byName);
  }, [products, q, category, sort, onlyListed, qtyById]);

  if (!items.length)
    return (
      <div className="grid place-items-center gap-3 py-20 text-center text-mute">
        <SearchX size={36} />
        <p>Asnjë produkt{query && <> për “<b className="text-ink">{query}</b>”</>}.</p>
        <button onClick={onNew} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"><PackagePlus size={16} /> Shto produkt të ri</button>
      </div>
    );

  let lastCat = "";
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
      {items.map((p) => {
        const header = sort === "category" && p.category !== lastCat ? (lastCat = p.category) : null;
        return (
          <li key={p.id}>
            {header && <div className="sticky top-0 bg-raised px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-mute">{header}</div>}
            <Row p={p} qty={qtyById.get(p.id) ?? 0} onEdit={onEdit} />
          </li>
        );
      })}
    </ul>
  );
}

const Row = memo(function Row({ p, qty, onEdit }: { p: Product; qty: number; onEdit: (p: Product) => void }) {
  const bump = useStore((s) => s.bump);
  const setQty = useStore((s) => s.setQty);
  const m = margin(p.buy, p.sell);
  return (
    <div onClick={() => !qty && bump(p.id, 1)}
      className={cx("group flex cursor-pointer select-none items-center gap-3 px-4 py-3 transition", qty ? "bg-accent/[.07]" : "hover:bg-raised active:bg-raised")}>
      <div className="relative">
        <Thumb image={p.image} icon={p.icon} />
        {qty > 0 && <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-accent px-1 text-center font-mono text-[10px] font-semibold leading-5 text-accent-ink ring-2 ring-panel">{qty}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold">{p.name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-mute">
          <span className="truncate">{p.category}</span>
          {p.sell > 0 && <><span>·</span><span className="tabular">shitje {lek(p.sell)}</span></>}
          {m !== null && <span className={cx("tabular rounded px-1 font-mono text-[10px] font-semibold", m < 10 ? "bg-danger/10 text-danger" : "bg-accent/10 text-accent")}>{m.toFixed(0)}%</span>}
        </div>
      </div>
      <div className="tabular text-right font-mono text-sm font-semibold">{lek(p.buy)}</div>
      <button aria-label={`Ndrysho ${p.name}`} onClick={(e) => { e.stopPropagation(); onEdit(p); }}
        className="grid size-8 place-items-center rounded-full text-mute opacity-60 transition hover:bg-line hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Pencil size={14} /></button>
      {qty ? (
        <Stepper qty={qty} onBump={(d) => setQty(p.id, qty + d)} onSet={(n) => setQty(p.id, n)} />
      ) : (
        <button aria-label={`Shto ${p.name}`} onClick={(e) => { e.stopPropagation(); bump(p.id, 1); }}
          className="grid size-9 place-items-center rounded-full border border-line bg-raised text-ink transition group-hover:border-accent group-hover:text-accent"><Plus size={18} strokeWidth={2.5} /></button>
      )}
    </div>
  );
});
