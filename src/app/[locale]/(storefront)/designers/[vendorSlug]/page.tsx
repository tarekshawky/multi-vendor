import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { unsplash } from "@/lib/stock-images";

export default async function DesignerStorefrontPage({
  params,
}: {
  params: Promise<{ vendorSlug: string }>;
}) {
  const { vendorSlug } = await params;
  const t = await getTranslations("Storefront");

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug: vendorSlug },
    include: {
      collections: { where: { status: "ACTIVE" }, orderBy: { publishedAt: "desc" } },
      products: { orderBy: { unitsSold: "desc" }, take: 4 },
    },
  });

  if (!vendor) notFound();

  return (
    <>
      {/* Hero */}
      <section className="relative w-full h-[70vh] flex items-end px-margin-mobile md:px-margin-desktop pb-16 mb-section-gap">
        <div className="absolute inset-0 z-0">
          <Image
            src={unsplash(vendor.heroImage ?? vendor.coverImage ?? "", { w: 1920 })}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-inverse-surface/30" />
        </div>
        <div className="relative z-10 max-w-container-max mx-auto w-full">
          <h1 className="font-display text-display-lg-mobile md:text-display-lg text-inverse-on-surface mb-4">
            {vendor.brandName}
          </h1>
          {vendor.tagline && (
            <p className="font-body-lg text-body-lg text-inverse-on-surface italic max-w-lg">{vendor.tagline}</p>
          )}
        </div>
      </section>

      {/* About the House */}
      {vendor.bio && (
        <section className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop text-center mb-section-gap">
          <h2 className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-6">
            {t("aboutTheHouse")}
          </h2>
          <p className="font-body-lg text-body-lg text-primary">{vendor.bio}</p>
        </section>
      )}

      {/* Featured Collections */}
      {vendor.collections.length > 0 && (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-12">{t("featuredCollections")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {vendor.collections.map((collection) => (
              <Link key={collection.id} href={`/collections?category=${collection.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-high mb-4">
                  <Image
                    src={unsplash(collection.heroImage ?? "", { w: 1200 })}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">{collection.name}</h3>
                <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mt-2">
                  {t("exploreCollection")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Signature Pieces */}
      {vendor.products.length > 0 && (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-12">{t("signaturePieces")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-gutter">
            {vendor.products.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price.toString()}
                currency={product.currency}
                image={product.images[0]}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
