"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/storefront/CartContext";
import { Icon } from "@/components/ui/icons/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/format";
import { unsplash } from "@/lib/stock-images";
import { useRouter, usePathname } from "@/i18n/navigation";
import { checkoutCart } from "@/server/actions/checkout";
import type { PaymentMethod } from "@/generated/prisma/client";

const paymentOptions: { method: PaymentMethod; icon: string; labelKey: "paymentCard" | "paymentCOD" | "paymentWallet" }[] = [
  { method: "CARD", icon: "credit_card", labelKey: "paymentCard" },
  { method: "COD", icon: "local_shipping", labelKey: "paymentCOD" },
  { method: "WALLET", icon: "account_balance_wallet", labelKey: "paymentWallet" },
];

export function CartDrawer() {
  const t = useTranslations("Cart");
  const { items, removeItem, updateQty, subtotal, isOpen, close, clear } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<"cart" | "payment">("cart");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cardLast4, setCardLast4] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [confirmation, setConfirmation] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleClose() {
    close();
    setStep("cart");
    setPaymentMethod(null);
    setCardLast4("");
    setError(null);
  }

  function handleProceedToPayment() {
    setError(null);
    if (status !== "authenticated" || !session?.user) {
      handleClose();
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    setStep("payment");
  }

  const canPlaceOrder = paymentMethod === "COD" || paymentMethod === "WALLET" || (paymentMethod === "CARD" && /^\d{4}$/.test(cardLast4));

  async function handlePlaceOrder() {
    if (!paymentMethod || !canPlaceOrder) return;
    setError(null);
    setCheckingOut(true);
    try {
      const result = await checkoutCart(
        items.map((i) => ({ productId: i.productId, qty: i.qty, color: i.color, size: i.size })),
        { method: paymentMethod, cardLast4: paymentMethod === "CARD" ? cardLast4 : undefined },
      );
      if (result.ok) {
        setConfirmation(result.orderNumbers);
        clear();
        setStep("cart");
        setPaymentMethod(null);
        setCardLast4("");
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
        onClick={handleClose}
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md h-screen bg-surface flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/30">
          <h2 className="font-headline-sm text-headline-sm text-primary">{t("title")}</h2>
          <button type="button" aria-label={t("close")} onClick={handleClose} className="text-primary hover:opacity-70 transition-opacity">
            <Icon name="close" />
          </button>
        </div>

        {confirmation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <Icon name="check_circle" size={48} className="text-primary mb-6" />
            <h3 className="font-display text-headline-sm text-primary mb-3">{t("orderPlaced")}</h3>
            <p className="text-on-surface-variant mb-6">{t("orderNumbers", { numbers: confirmation.join(", ") })}</p>
            <button type="button" onClick={handleClose} className={buttonClasses("primary", "md")}>
              {t("continueShopping")}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <Icon name="shopping_bag" size={40} className="text-on-surface-variant mb-4" />
            <p className="text-on-surface-variant">{t("empty")}</p>
          </div>
        ) : step === "payment" ? (
          <>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-3">
                {t("paymentMethodTitle")}
              </p>
              {paymentOptions.map((option) => (
                <button
                  key={option.method}
                  type="button"
                  onClick={() => setPaymentMethod(option.method)}
                  className={`w-full flex items-center gap-4 px-4 py-4 border transition-colors duration-300 text-start ${
                    paymentMethod === option.method
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant/50 text-primary hover:border-primary"
                  }`}
                >
                  <Icon name={option.icon} weight={300} />
                  <span className="font-label-caps text-label-caps uppercase tracking-widest">{t(option.labelKey)}</span>
                </button>
              ))}

              {paymentMethod === "CARD" && (
                <div className="pt-2 space-y-2">
                  <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {t("cardLast4Label")}
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder={t("cardLast4Placeholder")}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-32"
                  />
                  {cardLast4.length > 0 && cardLast4.length < 4 && (
                    <p className="text-error text-xs">{t("cardLast4Error")}</p>
                  )}
                </div>
              )}
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
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  disabled={checkingOut}
                  className={buttonClasses("secondary", "lg")}
                >
                  {t("back")}
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={checkingOut || !canPlaceOrder}
                  className={buttonClasses("primary", "lg", "flex-1")}
                >
                  {checkingOut ? t("processing") : t("placeOrder")}
                </button>
              </div>
            </div>
          </>
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
                onClick={handleProceedToPayment}
                className={buttonClasses("primary", "lg", "w-full")}
              >
                {t("checkout")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
