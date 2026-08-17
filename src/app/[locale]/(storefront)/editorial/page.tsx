import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { unsplash } from "@/lib/stock-images";
import { formatDate } from "@/lib/format";

export default async function EditorialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Editorial");

  const stories = await prisma.collection.findMany({
    where: { status: "ACTIVE", editorialDescription: { not: null } },
    orderBy: { publishedAt: "desc" },
    include: { vendor: { select: { brandName: true, slug: true } } },
  });

  const [featured, ...rest] = stories;

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap pt-8">
      <h1 className="font-display text-headline-lg text-primary mb-4">{t("title")}</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-16">{t("subtitle")}</p>

      {stories.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("empty")}</p>
      ) : (
        <>
          {featured && (
            <Link href={`/designers/${featured.vendor.slug}`} className="group block mb-section-gap">
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-container-high mb-6">
                <Image
                  src={unsplash(featured.heroImage ?? "", { w: 1600 })}
                  alt={featured.name}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-3">
                {featured.vendor.brandName}
                {featured.publishedAt && <> · {formatDate(featured.publishedAt, locale)}</>}
              </p>
              <h2 className="font-display text-headline-lg text-primary mb-3">{featured.name}</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                {featured.editorialDescription}
              </p>
            </Link>
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {rest.map((story) => (
                <Link key={story.id} href={`/designers/${story.vendor.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-high mb-4">
                    <Image
                      src={unsplash(story.heroImage ?? "", { w: 800 })}
                      alt={story.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-2">
                    {story.vendor.brandName}
                  </p>
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-2">{story.name}</h3>
                  <p className="font-body-md text-on-surface-variant line-clamp-2">{story.editorialDescription}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
