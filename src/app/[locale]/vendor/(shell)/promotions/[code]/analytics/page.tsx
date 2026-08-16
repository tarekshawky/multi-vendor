import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { RedemptionLineChart } from "@/components/vendor/charts/RedemptionLineChart";
import { formatCurrency, formatDate } from "@/lib/format";

type ShippingAddress = { city?: string };

export default async function PromoAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("PromoAnalytics");

  const promo = await prisma.promoCode.findFirst({
    where: { code: code.toUpperCase(), vendorId: vendor.id },
    include: {
      redemptions: {
        include: {
          order: {
            include: {
              items: { include: { product: { include: { collection: true } } } },
              customer: { include: { customerProfile: true } },
            },
          },
        },
      },
    },
  });
  if (!promo) notFound();

  const orders = promo.redemptions.map((r) => r.order);
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const aov = orders.length ? totalRevenue / orders.length : 0;

  const vipCount = orders.filter((o) => o.customer.customerProfile?.vipTier === "VIP").length;
  const eliteCount = orders.filter((o) => o.customer.customerProfile?.vipTier === "ELITE").length;
  const standardCount = orders.length - vipCount - eliteCount;

  const redemptionByWeek = new Map<string, number>();
  for (const r of promo.redemptions) {
    const key = formatDate(r.createdAt, "en");
    redemptionByWeek.set(key, (redemptionByWeek.get(key) ?? 0) + 1);
  }
  const trendData = Array.from(redemptionByWeek, ([label, value]) => ({ label, value }));

  const collectionUsage = new Map<string, { revenue: number; items: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const name = item.product?.collection?.name ?? t("uncategorized");
      const entry = collectionUsage.get(name) ?? { revenue: 0, items: 0 };
      entry.revenue += Number(item.price) * item.qty;
      entry.items += item.qty;
      collectionUsage.set(name, entry);
    }
  }
  const collectionRows = Array.from(collectionUsage, ([name, data]) => ({ name, ...data }));

  const cityUsage = new Map<string, number>();
  for (const order of orders) {
    const city = (order.shippingAddress as ShippingAddress)?.city ?? t("unknown");
    cityUsage.set(city, (cityUsage.get(city) ?? 0) + 1);
  }
  const cityRows = Array.from(cityUsage, ([city, count]) => ({ city, pct: Math.round((count / orders.length) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const collectionColumns: Column<{ name: string; revenue: number; items: number }>[] = [
    { key: "name", header: t("collection"), render: (r) => r.name },
    { key: "items", header: t("itemsSold"), align: "center", render: (r) => r.items },
    { key: "revenue", header: t("revenue"), align: "end", render: (r) => formatCurrency(r.revenue, vendor.currency, locale) },
  ];

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <Breadcrumb items={[{ label: t("promotions"), href: "/vendor/promotions" }, { label: promo.code }]} />
      <h1 className="font-display text-headline-lg text-primary mt-6 mb-12">{promo.code}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label={t("totalRevenue")} value={formatCurrency(totalRevenue, vendor.currency, locale)} icon="account_balance_wallet" />
        <StatCard
          label={t("redemptions")}
          value={promo.usageLimit ? `${promo.usageCount} / ${promo.usageLimit}` : `${promo.usageCount}`}
          icon="confirmation_number"
        />
        <StatCard label={t("aov")} value={formatCurrency(aov, vendor.currency, locale)} icon="trending_up" />
        <StatCard label={t("customerSplit")} value={`${orders.length ? Math.round((vipCount / orders.length) * 100) : 0}% VIP`} icon="group" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 p-8 mb-12">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("redemptionVelocity")}</h2>
        {trendData.length > 0 ? (
          <RedemptionLineChart data={trendData} />
        ) : (
          <p className="text-on-surface-variant text-sm">{t("noRedemptions")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-12">
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("segmentImpact")}</h2>
          <div className="space-y-4">
            <ProgressBar label="VIP" percent={orders.length ? Math.round((vipCount / orders.length) * 100) : 0} />
            <ProgressBar label="Elite" percent={orders.length ? Math.round((eliteCount / orders.length) * 100) : 0} />
            <ProgressBar label="Standard" percent={orders.length ? Math.round((standardCount / orders.length) * 100) : 0} />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("topCollections")}</h2>
          {collectionRows.length > 0 ? (
            <DataTable columns={collectionColumns} rows={collectionRows} rowKey={(r) => r.name} />
          ) : (
            <p className="text-on-surface-variant text-sm">{t("noRedemptions")}</p>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("geographicImpact")}</h2>
        {cityRows.length > 0 ? (
          <div className="space-y-4 max-w-md">
            {cityRows.map((row) => (
              <ProgressBar key={row.city} label={row.city} percent={row.pct} />
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant text-sm">{t("noRedemptions")}</p>
        )}
      </div>
    </div>
  );
}
