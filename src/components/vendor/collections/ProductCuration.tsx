"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatCurrency } from "@/lib/format";
import { unsplash } from "@/lib/stock-images";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
};

type ProductCurationProps = {
  products: Product[];
  initiallySelected: string[];
  currency: string;
  locale: string;
  status: string;
  labels: {
    itemsSelected: string;
    totalValue: string;
    publish: string;
    saveDraft: string;
  };
};

export function ProductCuration({ products, initiallySelected, currency, locale, status, labels }: ProductCurationProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initiallySelected));

  const totalValue = useMemo(
    () => products.filter((p) => selected.has(p.id)).reduce((sum, p) => sum + Number(p.price), 0),
    [products, selected],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter items-start">
      <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8">
        {products.map((product) => (
          <label key={product.id} className="group cursor-pointer block">
            <div className="relative aspect-square overflow-hidden bg-surface-container-high mb-2">
              <Image
                src={unsplash(product.image, { w: 400 })}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 start-3 z-10">
                <Checkbox
                  name="productIds"
                  value={product.id}
                  checked={selected.has(product.id)}
                  onChange={() => toggle(product.id)}
                />
              </div>
            </div>
            <h3 className="font-body-md text-body-md text-primary truncate">{product.name}</h3>
            <p className="font-label-caps text-label-caps text-on-surface-variant mt-1">
              {formatCurrency(product.price, currency, locale)}
            </p>
          </label>
        ))}
      </div>

      <div className="lg:col-span-1 sticky top-8 bg-surface-container-lowest border border-outline-variant/20 p-6 space-y-6">
        <StatusPill label={status} tone="positive" />
        <div>
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {labels.itemsSelected}
          </p>
          <p className="font-headline-lg text-headline-lg text-primary mt-1">{selected.size}</p>
        </div>
        <div>
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {labels.totalValue}
          </p>
          <p className="font-headline-sm text-headline-sm text-primary mt-1">
            {formatCurrency(totalValue, currency, locale)}
          </p>
        </div>
        <div className="space-y-3">
          <Button type="submit" name="action" value="publish" className="w-full">
            {labels.publish}
          </Button>
          <Button type="submit" name="action" value="draft" variant="secondary" className="w-full">
            {labels.saveDraft}
          </Button>
        </div>
      </div>
    </div>
  );
}
