import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/Button";
import { addCustomerNote } from "@/server/actions/customers";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

type SizingProfile = { tops?: string; bottoms?: string; shoes?: string };

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; customerId: string }>;
}) {
  const { locale, customerId } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("CustomerProfile");

  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    include: { customerProfile: true },
  });
  if (!customer || !customer.customerProfile) notFound();

  const orders = await prisma.order.findMany({
    where: { customerId, vendorId: vendor.id },
    orderBy: { placedAt: "desc" },
    include: { items: { take: 1 } },
  });

  const notes = await prisma.note.findMany({
    where: { vendorId: vendor.id, customerId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  const lifetimeValue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const aov = orders.length ? lifetimeValue / orders.length : 0;
  const sizing = (customer.customerProfile.sizingProfile as SizingProfile) ?? {};

  const addNoteAction = addCustomerNote.bind(null, customerId);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Avatar src={customer.customerProfile.avatar} name={customer.name} size={80} />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-headline-lg text-primary">{customer.name}</h1>
              {customer.customerProfile.vipTier !== "STANDARD" && <Badge>{customer.customerProfile.vipTier}</Badge>}
            </div>
            <p className="text-sm text-on-surface-variant">
              {customer.email} · {customer.customerProfile.phone} · {customer.customerProfile.location}
            </p>
          </div>
        </div>
        <Link href={`/vendor/messages`} className={buttonClasses("secondary", "md")}>
          {t("message")}
        </Link>
      </div>

      {customer.customerProfile.bio && (
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-12">{customer.customerProfile.bio}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-12">
        <Card>
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("styleArchitecture")}</h2>
          <div className="space-y-6">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-2">
                {t("aesthetic")}
              </p>
              <div className="flex flex-wrap gap-2">
                {customer.customerProfile.aestheticTags.map((tagName) => (
                  <Tag key={tagName}>
                    {tagName}
                  </Tag>
                ))}
              </div>
            </div>
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-2">
                {t("materials")}
              </p>
              <div className="flex flex-wrap gap-2">
                {customer.customerProfile.favoredMaterials.map((m) => (
                  <Tag key={m}>
                    {m}
                  </Tag>
                ))}
              </div>
            </div>
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-2">
                {t("sizing")}
              </p>
              <p className="text-sm text-primary">
                {t("sizingTops", { size: sizing.tops ?? "—" })} · {t("sizingBottoms", { size: sizing.bottoms ?? "—" })} ·{" "}
                {t("sizingShoes", { size: sizing.shoes ?? "—" })}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("engagementMetrics")}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                {t("lifetimeValue")}
              </p>
              <p className="font-headline-sm text-headline-sm text-primary mt-1">
                {formatCurrency(lifetimeValue, vendor.currency, locale)}
              </p>
            </div>
            <div>
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                {t("memberSince")}
              </p>
              <p className="font-headline-sm text-headline-sm text-primary mt-1">
                {formatDate(customer.customerProfile.memberSince, locale)}
              </p>
            </div>
            <div>
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">{t("aov")}</p>
              <p className="font-headline-sm text-headline-sm text-primary mt-1">
                {formatCurrency(aov, vendor.currency, locale)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <Card>
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("acquisitionHistory")}</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t("noPurchases")}</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/vendor/orders/${order.id}`}
                  className="flex items-center justify-between text-sm hover:text-primary transition-colors"
                >
                  <span className="text-primary">#{order.orderNumber}</span>
                  <span className="text-on-surface-variant">{formatDate(order.placedAt, locale)}</span>
                  <span className="text-primary">{formatCurrency(order.total.toString(), order.currency, locale)}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("curationNotes")}</h2>
          <form action={addNoteAction} className="mb-6 space-y-3">
            <Textarea name="body" rows={3} placeholder={t("addNotePlaceholder")} />
            <Button type="submit" size="sm">
              {t("addNote")}
            </Button>
          </form>
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border-t border-outline-variant/20 pt-4">
                <p className="text-sm text-primary">{note.body}</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {note.author.name} · {formatDateTime(note.createdAt, locale)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
