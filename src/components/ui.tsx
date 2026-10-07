import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { create } from "zustand";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function Stepper({ qty, onBump, onSet, size = "md" }: { qty: number; onBump: (d: number) => void; onSet: (n: number) => void; size?: "md" | "lg" }) {
  const b = size === "lg" ? "size-11" : "size-9";
  return (
    <div className="anim-pop flex items-center rounded-full bg-accent text-accent-ink shadow-sm" onClick={(e) => e.stopPropagation()}>
      <button aria-label="Zbrit" onClick={() => onBump(-1)} className={cx(b, "grid place-items-center rounded-full active:bg-black/10")}><Minus size={16} strokeWidth={2.75} /></button>
      <input
        aria-label="Sasia" inputMode="numeric" type="number" value={qty}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onSet(Number(e.target.value))}
        className="tabular w-9 bg-transparent text-center font-mono text-[15px] font-semibold outline-none"
      />
      <button aria-label="Shto" onClick={() => onBump(1)} className={cx(b, "grid place-items-center rounded-full active:bg-black/10")}><Plus size={16} strokeWidth={2.75} /></button>
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}
        className="anim-up max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-panel p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button aria-label="Mbyll" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-raised text-mute"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wide text-mute">{label}</span>{children}</label>
);
export const inputCls = "w-full rounded-xl border border-line bg-raised px-3.5 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

export function Btn({ variant = "ghost", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button {...p} className={cx(
      "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[.97] disabled:pointer-events-none disabled:opacity-40",
      variant === "primary" && "bg-accent text-accent-ink hover:brightness-110",
      variant === "ghost" && "border border-line bg-raised hover:bg-line",
      variant === "danger" && "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/15",
      className)} />
  );
}

const useToastStore = create<{ msg: string | null; n: number }>(() => ({ msg: null, n: 0 }));
let t: ReturnType<typeof setTimeout>;
export const toast = (msg: string) => {
  useToastStore.setState((s) => ({ msg, n: s.n + 1 }));
  clearTimeout(t);
  t = setTimeout(() => useToastStore.setState({ msg: null }), 2200);
};
export function Toaster() {
  const { msg, n } = useToastStore();
  if (!msg) return null;
  return (
    <div key={n} role="status" className="anim-up fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-bg shadow-xl">{msg}</div>
  );
}

export function Thumb({ image, icon, size = "size-11" }: { image?: string; icon?: string; size?: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={cx(size, "grid shrink-0 place-items-center overflow-hidden rounded-xl bg-raised text-xl ring-1 ring-line")}>
      {image && !broken
        ? <img src={image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBroken(true)} className="size-full bg-white object-contain p-0.5" />
        : <span aria-hidden>{icon || "📦"}</span>}
    </div>
  );
}
