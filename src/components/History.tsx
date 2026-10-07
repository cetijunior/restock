import { ChevronDown, FileDown, History as HistoryIcon, MessageCircle, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "../lib/store";
import { toPdf, toText, whatsapp } from "../lib/export";
import { dateLabel, lek } from "../lib/format";
import { Btn, cx, toast } from "./ui";

export function History({ onLoaded }: { onLoaded: () => void }) {
  const { orders, loadOrder, deleteOrder } = useStore();
  const [open, setOpen] = useState<string | null>(null);

  if (!orders.length)
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-14 text-center text-mute">
        <HistoryIcon size={36} />
        <p className="font-semibold text-ink">Asnjë porosi ende</p>
        <p className="text-sm">Porositë ruhen automatikisht kur i dërgon ose shkarkon.</p>
      </div>
    );

  const month = orders.filter((o) => Date.now() - o.createdAt < 30 * 864e5).reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-3">
      <p className="text-sm text-mute">30 ditët e fundit: <b className="tabular font-mono text-ink">{lek(month)}</b> në {orders.filter((o) => Date.now() - o.createdAt < 30 * 864e5).length} porosi</p>
      {orders.map((o) => (
        <div key={o.id} className="overflow-hidden rounded-2xl border border-line bg-panel">
          <button className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => setOpen(open === o.id ? null : o.id)}>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{dateLabel(o.createdAt)}{o.supplier && <span className="text-mute"> · {o.supplier}</span>}</div>
              <div className="text-xs text-mute">{o.lines.length} artikuj · {o.lines.reduce((s, l) => s + l.qty, 0)} copë</div>
            </div>
            <div className="tabular font-mono font-semibold">{lek(o.total)}</div>
            <ChevronDown size={18} className={cx("text-mute transition", open === o.id && "rotate-180")} />
          </button>
          {open === o.id && (
            <div className="anim-up space-y-3 border-t border-line px-4 py-3">
              <ul className="space-y-1 text-sm">
                {o.lines.map((l) => (
                  <li key={l.name} className="flex justify-between gap-3"><span className="truncate"><b className="tabular font-mono">{l.qty}×</b> {l.name}</span><span className="tabular font-mono text-mute">{lek(l.qty * l.buy)}</span></li>
                ))}
              </ul>
              {o.note && <p className="text-sm text-mute">Shënim: {o.note}</p>}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Btn variant="primary" onClick={() => { loadOrder(o); toast("Porosia u ngarkua në listë"); onLoaded(); }}><RotateCcw size={15} /> Përsërit</Btn>
                <Btn onClick={() => whatsapp(toText(o))}><MessageCircle size={15} /> WhatsApp</Btn>
                <Btn onClick={() => toPdf(o)}><FileDown size={15} /> PDF</Btn>
                <Btn variant="danger" onClick={() => { deleteOrder(o.id); toast("Porosia u fshi"); }}><Trash2 size={15} /> Fshi</Btn>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
