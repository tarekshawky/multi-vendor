import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { unsplash, stockImages } from "@/lib/stock-images";
import { formatDate } from "@/lib/format";

type FeedItem = {
  id: string;
  title: string;
  excerpt: string | null;
  image: string;
  href: string;
  date: Date | null;
  byline: string;
};

function resolveImage(image: string | null) {
  const src = image || stockImages.boutiqueInterior;
  return src.startsWith("http") ? unsplash(src, { w: 1600 }) : src;
}

export default async function EditorialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Editorial");

  const [publishedStories, collectionStories] = await Promise.all([
    prisma.story.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { author: { select: { name: true } } },
    }),
    prisma.collection.findMany({
      where: { status: "ACTIVE", editorialDescription: { not: null }, vendor: { status: "ACTIVE" } },
      orderBy: { publishedAt: "desc" },
      include: { vendor: { select: { brandName: true, slug: true } } },
    }),
  ]);

  const feed: FeedItem[] = [
    ...publishedStories.map((s) => ({
      id: `story-${s.id}`,
      title: s.title,
      excerpt: s.excerpt,
      image: resolveImage(s.coverImage),
      href: `/editorial/${s.slug}`,
      date: s.publishedAt,
      byline: s.author.name,
    })),
    ...collectionStories.map((c) => ({
      id: `collection-${c.id}`,
      title: c.name,
      excerpt: c.editorialDescription,
      image: resolveImage(c.heroImage),
      href: `/designers/${c.vendor.slug}`,
      date: c.publishedAt,
      byline: c.vendor.brandName,
    })),
  ].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

  const [featured, ...rest] = feed;

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap pt-8">
      <h1 className="font-display text-headline-lg text-primary mb-4">{t("title")}</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-16">{t("subtitle")}</p>

      {feed.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("empty")}</p>
      ) : (
        <>
          {featured && (
            <Link href={featured.href} className="group block mb-section-gap">
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-container-high mb-6">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-3">
                {featured.byline}
                {featured.date && <> · {formatDate(featured.date, locale)}</>}
              </p>
              <h2 className="font-display text-headline-lg text-primary mb-3">{featured.title}</h2>
              {featured.excerpt && (
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">{featured.excerpt}</p>
              )}
            </Link>
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {rest.map((item) => (
                <Link key={item.id} href={item.href} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-high mb-4">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-2">
                    {item.byline}
                  </p>
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-2">{item.title}</h3>
                  {item.excerpt && <p className="font-body-md text-on-surface-variant line-clamp-2">{item.excerpt}</p>}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
