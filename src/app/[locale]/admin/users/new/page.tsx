import { getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CreateStaffUserForm } from "@/components/admin/CreateStaffUserForm";

export default async function NewStaffUserPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("AdminUsers");

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <Breadcrumb items={[{ label: t("title"), href: "/admin/users" }, { label: t("createUser") }]} />
      <h1 className="font-display text-headline-lg text-primary mt-6 mb-12">{t("createUser")}</h1>
      <CreateStaffUserForm locale={locale} />
    </div>
  );
}
