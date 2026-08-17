import { getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CreateVendorForm } from "@/components/admin/CreateVendorForm";

export default async function NewVendorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("AdminVendors");

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <Breadcrumb items={[{ label: t("title"), href: "/admin/vendors" }, { label: t("createVendor") }]} />
      <h1 className="font-display text-headline-lg text-primary mt-6 mb-12">{t("createVendor")}</h1>
      <CreateVendorForm locale={locale} />
    </div>
  );
}
