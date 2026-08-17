import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EditStaffUserForm } from "@/components/admin/EditStaffUserForm";

export default async function EditStaffUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("AdminUsers");
  const session = await auth();

  const user = await prisma.user.findFirst({
    where: { id, role: { in: ["ADMIN", "WRITER"] } },
  });
  if (!user) notFound();

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <Breadcrumb items={[{ label: t("title"), href: "/admin/users" }, { label: user.name }]} />
      <h1 className="font-display text-headline-lg text-primary mt-6 mb-12">{t("editUser")}</h1>
      <EditStaffUserForm
        user={{ id: user.id, name: user.name, email: user.email, role: user.role as "ADMIN" | "WRITER" }}
        isSelf={session?.user?.id === user.id}
      />
    </div>
  );
}
