import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StatusPill } from "@/components/ui/StatusPill";
import { Card } from "@/components/ui/Card";
import { OrderStatusUpdate } from "@/components/orders/OrderStatusUpdate";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateOrderStatusAdmin, deleteOrder } from "@/server/actions/admin";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { orderStatusTone } from "@/lib/status-tone";
import { unsplash } from "@/lib/stock-images";

type ShippingAddress = { name?: string; line1?: string; city?: string; state?: string; zip?: string; country?: string };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("OrderDetail");
  const ta = await getTranslations("AdminOrders");
  const tc = await getTranslations("AdminCommon");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true, customerProfile: { select: { phone: true } } } },
      vendor: { select: { brandName: true } },
      items: true,
      historyEvents: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  const address = (order.shippingAddress as ShippingAddress) ?? {};

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <Breadcrumb items={[{ label: ta("title"), href: "/admin/orders" }, { label: `#${order.orderNumber}` }]} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 mb-12">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-headline-lg text-primary">#{order.orderNumber}</h1>
          <StatusPill label={order.status} tone={orderStatusTone(order.status)} />
        </div>
        <div className="flex items-center gap-4">
          <OrderStatusUpdate
            orderId={order.id}
            currentStatus={order.status}
            action={updateOrderStatusAdmin}
            labels={{ status: t("status"), note: t("note"), update: t("updateStatus") }}
          />
          <DeleteButton
            id={order.id}
            action={deleteOrder}
            redirectTo="/admin/orders"
            confirmMessage={tc("confirmDeleteOrder", { orderNumber: order.orderNumber })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("itemsOrdered")}</h2>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.imageSnapshot && (
                    <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-surface-container-high">
                      <Image src={unsplash(item.imageSnapshot, { w: 200 })} alt={item.titleSnapshot} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-primary truncate">{item.titleSnapshot}</p>
                    <p className="text-sm text-on-surface-variant">
                      {item.color} · {item.size} · {t("qty")} {item.qty}
                    </p>
                  </div>
                  <p className="font-label-caps text-label-caps text-primary">
                    {formatCurrency(item.price.toString(), order.currency, locale)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("orderHistory")}</h2>
            <div className="space-y-6">
              {order.historyEvents.map((event) => (
                <div key={event.id} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="font-body-md text-body-md text-primary">{event.status}</p>
                    {event.note && <p className="text-sm text-on-surface-variant">{event.note}</p>}
                    <p className="text-xs text-on-surface-variant mt-1">{formatDateTime(event.createdAt, locale)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-4">{ta("vendor")}</h2>
            <p className="font-body-md text-primary">{order.vendor.brandName}</p>
          </Card>

          <Card>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-4">{t("customer")}</h2>
            <p className="font-body-md text-primary">{order.customer.name}</p>
            <p className="text-sm text-on-surface-variant">{order.customer.email}</p>
            {order.customer.customerProfile?.phone && (
              <p className="text-sm text-on-surface-variant">{order.customer.customerProfile.phone}</p>
            )}
          </Card>

          <Card>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-4">{t("shippingAddress")}</h2>
            <p className="text-sm text-on-surface-variant">{address.name}</p>
            <p className="text-sm text-on-surface-variant">{address.line1}</p>
            <p className="text-sm text-on-surface-variant">
              {address.city}, {address.state} {address.zip}
            </p>
            <p className="text-sm text-on-surface-variant">{address.country}</p>
          </Card>

          <Card>
            <h2 className="font-headline-sm text-headline-sm text-primary mb-4">{t("paymentSummary")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{t("subtotal")}</span>
                <span className="text-primary">{formatCurrency(order.subtotal.toString(), order.currency, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{t("shipping")}</span>
                <span className="text-primary">{formatCurrency(order.shipping.toString(), order.currency, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{t("tax")}</span>
                <span className="text-primary">{formatCurrency(order.tax.toString(), order.currency, locale)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-outline-variant/30 font-body-md">
                <span className="text-primary">{t("total")}</span>
                <span className="text-primary">{formatCurrency(order.total.toString(), order.currency, locale)}</span>
              </div>
              {order.paymentMethodLast4 && (
                <p className="text-xs text-on-surface-variant pt-2">{t("cardEnding", { last4: order.paymentMethodLast4 })}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
