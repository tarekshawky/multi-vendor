"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/storefront/CartContext";
import { Icon } from "@/components/ui/icons/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import { unsplash } from "@/lib/stock-images";
import { useRouter, usePathname } from "@/i18n/navigation";
import { checkoutCart } from "@/server/actions/checkout";

export function CartDrawer() {
  const t = useTranslations("Cart");
  const { items, removeItem, updateQty, subtotal, isOpen, close, clear } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingOut, setCheckingOut] = useState(false);
  const [confirmation, setConfirmation] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleCheckout() {
    setError(null);
    if (status !== "authenticated" || !session?.user) {
      close();
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setCheckingOut(true);
    try {
      const result = await checkoutCart(
        items.map((i) => ({ productId: i.productId, qty: i.qty, color: i.color, size: i.size })),
      );
      if (result.ok) {
        setConfirmation(result.orderNumbers);
        clear();
      } else {
        setError(t("checkoutError"));
      }
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        aria-label={t("close")}
        onClick={close}
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md h-screen bg-surface flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/30">
          <h2 className="font-headline-sm text-headline-sm text-primary">{t("title")}</h2>
          <button type="button" aria-label={t("close")} onClick={close} className="text-primary hover:opacity-70 transition-opacity">
            <Icon name="close" />
          </button>
        </div>

        {confirmation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <Icon name="check_circle" size={48} className="text-primary mb-6" />
            <h3 className="font-display text-headline-sm text-primary mb-3">{t("orderPlaced")}</h3>
            <p className="text-on-surface-variant mb-6">{t("orderNumbers", { numbers: confirmation.join(", ") })}</p>
            <button type="button" onClick={close} className={buttonClasses("primary", "md")}>
              {t("continueShopping")}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <Icon name="shopping_bag" size={40} className="text-on-surface-variant mb-4" />
            <p className="text-on-surface-variant">{t("empty")}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-4">
                  <div className="relative w-20 h-24 shrink-0 overflow-hidden bg-surface-container-high">
                    <Image src={unsplash(item.image, { w: 200 })} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                      {item.vendorName}
                    </p>
                    <p className="font-body-md text-primary truncate">{item.name}</p>
                    {(item.color || item.size) && (
                      <p className="text-sm text-on-surface-variant">
                        {[item.color, item.size].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 border border-outline-variant">
                        <button
                          type="button"
                          aria-label={t("decrease")}
                          onClick={() => updateQty(item.productId, item.color, item.size, item.qty - 1)}
                          className="px-2 py-1 text-primary hover:opacity-60"
                        >
                          −
                        </button>
                        <span className="text-sm">{item.qty}</span>
                        <button
                          type="button"
                          aria-label={t("increase")}
                          onClick={() => updateQty(item.productId, item.color, item.size, item.qty + 1)}
                          className="px-2 py-1 text-primary hover:opacity-60"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-label-caps text-label-caps text-primary">
                        {formatCurrency(item.price * item.qty, item.currency)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={t("remove")}
                    onClick={() => removeItem(item.productId, item.color, item.size)}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/30 px-8 py-6">
              <div className="flex items-center justify-between mb-6">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                  {t("subtotal")}
                </span>
                <span className="font-headline-sm text-headline-sm text-primary">
                  {formatCurrency(subtotal, items[0]?.currency ?? "USD")}
                </span>
              </div>
              {error && <p className="text-error text-sm mb-4">{error}</p>}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkingOut}
                className={buttonClasses("primary", "lg", "w-full")}
              >
                {checkingOut ? t("processing") : t("checkout")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
