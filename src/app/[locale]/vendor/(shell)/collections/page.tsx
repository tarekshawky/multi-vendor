import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Tag } from "@/components/ui/Tag";
import { StatusPill } from "@/components/ui/StatusPill";
import { buttonClasses } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import { collectionStatusTone } from "@/lib/status-tone";
import { unsplash } from "@/lib/stock-images";
import type { CollectionStatus } from "@/generated/prisma/client";

export default async function VendorCollectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("VendorCollections");

  const statusFilter = status && status !== "ALL" ? (status as CollectionStatus) : undefined;

  const collections = await prisma.collection.findMany({
    where: { vendorId: vendor.id, ...(statusFilter ? { status: statusFilter } : {}) },
    orderBy: { createdAt: "desc" },
  });

  const statusOptions = ["ALL", "ACTIVE", "DRAFT", "ARCHIVED"] as const;

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <h1 className="font-display text-headline-lg text-primary">{t("title")}</h1>
        <Link href="/vendor/collections/new/step-1" className={buttonClasses("primary", "md")}>
          {t("addCollection")}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-12 border-b border-outline-variant/30 pb-8">
        {statusOptions.map((s) => (
          <Link key={s} href={s === "ALL" ? "/vendor/collections" : `/vendor/collections?status=${s}`}>
            <Tag active={(status ?? "ALL") === s}>{t(`status${s}`)}</Tag>
          </Link>
        ))}
      </div>

      {collections.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {collections.map((collection) => (
            <div key={collection.id} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-high mb-4">
                {collection.heroImage && (
                  <Image
                    src={unsplash(collection.heroImage, { w: 800 })}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute top-3 start-3">
                  <StatusPill label={t(`status${collection.status}`)} tone={collectionStatusTone(collection.status)} />
                </div>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary">{collection.name}</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                {collection.season} · {t("itemCount", { count: collection.itemCount })} ·{" "}
                {formatCurrency(collection.revenue.toString(), vendor.currency, locale)}
              </p>
              <div className="flex gap-4 mt-3">
                <Link
                  href={`/vendor/collections/new/step-2/${collection.id}`}
                  className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                >
                  {t("edit")}
                </Link>
                {collection.status === "DRAFT" ? (
                  <Link
                    href={`/vendor/collections/new/step-3/${collection.id}`}
                    className="font-label-caps text-label-caps uppercase tracking-widest text-primary"
                  >
                    {t("publish")}
                  </Link>
                ) : (
                  <Link
                    href={`/designers/${vendor.slug}`}
                    className="font-label-caps text-label-caps uppercase tracking-widest text-primary"
                  >
                    {t("viewStorefront")}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
