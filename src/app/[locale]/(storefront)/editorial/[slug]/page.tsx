import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { unsplash, stockImages } from "@/lib/stock-images";
import { formatDate } from "@/lib/format";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("Editorial");

  const story = await prisma.story.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });

  if (!story || story.status !== "PUBLISHED") notFound();

  const imageSrc = story.coverImage
    ? story.coverImage.startsWith("http")
      ? unsplash(story.coverImage, { w: 1600 })
      : story.coverImage
    : unsplash(stockImages.boutiqueInterior, { w: 1600 });

  return (
    <article className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap pt-8">
      <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-4">
        {story.author.name}
        {story.publishedAt && <> · {formatDate(story.publishedAt, locale)}</>}
      </p>
      <h1 className="font-display text-headline-lg text-primary mb-8">{story.title}</h1>
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-container-high mb-8">
        <Image src={imageSrc} alt={story.title} fill priority sizes="100vw" className="object-cover" />
      </div>
      {story.excerpt && (
        <p className="font-body-lg text-body-lg text-on-surface-variant italic mb-8">{story.excerpt}</p>
      )}
      <div className="font-body-lg text-body-lg text-primary whitespace-pre-wrap space-y-6">{story.body}</div>
      <Link
        href="/editorial"
        className="inline-block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors mt-16"
      >
        {t("backToEditorial")}
      </Link>
    </article>
  );
}
