import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatCurrency, formatDate } from "@/lib/format";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  vipTier: string;
  memberSince: Date;
  orderCount: number;
  totalSpend: number;
};

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("AdminCustomers");

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      customerProfile: true,
      ordersAsCustomer: { select: { total: true, currency: true } },
    },
  });

  const rows: CustomerRow[] = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    avatar: c.customerProfile?.avatar ?? null,
    vipTier: c.customerProfile?.vipTier ?? "STANDARD",
    memberSince: c.customerProfile?.memberSince ?? c.createdAt,
    orderCount: c.ordersAsCustomer.length,
    totalSpend: c.ordersAsCustomer.reduce((sum, o) => sum + Number(o.total), 0),
  }));

  const columns: Column<CustomerRow>[] = [
    {
      key: "name",
      header: t("customer"),
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar src={r.avatar} name={r.name} size={32} />
          <span className="text-primary">{r.name}</span>
          {r.vipTier !== "STANDARD" && <Badge className="ms-2">{r.vipTier}</Badge>}
        </div>
      ),
    },
    { key: "email", header: t("email"), render: (r) => r.email },
    { key: "memberSince", header: t("memberSince"), render: (r) => formatDate(r.memberSince, locale) },
    { key: "orders", header: t("orders"), align: "center", render: (r) => r.orderCount },
    {
      key: "spend",
      header: t("totalSpend"),
      align: "end",
      render: (r) => formatCurrency(r.totalSpend, "USD", locale),
    },
  ];

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-12">{t("title")}</h1>
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
