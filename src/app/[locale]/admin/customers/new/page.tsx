import { getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CreateCustomerForm } from "@/components/admin/CreateCustomerForm";

export default async function NewCustomerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("AdminCustomers");

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <Breadcrumb items={[{ label: t("title"), href: "/admin/customers" }, { label: t("createCustomer") }]} />
      <h1 className="font-display text-headline-lg text-primary mt-6 mb-12">{t("createCustomer")}</h1>
      <CreateCustomerForm locale={locale} />
    </div>
  );
}
