import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatCurrency } from "@/lib/format";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  vipTier: string;
  lifetimeValue: number;
  orderCount: number;
};

export default async function VendorCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("VendorCustomers");

  const orders = await prisma.order.findMany({
    where: { vendorId: vendor.id },
    include: { customer: { include: { customerProfile: true } } },
  });

  const byCustomer = new Map<string, CustomerRow>();
  for (const order of orders) {
    const existing = byCustomer.get(order.customerId);
    if (existing) {
      existing.lifetimeValue += Number(order.total);
      existing.orderCount += 1;
    } else {
      byCustomer.set(order.customerId, {
        id: order.customerId,
        name: order.customer.name,
        email: order.customer.email,
        avatar: order.customer.customerProfile?.avatar ?? null,
        vipTier: order.customer.customerProfile?.vipTier ?? "STANDARD",
        lifetimeValue: Number(order.total),
        orderCount: 1,
      });
    }
  }
  const rows = Array.from(byCustomer.values()).sort((a, b) => b.lifetimeValue - a.lifetimeValue);

  const columns: Column<CustomerRow>[] = [
    {
      key: "name",
      header: t("customer"),
      render: (r) => (
        <Link href={`/vendor/customers/${r.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
          <Avatar src={r.avatar} name={r.name} size={32} />
          <span>{r.name}</span>
          {r.vipTier !== "STANDARD" && <Badge className="ms-2">{r.vipTier}</Badge>}
        </Link>
      ),
    },
    { key: "email", header: t("email"), render: (r) => r.email },
    { key: "orders", header: t("orders"), align: "center", render: (r) => r.orderCount },
    {
      key: "ltv",
      header: t("lifetimeValue"),
      align: "end",
      render: (r) => formatCurrency(r.lifetimeValue, vendor.currency, locale),
    },
  ];

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-12">{t("title")}</h1>
      {rows.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("empty")}</p>
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
      )}
    </div>
  );
}
