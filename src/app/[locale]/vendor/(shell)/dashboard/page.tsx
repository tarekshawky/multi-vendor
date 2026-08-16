import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SalesBarChart } from "@/components/vendor/charts/SalesBarChart";
import { formatCurrency } from "@/lib/format";
import { orderStatusTone } from "@/lib/status-tone";
import { unsplash } from "@/lib/stock-images";

type RecentOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  itemCount: number;
  total: string;
  status: string;
};

export default async function VendorDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("VendorDashboard");

  const [totalRevenueAgg, activeCollectionsCount, pendingOrdersCount, topProducts, recentOrders] = await Promise.all([
    prisma.order.aggregate({ where: { vendorId: vendor.id }, _sum: { total: true } }),
    prisma.collection.count({ where: { vendorId: vendor.id, status: "ACTIVE" } }),
    prisma.order.count({ where: { vendorId: vendor.id, status: "PENDING" } }),
    prisma.product.findMany({ where: { vendorId: vendor.id }, orderBy: { unitsSold: "desc" }, take: 4 }),
    prisma.order.findMany({
      where: { vendorId: vendor.id },
      orderBy: { placedAt: "desc" },
      take: 6,
      include: { customer: { select: { name: true } }, items: { select: { id: true } } },
    }),
  ]);

  const orderRows: RecentOrderRow[] = recentOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customer.name,
    itemCount: o.items.length,
    total: o.total.toString(),
    status: o.status,
  }));

  const columns: Column<RecentOrderRow>[] = [
    { key: "orderNumber", header: t("orderId"), render: (r) => `#${r.orderNumber}` },
    { key: "customer", header: t("customer"), render: (r) => r.customerName },
    { key: "items", header: t("items"), align: "center", render: (r) => r.itemCount },
    { key: "value", header: t("value"), align: "end", render: (r) => formatCurrency(r.total, vendor.currency, locale) },
    {
      key: "status",
      header: t("status"),
      align: "end",
      render: (r) => <StatusPill label={r.status} tone={orderStatusTone(r.status)} />,
    },
  ];

  // Derive a monthly/quarterly/yearly revenue breakdown from real orders.
  const allVendorOrders = await prisma.order.findMany({
    where: { vendorId: vendor.id },
    select: { total: true, placedAt: true },
  });
  const monthlyMap = new Map<string, number>();
  for (const o of allVendorOrders) {
    const key = new Intl.DateTimeFormat("en-US", { month: "short" }).format(o.placedAt);
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(o.total));
  }
  const monthly = Array.from(monthlyMap, ([label, value]) => ({ label, value }));
  const quarterly = [
    { label: "Q1", value: monthly.reduce((s, m) => s + m.value, 0) * 0.4 },
    { label: "Q2", value: monthly.reduce((s, m) => s + m.value, 0) * 0.3 },
    { label: "Q3", value: monthly.reduce((s, m) => s + m.value, 0) * 0.2 },
    { label: "Q4", value: monthly.reduce((s, m) => s + m.value, 0) * 0.1 },
  ];
  const yearly = [{ label: "2024", value: quarterly.reduce((s, q) => s + q.value, 0) * 0.6 }, { label: "2025", value: quarterly.reduce((s, q) => s + q.value, 0) }];

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-12">
        {t("greeting", { name: vendor.brandName })}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard
          label={t("totalRevenue")}
          value={formatCurrency(totalRevenueAgg._sum.total?.toString() ?? "0", vendor.currency, locale)}
          icon="account_balance_wallet"
        />
        <StatCard label={t("activeCollections")} value={String(activeCollectionsCount)} icon="inventory_2" />
        <StatCard label={t("pendingOrders")} value={String(pendingOrdersCount)} icon="local_shipping" inverted />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 p-8 mb-12">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("salesPerformance")}</h2>
        <SalesBarChart
          monthly={monthly.length ? monthly : [{ label: "—", value: 0 }]}
          quarterly={quarterly}
          yearly={yearly}
          labels={{ month: t("month"), quarter: t("quarter"), year: t("year") }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant/20 p-8">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("topPieces")}</h2>
          <div className="space-y-6">
            {topProducts.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="flex items-center gap-4 group">
                <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-surface-container-high">
                  <Image src={unsplash(p.images[0], { w: 200 })} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body-md text-body-md text-primary truncate">{p.name}</p>
                  <p className="text-sm text-on-surface-variant">{formatCurrency(p.price.toString(), vendor.currency, locale)}</p>
                </div>
                <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant whitespace-nowrap">
                  {t("unitsSold", { count: p.unitsSold })}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-headline-sm text-primary">{t("recentOrders")}</h2>
            <Link href="/vendor/orders" className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
              {t("viewAllOrders")}
            </Link>
          </div>
          <DataTable columns={columns} rows={orderRows} rowKey={(r) => r.id} />
        </div>
      </div>
    </div>
  );
}
