import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { formatCurrency, formatDate } from "@/lib/format";
import { orderStatusTone } from "@/lib/status-tone";

type OrderRow = {
  id: string;
  orderNumber: string;
  vendorName: string;
  placedAt: Date;
  total: string;
  currency: string;
  status: string;
  paymentMethod: string;
};

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { user: sessionUser } = await requireUser(locale, "/account");

  const t = await getTranslations("Account");

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { customerProfile: { select: { memberSince: true } } },
    }),
    prisma.order.findMany({
      where: { customerId: sessionUser.id },
      orderBy: { placedAt: "desc" },
      include: { vendor: { select: { brandName: true } } },
    }),
  ]);

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    vendorName: o.vendor.brandName,
    placedAt: o.placedAt,
    total: o.total.toString(),
    currency: o.currency,
    status: o.status,
    paymentMethod: o.paymentMethod,
  }));

  const columns: Column<OrderRow>[] = [
    { key: "orderNumber", header: t("orderId"), render: (r) => `#${r.orderNumber}` },
    { key: "vendor", header: t("vendor"), render: (r) => r.vendorName },
    { key: "date", header: t("date"), render: (r) => formatDate(r.placedAt, locale) },
    {
      key: "payment",
      header: t("paymentMethod"),
      render: (r) => t(`paymentMethod${r.paymentMethod}`),
    },
    {
      key: "value",
      header: t("value"),
      align: "end",
      render: (r) => formatCurrency(r.total, r.currency, locale),
    },
    {
      key: "status",
      header: t("status"),
      align: "end",
      render: (r) => <StatusPill label={r.status} tone={orderStatusTone(r.status)} />,
    },
  ];

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap pt-8">
      <h1 className="font-display text-headline-lg text-primary mb-2">{t("title")}</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-12">
        {t("welcome", { name: user!.name })}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-section-gap">
        <Card className="lg:col-span-2">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-4">{t("profile")}</h2>
          <div className="space-y-1 text-sm mb-6">
            <p className="text-primary font-body-md">{user!.name}</p>
            <p className="text-on-surface-variant">{user!.email}</p>
            {user!.customerProfile?.memberSince && (
              <p className="text-on-surface-variant">
                {t("memberSince", { date: formatDate(user!.customerProfile.memberSince, locale) })}
              </p>
            )}
          </div>
          <ChangePasswordForm />
        </Card>

        <Card>
          <h2 className="font-headline-sm text-headline-sm text-primary mb-4">{t("account")}</h2>
          <SignOutButton className="px-0 hover:bg-transparent" />
        </Card>
      </div>

      <h2 className="font-display text-headline-lg text-primary mb-8">{t("orderHistory")}</h2>
      {rows.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("noOrders")}</p>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
        </div>
      )}
    </div>
  );
}
