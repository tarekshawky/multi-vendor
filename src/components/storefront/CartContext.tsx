"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  vendorId: string;
  vendorName: string;
  color?: string;
  size?: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  updateQty: (productId: string, color: string | undefined, size: string | undefined, qty: number) => void;
  clear: () => void;
  totalCount: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "vogue-chic-cart";

function lineKey(productId: string, color?: string, size?: string) {
  return [productId, color ?? "", size ?? ""].join("::");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage: initial state must stay []
    // to match SSR output, so this can only be read post-mount.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const key = lineKey(item.productId, item.color, item.size);
      const existing = prev.find((i) => lineKey(i.productId, i.color, i.size) === key);
      if (existing) {
        return prev.map((i) => (lineKey(i.productId, i.color, i.size) === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, color?: string, size?: string) => {
    const key = lineKey(productId, color, size);
    setItems((prev) => prev.filter((i) => lineKey(i.productId, i.color, i.size) !== key));
  }, []);

  const updateQty = useCallback(
    (productId: string, color: string | undefined, size: string | undefined, qty: number) => {
      const key = lineKey(productId, color, size);
      setItems((prev) =>
        qty <= 0
          ? prev.filter((i) => lineKey(i.productId, i.color, i.size) !== key)
          : prev.map((i) => (lineKey(i.productId, i.color, i.size) === key ? { ...i, qty } : i)),
      );
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQty,
    clear,
    totalCount,
    subtotal,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
