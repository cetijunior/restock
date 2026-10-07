const nf = new Intl.NumberFormat("sq-AL", { maximumFractionDigits: 0 });
export const lek = (n: number) => `${nf.format(Math.round(n))} L`;

export const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export const dateLabel = (t: number) =>
  new Date(t).toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" });

export const margin = (buy: number, sell: number) => (sell > 0 ? ((sell - buy) / sell) * 100 : null);

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
