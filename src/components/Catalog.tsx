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
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => {
        const header = sort === "category" && p.category !== lastCat ? (lastCat = p.category) : null;
        return [
          header && <h3 key={"h" + p.id} className="col-span-full mt-3 px-1 text-xs font-bold uppercase tracking-wider text-mute first:mt-0">{header}</h3>,
          <Card key={p.id} p={p} qty={qtyById.get(p.id) ?? 0} onEdit={onEdit} />,
        ];
      })}
    </div>
  );
}

const Card = memo(function Card({ p, qty, onEdit }: { p: Product; qty: number; onEdit: (p: Product) => void }) {
  const setQty = useStore((s) => s.setQty);
  const m = margin(p.buy, p.sell);
  return (
    <div onClick={() => !qty && setQty(p.id, 1)} role="button" aria-label={`Shto ${p.name}`}
      className={cx("relative flex cursor-pointer select-none flex-col rounded-3xl border p-3 transition active:scale-[.98]",
        qty ? "border-accent bg-accent/[.08] ring-1 ring-accent" : "border-line bg-panel hover:border-mute")}>
      <button aria-label={`Ndrysho ${p.name}`} onClick={(e) => { e.stopPropagation(); onEdit(p); }}
        className="absolute right-1.5 top-1.5 z-10 grid size-10 place-items-center rounded-full text-mute active:bg-line"><Pencil size={16} /></button>
      {qty > 0 && <span className="anim-pop absolute left-2 top-2 z-10 min-w-8 rounded-full bg-accent px-2 text-center font-mono text-sm font-bold leading-8 text-accent-ink shadow">{qty}</span>}
      <Thumb image={p.image} icon={p.icon} size="mx-auto mt-1 size-20 text-5xl rounded-2xl" />
      <div className="mt-2.5 line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-tight">{p.name}</div>
      <div className="mt-1 flex items-baseline justify-between gap-1">
        <span className="tabular font-mono text-lg font-bold">{lek(p.buy)}</span>
        {m !== null && <span className={cx("tabular rounded-md px-1.5 font-mono text-[11px] font-semibold", m < 10 ? "bg-danger/10 text-danger" : "bg-accent/10 text-accent")}>{m.toFixed(0)}%</span>}
      </div>
      <div className="mt-2.5">
        {qty ? (
          <Stepper qty={qty} size="lg" onBump={(d) => setQty(p.id, qty + d)} onSet={(n) => setQty(p.id, n)} />
        ) : (
          <div className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-raised text-sm font-bold text-ink"><Plus size={18} strokeWidth={2.75} /> Shto</div>
        )}
      </div>
    </div>
  );
});
