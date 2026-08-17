import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { stockImages, unsplash } from "@/lib/stock-images";
import { formatDate } from "@/lib/format";

function sectionHeader(title: string, cta: string, href: string) {
  return (
    <div className="flex items-center justify-between mb-12">
      <h2 className="font-display text-headline-lg text-primary">{title}</h2>
      <Link
        href={href}
        className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap ms-6"
      >
        {cta}
      </Link>
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Home");

  const [newArrivals, categories, designers, stories] = await Promise.all([
    prisma.product.findMany({
      where: { vendor: { status: "ACTIVE" } },
      orderBy: { createdAt: "desc" },
      include: { vendor: { select: { brandName: true } } },
      take: 4,
    }),
    prisma.product.findMany({
      where: { category: { not: null }, vendor: { status: "ACTIVE" } },
      select: { category: true },
      distinct: ["category"],
      take: 5,
    }),
    prisma.vendorProfile.findMany({
      where: { status: "ACTIVE" },
      orderBy: { brandName: "asc" },
      take: 2,
    }),
    prisma.story.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { author: { select: { name: true } } },
      take: 3,
    }),
  ]);

  return (
    <>
      {/* Hero editorial section */}
      <section className="w-full h-[80vh] md:h-[90vh] relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex items-center justify-center mb-section-gap">
        <div className="absolute inset-0 z-0 px-margin-mobile md:px-margin-desktop pt-8 pb-16">
          <div className="w-full h-full relative overflow-hidden bg-surface-container-high">
            <Image
              src={unsplash(stockImages.heroHome, { w: 1920, q: 80 })}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl bg-surface/30 backdrop-blur-sm p-8 md:p-12 border border-outline-variant/10 shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
          <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-6">
            {t("heroTitle")}
          </h1>
          <p className="font-body-lg text-body-lg text-primary mb-8 max-w-lg">{t("heroDescription")}</p>
          <Link href="/collections" className={buttonClasses("primary", "lg")}>
            {t("heroCta")}
          </Link>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
          {sectionHeader(t("newArrivalsTitle"), t("newArrivalsCta"), "/collections")}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-gutter">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price.toString()}
                currency={product.currency}
                image={product.images[0]}
                vendorName={product.vendor.brandName}
              />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
          <h2 className="font-display text-headline-lg text-primary mb-12">{t("shopByCategoryTitle")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/collections?category=${encodeURIComponent(c.category!)}`}
                className="group border border-outline-variant/30 hover:border-primary transition-colors flex items-center justify-center py-12 px-4 text-center"
              >
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                  {c.category}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {designers.length > 0 && (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
          {sectionHeader(t("featuredDesignersTitle"), t("featuredDesignersCta"), "/designers")}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {designers.map((vendor) => (
              <Link key={vendor.id} href={`/designers/${vendor.slug}`} className="group block">
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-container-high mb-4">
                  <Image
                    src={unsplash(vendor.heroImage ?? stockImages.boutiqueInterior, { w: 1200 })}
                    alt={vendor.brandName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">{vendor.brandName}</h3>
                {vendor.tagline && <p className="font-body-md text-on-surface-variant mt-1">{vendor.tagline}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {stories.length > 0 && (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
          {sectionHeader(t("fromTheEditTitle"), t("fromTheEditCta"), "/editorial")}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {stories.map((story) => (
              <Link key={story.id} href={`/editorial/${story.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-high mb-4">
                  <Image
                    src={unsplash(story.coverImage ?? stockImages.boutiqueInterior, { w: 900 })}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-2">
                  {story.author.name}
                  {story.publishedAt && <> · {formatDate(story.publishedAt, locale)}</>}
                </p>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-2">{story.title}</h3>
                {story.excerpt && <p className="font-body-md text-on-surface-variant line-clamp-2">{story.excerpt}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
