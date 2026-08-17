import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/format";
import { orderStatusTone } from "@/lib/status-tone";

type RecentOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  vendorName: string;
  total: string;
  currency: string;
  status: string;
};

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("AdminDashboard");

  const [vendorCount, orderCount, customerCount, gmvByCurrency, recentOrders, topVendors] = await Promise.all([
    prisma.vendorProfile.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.groupBy({ by: ["currency"], _sum: { total: true } }),
    prisma.order.findMany({
      orderBy: { placedAt: "desc" },
      take: 8,
      include: { customer: { select: { name: true } }, vendor: { select: { brandName: true } } },
    }),
    prisma.vendorProfile.findMany({
      orderBy: { orders: { _count: "desc" } },
      take: 5,
      include: { _count: { select: { orders: true, products: true } } },
    }),
  ]);

  const orderRows: RecentOrderRow[] = recentOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customer.name,
    vendorName: o.vendor.brandName,
    total: o.total.toString(),
    currency: o.currency,
    status: o.status,
  }));

  const columns: Column<RecentOrderRow>[] = [
    { key: "orderNumber", header: t("orderId"), render: (r) => `#${r.orderNumber}` },
    { key: "vendor", header: t("vendor"), render: (r) => r.vendorName },
    { key: "customer", header: t("customer"), render: (r) => r.customerName },
    { key: "value", header: t("value"), align: "end", render: (r) => formatCurrency(r.total, r.currency, locale) },
    {
      key: "status",
      header: t("status"),
      align: "end",
      render: (r) => <StatusPill label={r.status} tone={orderStatusTone(r.status)} />,
    },
  ];

  const gmvLabel = gmvByCurrency
    .map((g) => formatCurrency(g._sum.total?.toString() ?? "0", g.currency, locale))
    .join(" · ") || formatCurrency(0, "USD", locale);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-12">{t("title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label={t("gmv")} value={gmvLabel} icon="account_balance_wallet" inverted />
        <StatCard label={t("vendors")} value={String(vendorCount)} icon="storefront" />
        <StatCard label={t("orders")} value={String(orderCount)} icon="local_shipping" />
        <StatCard label={t("customers")} value={String(customerCount)} icon="group" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant/20 p-8">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("topVendors")}</h2>
          <div className="space-y-6">
            {topVendors.map((v) => (
              <Link key={v.id} href={`/admin/vendors`} className="flex items-center gap-4 group">
                <Avatar src={v.logoImage} name={v.brandName} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-body-md text-body-md text-primary truncate">{v.brandName}</p>
                  <p className="text-sm text-on-surface-variant">{t("productCount", { count: v._count.products })}</p>
                </div>
                <span className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant whitespace-nowrap">
                  {t("orderCount", { count: v._count.orders })}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-headline-sm text-primary">{t("recentOrders")}</h2>
            <Link href="/admin/orders" className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
              {t("viewAllOrders")}
            </Link>
          </div>
          <DataTable columns={columns} rows={orderRows} rowKey={(r) => r.id} />
        </div>
      </div>
    </div>
  );
}
