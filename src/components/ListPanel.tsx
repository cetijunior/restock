import { ClipboardList, Copy, FileDown, MessageCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useListTotals, useStore } from "../lib/store";
import { share, toPdf, toText, whatsapp } from "../lib/export";
import { lek } from "../lib/format";
import type { OrderLine } from "../lib/types";
import { Btn, Stepper, Thumb, inputCls, toast } from "./ui";

export function ListPanel({ onBrowse }: { onBrowse: () => void }) {
  const { rows, total, units } = useListTotals();
  const { supplier, note, setMeta, setQty, clearList, saveOrder } = useStore();
  const [confirmClear, setConfirmClear] = useState(false);

  const lines: OrderLine[] = rows.map(({ product: p, qty }) => ({ name: p.name, category: p.category, buy: p.buy, qty }));
  const doc = { lines, supplier, note };

  const finish = (action: "pdf" | "wa" | "copy") => async () => {
    if (action === "pdf") await toPdf(doc);
    if (action === "wa") whatsapp(toText(doc));
    if (action === "copy") toast((await share(toText(doc))) === "copied" ? "U kopjua" : "U ndau");
    saveOrder();
    if (action === "pdf") toast("PDF u shkarkua · porosia u ruajt");
  };

  if (!rows.length)
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-14 text-center text-mute">
        <ClipboardList size={36} />
        <p className="font-semibold text-ink">Lista është bosh</p>
        <p className="text-sm">Prek produktet në katalog për t'i shtuar.</p>
        <Btn variant="primary" onClick={onBrowse} className="lg:hidden">Shko te katalogu</Btn>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Artikuj" value={String(rows.length)} />
        <Stat label="Copë" value={String(units)} />
        <Stat label="Totali" value={lek(total)} accent />
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
        {rows.map(({ product: p, qty }) => (
          <li key={p.id} className="flex items-center gap-3 px-3 py-3">
            <Thumb image={p.image} icon={p.icon} size="size-14 text-3xl" />
            <div className="min-w-0 flex-1">
              <div className="line-clamp-2 text-[15px] font-semibold leading-tight">{p.name}</div>
              <div className="tabular font-mono text-xs text-mute">{qty} × {lek(p.buy)} = <span className="text-ink">{lek(qty * p.buy)}</span></div>
            </div>
            <Stepper qty={qty} size="lg" onBump={(d) => setQty(p.id, qty + d)} onSet={(n) => setQty(p.id, n)} />
          </li>
        ))}
      </ul>

      <div className="grid gap-2">
        <input className={inputCls} placeholder="Furnitori (opsionale)" value={supplier} onChange={(e) => setMeta({ supplier: e.target.value })} />
        <textarea className={inputCls + " min-h-16 resize-none"} placeholder="Shënim për porosinë…" value={note} onChange={(e) => setMeta({ note: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Btn variant="primary" onClick={finish("wa")} className="col-span-2 py-3.5 text-[15px]"><MessageCircle size={18} /> Dërgo në WhatsApp</Btn>
        <Btn onClick={finish("pdf")}><FileDown size={16} /> PDF</Btn>
        <Btn onClick={finish("copy")}><Copy size={16} /> Kopjo / Ndaj</Btn>
        <Btn variant="danger" className="col-span-2" onClick={() => (confirmClear ? (clearList(), setConfirmClear(false), toast("Lista u pastrua")) : setConfirmClear(true))} onBlur={() => setConfirmClear(false)}>
          <Trash2 size={16} /> {confirmClear ? "Prek përsëri për ta pastruar" : "Pastro listën"}
        </Btn>
      </div>
    </div>
  );
}

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="rounded-2xl border border-line bg-panel px-3 py-2.5">
    <div className="text-[11px] font-semibold uppercase tracking-wide text-mute">{label}</div>
    <div className={"tabular truncate font-mono text-lg font-semibold " + (accent ? "text-accent" : "")}>{value}</div>
  </div>
);
