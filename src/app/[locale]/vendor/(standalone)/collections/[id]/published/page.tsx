import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icons/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { unsplash } from "@/lib/stock-images";

export default async function CollectionPublishedPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("CollectionPublished");

  const collection = await prisma.collection.findFirst({ where: { id, vendorId: vendor.id } });
  if (!collection) notFound();

  return (
    <div className="min-h-screen flex items-center justify-center px-margin-mobile py-24">
      <div className="max-w-lg w-full flex flex-col items-center text-center animate-in fade-in duration-700">
        <Icon name="check_circle" size={56} className="text-primary mb-6" />
        <h1 className="font-display text-headline-lg text-primary mb-4">{t("title")}</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-12">{t("description")}</p>

        <div className="w-full border border-outline-variant/20 bg-surface-container-lowest mb-12">
          {collection.heroImage && (
            <div className="relative aspect-[16/9]">
              <Image src={unsplash(collection.heroImage, { w: 800 })} alt={collection.name} fill className="object-cover" />
            </div>
          )}
          <div className="p-6 text-start">
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
              {collection.season}
            </p>
            <h2 className="font-headline-sm text-headline-sm text-primary mt-1">{collection.name}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{t("pieceCount", { count: collection.itemCount })}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full mb-8">
          <Link href={`/designers/${vendor.slug}`} className={buttonClasses("primary", "lg", "flex-1")}>
            {t("viewOnStorefront")}
          </Link>
          <Link href="/vendor/marketing" className={buttonClasses("secondary", "lg", "flex-1")}>
            {t("shareToEditorial")}
          </Link>
        </div>
        <Link href="/vendor/dashboard" className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
          {t("returnToDashboard")}
        </Link>
      </div>
    </div>
  );
}
