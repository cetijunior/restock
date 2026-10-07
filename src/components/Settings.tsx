import { Download, RefreshCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useStore } from "../lib/store";
import { downloadJson } from "../lib/export";
import { lek } from "../lib/format";
import type { Product } from "../lib/types";
import { Btn, toast } from "./ui";

export function Settings() {
  const { products, orders, replaceProducts, resetCatalog } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const value = products.reduce((s, p) => s + p.buy, 0);

  const importFile = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      const list = (Array.isArray(data) ? data : data.products) as Partial<Product & { buy_price: number; sell_price: number }>[];
      const clean: Product[] = list.flatMap((p, i) => {
        const buy = Number(p.buy ?? p.buy_price), name = String(p.name ?? "").trim();
        return name && buy > 0 ? [{ id: p.id ?? `imp-${i}-${Date.now().toString(36)}`, name, category: p.category || "Të Tjera", buy, sell: Number(p.sell ?? p.sell_price) || 0 }] : [];
      });
      if (!clean.length) throw new Error();
      replaceProducts(clean);
      toast(`U importuan ${clean.length} produkte`);
    } catch {
      toast("Skedar i pavlefshëm");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["Produkte", products.length], ["Kategori", new Set(products.map((p) => p.category)).size], ["Porosi", orders.length]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-line bg-panel py-3"><div className="tabular font-mono text-xl font-semibold">{v}</div><div className="text-xs text-mute">{l}</div></div>
        ))}
      </div>
      <p className="text-sm text-mute">Mesatarja e çmimit të blerjes: <b className="tabular font-mono text-ink">{lek(value / Math.max(products.length, 1))}</b>. Të dhënat ruhen në këtë pajisje dhe punojnë edhe pa internet.</p>

      <section className="space-y-2 rounded-2xl border border-line bg-panel p-4">
        <h3 className="font-semibold">Katalogu</h3>
        <p className="text-sm text-mute">Ruaj një kopje rezervë ose kalo katalogun në një telefon tjetër.</p>
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => downloadJson({ products, orders }, `furnizim-backup-${new Date().toISOString().slice(0, 10)}.json`)}><Download size={16} /> Eksporto</Btn>
          <Btn onClick={() => file.current?.click()}><Upload size={16} /> Importo</Btn>
        </div>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        <Btn variant="danger" className="w-full" onClick={() => (confirmReset ? (resetCatalog(), setConfirmReset(false), toast("Katalogu u rivendos")) : setConfirmReset(true))}>
          <RefreshCcw size={16} /> {confirmReset ? "Konfirmo — humbasin ndryshimet" : "Rivendos katalogun origjinal"}
        </Btn>
      </section>
    </div>
  );
}
