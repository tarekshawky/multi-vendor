import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EditVendorForm } from "@/components/admin/EditVendorForm";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("AdminVendors");

  const vendor = await prisma.vendorProfile.findUnique({ where: { id } });
  if (!vendor) notFound();

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <Breadcrumb items={[{ label: t("title"), href: "/admin/vendors" }, { label: vendor.brandName }]} />
      <h1 className="font-display text-headline-lg text-primary mt-6 mb-12">{t("editVendor")}</h1>
      <EditVendorForm vendor={vendor} />
    </div>
  );
}
