import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { AccordionItem } from "@/components/ui/Accordion";
import { ProductActions } from "@/components/storefront/ProductActions";
import { formatCurrency } from "@/lib/format";
import { unsplash } from "@/lib/stock-images";

type Dimensions = { height?: string; width?: string; depth?: string };
type Color = { name: string; hex: string };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const t = await getTranslations("Product");

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    include: { vendor: { select: { id: true, brandName: true, slug: true, tagline: true, status: true } } },
  });

  if (!product || product.vendor.status === "SUSPENDED") notFound();

  const dimensions = (product.dimensions as Dimensions) ?? {};
  const colors = (product.colors as Color[]) ?? [];

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-section-gap">
        {/* Gallery */}
        <div className="relative aspect-[3/4] bg-surface-container-high overflow-hidden">
          <Image
            src={unsplash(product.images[0], { w: 1200 })}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Info panel */}
        <div className="flex flex-col justify-center py-8 lg:ps-12">
          <Link
            href={`/designers/${product.vendor.slug}`}
            className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors mb-4"
          >
            {product.vendor.brandName}
          </Link>
          <h1 className="font-display text-headline-lg text-primary mb-4">{product.name}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
            {formatCurrency(product.price.toString(), product.currency)}
          </p>

          <ProductActions
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={Number(product.price)}
            currency={product.currency}
            image={product.images[0]}
            vendorId={product.vendor.id}
            vendorName={product.vendor.brandName}
            colors={colors}
            sizes={product.sizes}
          />

          <div>
            <AccordionItem title={t("detailsAndDimensions")} defaultOpen>
              <p className="mb-2">{product.description}</p>
              {(dimensions.height || dimensions.width || dimensions.depth) && (
                <p>
                  {t("dimensions", {
                    height: dimensions.height ?? "—",
                    width: dimensions.width ?? "—",
                    depth: dimensions.depth ?? "—",
                  })}
                </p>
              )}
              {product.materials.length > 0 && <p className="mt-2">{t("materials", { list: product.materials.join(", ") })}</p>}
            </AccordionItem>
            <AccordionItem title={t("shippingAndReturns")}>{t("shippingCopy")}</AccordionItem>
          </div>
        </div>
      </div>

      {/* Editorial bento */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="bg-surface-container p-8 md:p-12 flex flex-col justify-center">
          <p className="font-display text-headline-sm text-primary italic mb-4">
            &ldquo;{t("designerQuote")}&rdquo;
          </p>
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {product.vendor.brandName}
          </p>
        </div>
        <div className="relative aspect-[4/3] md:aspect-auto bg-surface-container-high overflow-hidden">
          <Image
            src={unsplash(product.images[0], { w: 1200 })}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>
    </div>
  );
}
