"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/storefront/CartContext";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Color = { name: string; hex: string };

type ProductActionsProps = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  vendorId: string;
  vendorName: string;
  colors: Color[];
  sizes: string[];
};

export function ProductActions({
  productId,
  slug,
  name,
  price,
  currency,
  image,
  vendorId,
  vendorName,
  colors,
  sizes,
}: ProductActionsProps) {
  const t = useTranslations("Product");
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState<string | undefined>(colors[0]?.name);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(sizes[0]);
  const [added, setAdded] = useState(false);

  function handleAddToBag() {
    addItem({ productId, slug, name, price, currency, image, vendorId, vendorName, color: selectedColor, size: selectedSize });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
      {colors.length > 0 && (
        <div className="mb-8">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-3">
            {t("color")}
            {selectedColor && <span className="text-primary normal-case tracking-normal"> — {selectedColor}</span>}
          </p>
          <div className="flex gap-3">
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => setSelectedColor(c.name)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 cursor-pointer transition-all",
                  selectedColor === c.name ? "border-primary" : "border-transparent hover:border-outline-variant",
                )}
              >
                <span className="block w-full h-full rounded-full border border-outline-variant/40" style={{ backgroundColor: c.hex }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="mb-8">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-3">
            {t("size")}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSize(s)}
                className={cn(
                  "px-4 py-2 border font-label-caps text-label-caps cursor-pointer transition-colors",
                  selectedSize === s
                    ? "bg-primary text-on-primary border-primary"
                    : "border-outline-variant text-primary hover:border-primary",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <button type="button" onClick={handleAddToBag} className={buttonClasses("primary", "lg", "flex-1")}>
          {added ? t("addedToBag") : t("addToBag")}
        </button>
        <button type="button" className={buttonClasses("secondary", "lg", "flex-1")}>
          {t("findInBoutique")}
        </button>
      </div>
    </>
  );
}
