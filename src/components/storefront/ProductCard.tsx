import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/format";
import { unsplash } from "@/lib/stock-images";

type ProductCardProps = {
  slug: string;
  name: string;
  price: number | string;
  currency: string;
  image: string;
  vendorName?: string;
};

export function ProductCard({ slug, name, price, currency, image, vendorName }: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container-high mb-4">
        <Image
          src={unsplash(image, { w: 800 })}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      {vendorName && (
        <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-1">
          {vendorName}
        </p>
      )}
      <h3 className="font-body-md text-body-md text-primary truncate">{name}</h3>
      <p className="font-label-caps text-label-caps text-on-surface-variant mt-1">
        {formatCurrency(price, currency)}
      </p>
    </Link>
  );
}
