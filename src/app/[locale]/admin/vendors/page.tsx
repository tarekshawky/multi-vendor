import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { StatusPill } from "@/components/ui/StatusPill";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { VendorStatusToggle } from "@/components/admin/VendorStatusToggle";
import { formatCurrency } from "@/lib/format";
import { vendorStatusTone } from "@/lib/status-tone";
import type { VendorStatus } from "@/generated/prisma/client";

type VendorRow = {
  id: string;
  brandName: string;
  logoImage: string | null;
  slug: string;
  status: VendorStatus;
  currency: string;
  productCount: number;
  orderCount: number;
  revenue: string;
};

export default async function AdminVendorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("AdminVendors");

  const vendors = await prisma.vendorProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { products: true, orders: true } },
      orders: { select: { total: true } },
    },
  });

  const rows: VendorRow[] = vendors.map((v) => ({
    id: v.id,
    brandName: v.brandName,
    logoImage: v.logoImage,
    slug: v.slug,
    status: v.status,
    currency: v.currency,
    productCount: v._count.products,
    orderCount: v._count.orders,
    revenue: v.orders.reduce((sum, o) => sum + Number(o.total), 0).toString(),
  }));

  const columns: Column<VendorRow>[] = [
    {
      key: "brand",
      header: t("vendor"),
      render: (r) => (
        <Link href={`/designers/${r.slug}`} className="flex items-center gap-3 group">
          <Avatar src={r.logoImage} name={r.brandName} size={32} />
          <span className="text-primary group-hover:opacity-70 transition-opacity">{r.brandName}</span>
        </Link>
      ),
    },
    { key: "products", header: t("products"), align: "center", render: (r) => r.productCount },
    { key: "orders", header: t("orders"), align: "center", render: (r) => r.orderCount },
    { key: "revenue", header: t("revenue"), align: "end", render: (r) => formatCurrency(r.revenue, r.currency, locale) },
    {
      key: "status",
      header: t("status"),
      align: "end",
      render: (r) => <StatusPill label={r.status} tone={vendorStatusTone(r.status)} />,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => <VendorStatusToggle vendorId={r.id} status={r.status} />,
    },
  ];

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-12">{t("title")}</h1>
      <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
      </div>
    </div>
  );
}
