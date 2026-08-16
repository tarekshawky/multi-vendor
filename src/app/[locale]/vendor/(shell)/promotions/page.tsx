import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Tag } from "@/components/ui/Tag";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CreatePromoForm } from "@/components/vendor/promotions/CreatePromoForm";
import { formatCurrency, formatDate } from "@/lib/format";
import { promoStatusTone } from "@/lib/status-tone";
import type { PromoStatus } from "@/generated/prisma/client";

export default async function VendorPromotionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("VendorPromotions");

  const statusFilter = status && status !== "ALL" ? (status as PromoStatus) : undefined;

  const promoCodes = await prisma.promoCode.findMany({
    where: { vendorId: vendor.id, ...(statusFilter ? { status: statusFilter } : {}) },
    orderBy: { createdAt: "desc" },
  });

  const [activeCount, totalValueAgg] = await Promise.all([
    prisma.promoCode.count({ where: { vendorId: vendor.id, status: "ACTIVE" } }),
    prisma.promoRedemption.aggregate({
      where: { promoCode: { vendorId: vendor.id } },
      _sum: { discountAmount: true },
    }),
  ]);

  const statusOptions = ["ALL", "ACTIVE", "SCHEDULED", "EXPIRED"] as const;

  const discountLabel = (p: (typeof promoCodes)[number]) => {
    if (p.discountType === "PERCENT") return `${p.discountValue}% ${t("off")}`;
    if (p.discountType === "FIXED") return `${formatCurrency(p.discountValue.toString(), vendor.currency, locale)} ${t("off")}`;
    return t("freeShipping");
  };

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <h1 className="font-display text-headline-lg text-primary">{t("title")}</h1>
        <CreatePromoForm
          labels={{
            createPromoCode: t("createPromoCode"),
            code: t("code"),
            title: t("promoTitle"),
            description: t("description"),
            discountType: t("discountType"),
            percent: t("percent"),
            fixed: t("fixed"),
            freeShipping: t("freeShipping"),
            discountValue: t("discountValue"),
            minOrderValue: t("minOrderValue"),
            usageLimit: t("usageLimit"),
            validFrom: t("validFrom"),
            validUntil: t("validUntil"),
            create: t("create"),
            cancel: t("cancel"),
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 min-w-0">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("activePromotions")}
          </p>
          <p className="font-headline-lg text-headline-lg text-primary mt-2">{activeCount}</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 min-w-0">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("totalValueIssued")}
          </p>
          <p className="font-headline-lg text-headline-lg text-primary mt-2">
            {formatCurrency(totalValueAgg._sum.discountAmount?.toString() ?? "0", vendor.currency, locale)}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 min-w-0">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("topPerforming")}
          </p>
          <p className="font-headline-lg text-headline-lg text-primary mt-2 wrap-break-word">
            {promoCodes[0]?.code ?? "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-outline-variant/30 pb-8">
        {statusOptions.map((s) => (
          <Link key={s} href={s === "ALL" ? "/vendor/promotions" : `/vendor/promotions?status=${s}`}>
            <Tag active={(status ?? "ALL") === s}>{t(`status${s}`)}</Tag>
          </Link>
        ))}
      </div>

      {promoCodes.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {promoCodes.map((promo) => (
            <div key={promo.id} className="min-w-0 bg-surface-container-lowest border border-outline-variant/20 p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="min-w-0">
                  <p className="font-headline-sm text-headline-sm text-primary truncate">{promo.code}</p>
                  <p className="text-sm text-on-surface-variant truncate">{promo.title}</p>
                </div>
                <StatusPill label={t(`status${promo.status}`)} tone={promoStatusTone(promo.status)} className="shrink-0" />
              </div>
              <p className="font-body-md text-primary mb-1">{discountLabel(promo)}</p>
              {promo.minOrderValue && (
                <p className="text-xs text-on-surface-variant mb-4">
                  {t("minOrder", { value: formatCurrency(promo.minOrderValue.toString(), vendor.currency, locale) })}
                </p>
              )}
              <ProgressBar
                label={t("usage")}
                percent={promo.usageLimit ? Math.round((promo.usageCount / promo.usageLimit) * 100) : 0}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>
                  {formatDate(promo.validFrom, locale)} – {formatDate(promo.validUntil, locale)}
                </span>
                <Link
                  href={`/vendor/promotions/${promo.code}/analytics`}
                  className="font-label-caps uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
                >
                  {t("viewAnalytics")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
