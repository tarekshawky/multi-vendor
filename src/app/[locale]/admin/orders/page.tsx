import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Tag } from "@/components/ui/Tag";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteOrder } from "@/server/actions/admin";
import { formatCurrency, formatDate } from "@/lib/format";
import { orderStatusTone } from "@/lib/status-tone";
import type { OrderStatus } from "@/generated/prisma/client";

type OrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  vendorName: string;
  placedAt: Date;
  total: string;
  currency: string;
  status: string;
};

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  const t = await getTranslations("AdminOrders");
  const tc = await getTranslations("AdminCommon");

  const statusFilter = status && status !== "ALL" ? (status as OrderStatus) : undefined;

  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { placedAt: "desc" },
    include: { customer: { select: { name: true } }, vendor: { select: { brandName: true } } },
    take: 100,
  });

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customer.name,
    vendorName: o.vendor.brandName,
    placedAt: o.placedAt,
    total: o.total.toString(),
    currency: o.currency,
    status: o.status,
  }));

  const columns: Column<OrderRow>[] = [
    {
      key: "orderNumber",
      header: t("orderId"),
      render: (r) => (
        <Link href={`/admin/orders/${r.id}`} className="text-primary hover:underline">
          #{r.orderNumber}
        </Link>
      ),
    },
    { key: "vendor", header: t("vendor"), render: (r) => r.vendorName },
    { key: "customer", header: t("customer"), render: (r) => r.customerName },
    { key: "date", header: t("date"), render: (r) => formatDate(r.placedAt, locale) },
    { key: "value", header: t("value"), align: "end", render: (r) => formatCurrency(r.total, r.currency, locale) },
    {
      key: "status",
      header: t("status"),
      align: "end",
      render: (r) => <StatusPill label={r.status} tone={orderStatusTone(r.status)} />,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <DeleteButton
          id={r.id}
          action={deleteOrder}
          confirmMessage={tc("confirmDeleteOrder", { orderNumber: r.orderNumber })}
        />
      ),
    },
  ];

  const statusOptions = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-8">{t("title")}</h1>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-outline-variant/30 pb-8">
        {statusOptions.map((s) => (
          <Link key={s} href={s === "ALL" ? "/admin/orders" : `/admin/orders?status=${s}`}>
            <Tag active={(status ?? "ALL") === s}>{t(`status${s}`)}</Tag>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("empty")}</p>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
        </div>
      )}
    </div>
  );
}
