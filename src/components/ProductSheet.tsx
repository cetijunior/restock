import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "../lib/store";
import type { Product } from "../lib/types";
import { lek, margin } from "../lib/format";
import { Btn, Field, Sheet, Thumb, inputCls, toast } from "./ui";

export function ProductSheet({ product, onClose }: { product: Product | "new" | null; onClose: () => void }) {
  return (
    <Sheet open={product !== null} onClose={onClose} title={product === "new" ? "Produkt i ri" : "Ndrysho produktin"}>
      {product && <Form key={product === "new" ? "new" : product.id} product={product === "new" ? null : product} onClose={onClose} />}
    </Sheet>
  );
}

function Form({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { products, upsertProduct, deleteProduct, setQty } = useStore();
  const categories = [...new Set(products.map((p) => p.category))].sort((a, b) => a.localeCompare(b, "sq"));
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "Të Tjera");
  const [buy, setBuy] = useState(product ? String(product.buy) : "");
  const [sell, setSell] = useState(product ? String(product.sell) : "");
  const [qty, setQ] = useState("");
  const [icon, setIcon] = useState(product?.icon ?? "📦");
  const [image, setImage] = useState(product?.image ?? "");
  const [confirm, setConfirm] = useState(false);

  const b = Number(buy), s = Number(sell) || 0;
  const dupe = products.some((p) => p.id !== product?.id && p.name.toLowerCase() === name.trim().toLowerCase());
  const valid = name.trim() && b > 0 && !dupe;
  const m = margin(b, s);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const id = upsertProduct({ id: product?.id, name: name.trim(), category: category.trim() || "Të Tjera", buy: b, sell: s, icon: icon.trim() || "📦", image: /^https?:\/\//.test(image.trim()) ? image.trim() : undefined });
    if (Number(qty) > 0) setQty(id, Number(qty));
    toast(product ? "Produkti u përditësua" : "Produkti u shtua");
    onClose();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Emri"><input autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="p.sh. Coca-Cola 1.5L" /></Field>
      {dupe && <p className="-mt-2 text-sm text-danger">Ky produkt ekziston tashmë.</p>}
      <div className="flex items-end gap-3">
        <Thumb key={image} image={image || undefined} icon={icon} size="size-[50px]" />
        <Field label="Ikona"><input className={inputCls + " w-16 text-center text-xl"} value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4} /></Field>
        <div className="flex-1"><Field label="Link fotoje (opsionale)"><input className={inputCls} inputMode="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" /></Field></div>
      </div>
      <Field label="Kategoria">
        <input className={inputCls} list="cats" value={category} onChange={(e) => setCategory(e.target.value)} />
        <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Blerje (L)"><input className={inputCls} inputMode="decimal" type="number" value={buy} onChange={(e) => setBuy(e.target.value)} /></Field>
        <Field label="Shitje (L)"><input className={inputCls} inputMode="decimal" type="number" value={sell} onChange={(e) => setSell(e.target.value)} /></Field>
      </div>
      {m !== null && b > 0 && (
        <p className="text-sm text-mute">Fitimi: <b className="text-ink">{lek(s - b)}</b> / copë · marzh <b className={m < 0 ? "text-danger" : "text-accent"}>{m.toFixed(0)}%</b></p>
      )}
      {!product && <Field label="Shto në listë (sasia, opsionale)"><input className={inputCls} inputMode="numeric" type="number" value={qty} onChange={(e) => setQ(e.target.value)} placeholder="0" /></Field>}
      <div className="flex gap-2 pt-1">
        {product && (
          <Btn type="button" variant="danger" onClick={() => (confirm ? (deleteProduct(product.id), toast("Produkti u fshi"), onClose()) : setConfirm(true))}>
            <Trash2 size={16} /> {confirm ? "Konfirmo" : "Fshi"}
          </Btn>
        )}
        <Btn type="submit" variant="primary" disabled={!valid} className="flex-1">{product ? "Ruaj" : "Shto produktin"}</Btn>
      </div>
    </form>
  );
}
