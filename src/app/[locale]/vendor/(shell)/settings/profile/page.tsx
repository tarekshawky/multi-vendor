import { getTranslations } from "next-intl/server";
import { requireVendor } from "@/lib/session";
import { VendorSettingsForm } from "@/components/vendor/settings/VendorSettingsForm";

export default async function VendorSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { vendor } = await requireVendor(locale);
  const t = await getTranslations("VendorSettings");

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <h1 className="font-display text-headline-lg text-primary mb-12">{t("title")}</h1>
      <VendorSettingsForm
        vendor={vendor}
        labels={{
          brandProfile: t("brandProfile"),
          logo: t("logo"),
          coverImage: t("coverImage"),
          brandName: t("brandName"),
          tagline: t("tagline"),
          bio: t("bio"),
          businessInformation: t("businessInformation"),
          contactEmail: t("contactEmail"),
          phone: t("phone"),
          hqAddress: t("hqAddress"),
          policyManagement: t("policyManagement"),
          shippingPolicy: t("shippingPolicy"),
          bespokePolicy: t("bespokePolicy"),
          save: t("save"),
          saving: t("saving"),
          saved: t("saved"),
          accountPreferences: t("accountPreferences"),
          orderNotifications: t("orderNotifications"),
          orderNotificationsHint: t("orderNotificationsHint"),
          marketingUpdates: t("marketingUpdates"),
          marketingUpdatesHint: t("marketingUpdatesHint"),
          passwordSecurity: t("passwordSecurity"),
          updatePassword: t("updatePassword"),
          partnerSupport: t("partnerSupport"),
          partnerSupportCopy: t("partnerSupportCopy"),
        }}
      />
    </div>
  );
}
