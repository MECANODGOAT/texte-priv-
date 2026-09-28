"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, type CountryCode, type Currency } from "@/lib/catalog";

export type CartLine = {
  key: string;
  productId: string;
  name: string;
  color: string;
  hex: string;
  go: number;
  priceEur: number; // indicatif pour l'affichage : le serveur recalcule le prix
  qty: number;
};

type CartContext = {
  lines: CartLine[];
  count: number;
  country: CountryCode;
  currency: Currency;
  setCountry: (c: CountryCode) => void;
  add: (line: Omit<CartLine, "key" | "qty">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  toast: string;
};

const Ctx = createContext<CartContext | null>(null);
const STORAGE_KEY = "firniss-cart-v1";

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [country, setCountryState] = useState<CountryCode>("MA");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const loaded = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Le panier et le pays sont gardés dans le navigateur du client.
  useEffect(() => {
    const saved = read<{ lines: CartLine[]; country: CountryCode }>(STORAGE_KEY, { lines: [], country: "MA" });
    /* eslint-disable react-hooks/set-state-in-effect -- lecture unique du stockage local après l'hydratation */
    setLines(Array.isArray(saved.lines) ? saved.lines : []);
    setCountryState(saved.country === "GA" ? "GA" : "MA");
    /* eslint-enable react-hooks/set-state-in-effect */
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, country }));
    } catch {
      // Stockage indisponible (navigation privée) : le panier reste en mémoire.
    }
  }, [lines, country]);

  const add = useCallback<CartContext["add"]>((line) => {
    const key = `${line.productId}|${line.color}|${line.go}`;
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + 1, 10) } : l));
      return [...prev, { ...line, key, qty: 1 }];
    });
    setToast(`${line.name} ${line.color} ajouté au panier`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const value = useMemo<CartContext>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      country,
      currency: COUNTRIES[country].currency,
      setCountry: setCountryState,
      add,
      setQty: (key, qty) =>
        setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(qty, 10)) } : l))),
      remove: (key) => setLines((prev) => prev.filter((l) => l.key !== key)),
      clear: () => setLines([]),
      open,
      setOpen,
      toast,
    }),
    [lines, country, add, open, toast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>.");
  return ctx;
}
