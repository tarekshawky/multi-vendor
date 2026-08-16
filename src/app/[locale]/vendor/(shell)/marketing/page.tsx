import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons/Icon";
import { formatDate } from "@/lib/format";
import { unsplash } from "@/lib/stock-images";

export default async function VendorMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("VendorMarketing");

  const campaigns = await prisma.campaign.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
  });

  const toolkitItems = [
    { key: "editorialStories", icon: "auto_stories", href: "/vendor/marketing" },
    { key: "promoCodes", icon: "sell", href: "/vendor/promotions" },
    { key: "vipOutreach", icon: "diversity_3", href: "/vendor/customers" },
    { key: "adPlacements", icon: "campaign", href: "/vendor/analytics" },
  ] as const;

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-12">{t("title")}</h1>

      <section className="mb-section-gap">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("activeCampaigns")}</h2>
        {campaigns.length === 0 ? (
          <p className="text-on-surface-variant">{t("noCampaigns")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="group relative overflow-hidden bg-surface-container-high aspect-[16/10]">
                {campaign.coverImage && (
                  <Image
                    src={unsplash(campaign.coverImage, { w: 1200 })}
                    alt={campaign.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover grayscale-0 group-hover:grayscale transition-all duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-inverse-surface/70 via-transparent to-transparent" />
                <div className="absolute top-4 start-4">
                  <StatusPill label={t(`campaignStatus${campaign.status}`)} tone={campaign.status === "ACTIVE" ? "neutral" : "positive"} />
                </div>
                <div className="absolute bottom-0 start-0 p-6">
                  <h3 className="font-headline-sm text-headline-sm text-inverse-on-surface">{campaign.title}</h3>
                  {campaign.status === "ACTIVE" ? (
                    <p className="text-sm text-inverse-on-surface/80 mt-1">
                      {t("reach", { count: campaign.reach })} · {t("conversion", { rate: campaign.conversionRate.toString() })}
                    </p>
                  ) : (
                    campaign.scheduledDate && (
                      <p className="text-sm text-inverse-on-surface/80 mt-1">
                        {t("scheduledFor", { date: formatDate(campaign.scheduledDate, locale) })}
                      </p>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{t("toolkit")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {toolkitItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="bg-surface-container-lowest border border-outline-variant/20 p-6 flex flex-col items-start gap-4 hover:border-primary transition-colors"
            >
              <Icon name={item.icon} size={28} className="text-primary" />
              <div>
                <h3 className="font-body-md text-primary">{t(`${item.key}Title`)}</h3>
                <p className="text-sm text-on-surface-variant mt-1">{t(`${item.key}Description`)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
