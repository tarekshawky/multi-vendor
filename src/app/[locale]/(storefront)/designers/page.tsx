import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { unsplash } from "@/lib/stock-images";

export default async function DesignersIndexPage() {
  const t = await getTranslations("Designers");
  const vendors = await prisma.vendorProfile.findMany({
    where: { status: "ACTIVE" },
    orderBy: { brandName: "asc" },
  });

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap pt-8">
      <h1 className="font-display text-headline-lg text-primary mb-12">{t("title")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {vendors.map((vendor) => (
          <Link key={vendor.id} href={`/designers/${vendor.slug}`} className="group block">
            <div className="relative aspect-[16/9] overflow-hidden bg-surface-container-high mb-4">
              <Image
                src={unsplash(vendor.heroImage ?? "", { w: 1200 })}
                alt={vendor.brandName}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <h2 className="font-headline-sm text-headline-sm text-primary">{vendor.brandName}</h2>
            {vendor.tagline && <p className="font-body-md text-on-surface-variant mt-1">{vendor.tagline}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
