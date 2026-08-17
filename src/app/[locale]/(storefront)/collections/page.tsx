import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SortSelect } from "@/components/storefront/SortSelect";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";

type SearchParams = { category?: string; sort?: string; q?: string };

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, sort, q } = await searchParams;
  const t = await getTranslations("Collections");

  const categories = await prisma.product.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  });

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const searchTerm = q?.trim();

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { description: { contains: searchTerm, mode: "insensitive" } },
              { category: { contains: searchTerm, mode: "insensitive" } },
              { vendor: { brandName: { contains: searchTerm, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy,
    include: { vendor: { select: { brandName: true } } },
    take: 24,
  });

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pt-8">
        <div>
          <h1 className="font-display text-headline-lg text-primary">{t("title")}</h1>
          {searchTerm && (
            <p className="font-body-md text-on-surface-variant mt-2">
              {t("searchResultsFor", { term: searchTerm })}
            </p>
          )}
        </div>
        <div className="w-full md:w-64">
          <SortSelect
            ariaLabel={t("sortLabel")}
            options={[
              { value: "newest", label: t("sortNewest") },
              { value: "price-asc", label: t("sortPriceAsc") },
              { value: "price-desc", label: t("sortPriceDesc") },
            ]}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-12 border-b border-outline-variant/30 pb-8">
        <Link href="/collections">
          <Tag active={!category}>{t("allCategories")}</Tag>
        </Link>
        {categories.map((c) => (
          <Link key={c.category} href={`/collections?category=${encodeURIComponent(c.category!)}`}>
            <Tag active={category === c.category}>{c.category}</Tag>
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("empty")}</p>
      ) : (
        <div
          className={cn(
            "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-gutter",
          )}
        >
          {products.map((product) => (
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
      )}
    </div>
  );
}
