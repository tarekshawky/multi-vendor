import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Tag } from "@/components/ui/Tag";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatCurrency, formatDate } from "@/lib/format";
import { orderStatusTone } from "@/lib/status-tone";
import type { OrderStatus } from "@/generated/prisma/client";

type OrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  placedAt: Date;
  total: string;
  status: string;
};

export default async function VendorOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("VendorOrders");

  const statusFilter = status && status !== "ALL" ? (status as OrderStatus) : undefined;

  const orders = await prisma.order.findMany({
    where: { vendorId: vendor.id, ...(statusFilter ? { status: statusFilter } : {}) },
    orderBy: { placedAt: "desc" },
    include: { customer: { select: { name: true } } },
  });

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customer.name,
    placedAt: o.placedAt,
    total: o.total.toString(),
    status: o.status,
  }));

  const columns: Column<OrderRow>[] = [
    {
      key: "orderNumber",
      header: t("orderId"),
      render: (r) => (
        <Link href={`/vendor/orders/${r.id}`} className="text-primary hover:underline">
          #{r.orderNumber}
        </Link>
      ),
    },
    { key: "customer", header: t("customer"), render: (r) => r.customerName },
    { key: "date", header: t("date"), render: (r) => formatDate(r.placedAt, locale) },
    { key: "value", header: t("value"), align: "end", render: (r) => formatCurrency(r.total, vendor.currency, locale) },
    {
      key: "status",
      header: t("status"),
      align: "end",
      render: (r) => <StatusPill label={r.status} tone={orderStatusTone(r.status)} />,
    },
  ];

  const statusOptions = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-8">{t("title")}</h1>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-outline-variant/30 pb-8">
        {statusOptions.map((s) => (
          <Link key={s} href={s === "ALL" ? "/vendor/orders" : `/vendor/orders?status=${s}`}>
            <Tag active={(status ?? "ALL") === s}>{t(`status${s}`)}</Tag>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("empty")}</p>
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
      )}
    </div>
  );
}
