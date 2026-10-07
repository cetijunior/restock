export type Product = { id: string; name: string; category: string; buy: number; sell: number; icon?: string; image?: string };
export type Line = { id: string; qty: number };
export type OrderLine = { name: string; category: string; buy: number; qty: number };
export type Order = { id: string; createdAt: number; supplier: string; note: string; lines: OrderLine[]; total: number };
