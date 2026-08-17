import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EditCustomerForm } from "@/components/admin/EditCustomerForm";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("AdminCustomers");

  const user = await prisma.user.findUnique({
    where: { id, role: "CUSTOMER" },
    include: { customerProfile: true },
  });
  if (!user) notFound();

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <Breadcrumb items={[{ label: t("title"), href: "/admin/customers" }, { label: user.name }]} />
      <h1 className="font-display text-headline-lg text-primary mt-6 mb-12">{t("editCustomer")}</h1>
      <EditCustomerForm
        customer={{
          id: user.id,
          name: user.name,
          vipTier: user.customerProfile?.vipTier ?? "STANDARD",
          phone: user.customerProfile?.phone ?? null,
          location: user.customerProfile?.location ?? null,
        }}
      />
    </div>
  );
}
