import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { RevenueAreaChart } from "@/components/vendor/charts/RevenueAreaChart";
import { formatCurrency } from "@/lib/format";
import { unsplash } from "@/lib/stock-images";

type ShippingAddress = { city?: string };
type CollectionRow = { id: string; name: string; season: string | null; heroImage: string | null; revenue: number; views: number; sellThrough: number };

export default async function VendorAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("VendorAnalytics");

  const [orders, collections, products] = await Promise.all([
    prisma.order.findMany({ where: { vendorId: vendor.id } }),
    prisma.collection.findMany({ where: { vendorId: vendor.id }, include: { products: true } }),
    prisma.product.findMany({ where: { vendorId: vendor.id } }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const aov = totalOrders ? totalRevenue / totalOrders : 0;
  const totalViews = products.reduce((sum, p) => sum + p.views, 0);
  const totalUnitsSold = products.reduce((sum, p) => sum + p.unitsSold, 0);
  const conversionRate = totalViews ? (totalUnitsSold / totalViews) * 100 : 0;

  const revenueByMonth = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const key = new Intl.DateTimeFormat("en-US", { month: "short" }).format(o.placedAt);
    const entry = revenueByMonth.get(key) ?? { revenue: 0, orders: 0 };
    entry.revenue += Number(o.total);
    entry.orders += 1;
    revenueByMonth.set(key, entry);
  }
  const chartData = Array.from(revenueByMonth, ([label, v]) => ({ label, revenue: v.revenue, orders: v.orders }));

  const collectionRows: CollectionRow[] = collections.map((c) => ({
    id: c.id,
    name: c.name,
    season: c.season,
    heroImage: c.heroImage,
    revenue: c.products.reduce((sum, p) => sum + Number(p.price) * p.unitsSold, 0),
    views: c.products.reduce((sum, p) => sum + p.views, 0),
    sellThrough: c.products.length
      ? Math.round((c.products.reduce((sum, p) => sum + p.unitsSold, 0) / (c.products.length * 50)) * 100)
      : 0,
  }));

  const categoryShare = new Map<string, number>();
  for (const p of products) {
    if (!p.category) continue;
    categoryShare.set(p.category, (categoryShare.get(p.category) ?? 0) + p.unitsSold);
  }
  const totalCategorySold = Array.from(categoryShare.values()).reduce((a, b) => a + b, 0);
  const categoryRows = Array.from(categoryShare, ([category, sold]) => ({
    category,
    pct: totalCategorySold ? Math.round((sold / totalCategorySold) * 100) : 0,
  })).sort((a, b) => b.pct - a.pct);

  const cityRevenue = new Map<string, number>();
  for (const o of orders) {
    const city = (o.shippingAddress as ShippingAddress)?.city ?? t("unknown");
    cityRevenue.set(city, (cityRevenue.get(city) ?? 0) + Number(o.total));
  }
  const marketRows = Array.from(cityRevenue, ([city, revenue]) => ({ city, revenue })).sort((a, b) => b.revenue - a.revenue);

  const collectionColumns: Column<CollectionRow>[] = [
    {
      key: "name",
      header: t("collection"),
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.heroImage && (
            <div className="relative w-10 h-10 shrink-0 overflow-hidden bg-surface-container-high">
              <Image src={unsplash(r.heroImage, { w: 100 })} alt={r.name} fill className="object-cover" />
            </div>
          )}
          <div>
            <p className="text-primary">{r.name}</p>
            <p className="text-xs text-on-surface-variant">{r.season}</p>
          </div>
        </div>
      ),
    },
    { key: "revenue", header: t("revenue"), align: "end", render: (r) => formatCurrency(r.revenue, vendor.currency, locale) },
    { key: "views", header: t("views"), align: "end", render: (r) => r.views },
    {
      key: "sellThrough",
      header: t("sellThrough"),
      align: "end",
      render: (r) => (
        <span className="inline-block bg-surface-container-high px-2 py-1 text-xs font-label-caps">{r.sellThrough}%</span>
      ),
    },
  ];

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-12">{t("title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label={t("totalRevenue")} value={formatCurrency(totalRevenue, vendor.currency, locale)} icon="account_balance_wallet" />
        <StatCard label={t("totalOrders")} value={String(totalOrders)} icon="receipt_long" />
        <StatCard label={t("aov")} value={formatCurrency(aov, vendor.currency, locale)} icon="trending_up" />
        <StatCard label={t("conversionRate")} value={`${conversionRate.toFixed(1)}%`} icon="insights" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 p-8 mb-12">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("revenuePerformance")}</h2>
        {chartData.length > 0 ? (
          <RevenueAreaChart data={chartData} labels={{ revenue: t("revenue"), orders: t("orders") }} />
        ) : (
          <p className="text-on-surface-variant text-sm">{t("noData")}</p>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 p-8 mb-12">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("collectionPerformance")}</h2>
        <DataTable columns={collectionColumns} rows={collectionRows} rowKey={(r) => r.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("topCategories")}</h2>
          <div className="space-y-4">
            {categoryRows.map((row) => (
              <ProgressBar key={row.category} label={row.category} percent={row.pct} />
            ))}
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("topMarkets")}</h2>
          <div className="space-y-4">
            {marketRows.map((row) => (
              <div key={row.city} className="flex items-center justify-between text-sm">
                <span className="text-primary">{row.city}</span>
                <span className="text-on-surface-variant">{formatCurrency(row.revenue, vendor.currency, locale)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
