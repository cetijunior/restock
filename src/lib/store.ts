import { create } from "zustand";
import { persist } from "zustand/middleware";
import seed from "../data/products.json";
import type { Line, Order, Product } from "./types";
import { uid } from "./format";

type State = {
  products: Product[];
  lines: Line[];
  orders: Order[];
  supplier: string;
  note: string;
  setQty: (id: string, qty: number) => void;
  bump: (id: string, delta: number) => void;
  clearList: () => void;
  setMeta: (patch: Partial<Pick<State, "supplier" | "note">>) => void;
  upsertProduct: (p: Omit<Product, "id"> & { id?: string }) => string;
  deleteProduct: (id: string) => void;
  saveOrder: () => Order | null;
  loadOrder: (o: Order) => void;
  deleteOrder: (id: string) => void;
  replaceProducts: (p: Product[]) => void;
  resetCatalog: () => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      products: seed as Product[],
      lines: [],
      orders: [],
      supplier: "",
      note: "",

      setQty: (id, qty) =>
        set(({ lines }) => {
          const q = Math.max(0, Math.floor(qty) || 0);
          if (q === 0) return { lines: lines.filter((l) => l.id !== id) };
          return lines.some((l) => l.id === id)
            ? { lines: lines.map((l) => (l.id === id ? { ...l, qty: q } : l)) }
            : { lines: [...lines, { id, qty: q }] };
        }),
      bump: (id, delta) => get().setQty(id, (get().lines.find((l) => l.id === id)?.qty ?? 0) + delta),
      clearList: () => set({ lines: [], note: "" }),
      setMeta: (patch) => set(patch),

      upsertProduct: (p) => {
        const id = p.id ?? uid();
        set(({ products }) => ({
          products: products.some((x) => x.id === id)
            ? products.map((x) => (x.id === id ? { ...p, id } : x))
            : [{ ...p, id }, ...products],
        }));
        return id;
      },
      deleteProduct: (id) =>
        set(({ products, lines }) => ({
          products: products.filter((p) => p.id !== id),
          lines: lines.filter((l) => l.id !== id),
        })),

      saveOrder: () => {
        const { lines, products, supplier, note } = get();
        const byId = new Map(products.map((p) => [p.id, p]));
        const orderLines = lines.flatMap((l) => {
          const p = byId.get(l.id);
          return p ? [{ name: p.name, category: p.category, buy: p.buy, qty: l.qty }] : [];
        });
        if (!orderLines.length) return null;
        const order: Order = {
          id: uid(),
          createdAt: Date.now(),
          supplier,
          note,
          lines: orderLines,
          total: orderLines.reduce((s, l) => s + l.buy * l.qty, 0),
        };
        set(({ orders }) => ({ orders: [order, ...orders].slice(0, 200) }));
        return order;
      },
      loadOrder: (o) => {
        const byName = new Map(get().products.map((p) => [p.name.toLowerCase(), p.id]));
        set({
          lines: o.lines.flatMap((l) => {
            const id = byName.get(l.name.toLowerCase());
            return id ? [{ id, qty: l.qty }] : [];
          }),
          supplier: o.supplier,
          note: o.note,
        });
      },
      deleteOrder: (id) => set(({ orders }) => ({ orders: orders.filter((o) => o.id !== id) })),
      replaceProducts: (products) => set({ products, lines: [] }),
      resetCatalog: () => set({ products: seed as Product[], lines: [] }),
    }),
    {
      name: "restock-v2",
      version: 2,
      migrate: (s, v) => {
        const st = s as State;
        if (v < 2) {
          const byId = new Map((seed as Product[]).map((p) => [p.id, p]));
          st.products = st.products.map((p) => ({ icon: byId.get(p.id)?.icon, image: byId.get(p.id)?.image, ...p }));
        }
        return st;
      },
    },
  ),
);

export function useListTotals() {
  const products = useStore((s) => s.products);
  const lines = useStore((s) => s.lines);
  const byId = new Map(products.map((p) => [p.id, p]));
  let total = 0, units = 0;
  const rows = lines.flatMap((l) => {
    const p = byId.get(l.id);
    if (!p) return [];
    total += p.buy * l.qty;
    units += l.qty;
    return [{ product: p, qty: l.qty }];
  });
  return { rows, total, units };
}
