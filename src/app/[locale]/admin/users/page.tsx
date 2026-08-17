import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/ui/StatusPill";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { buttonClasses } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { UserStatusToggle } from "@/components/admin/UserStatusToggle";
import { deleteStaffUser } from "@/server/actions/admin";
import { formatDate } from "@/lib/format";
import { userStatusTone } from "@/lib/status-tone";
import type { UserStatus } from "@/generated/prisma/client";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: Date;
};

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("AdminUsers");
  const tc = await getTranslations("AdminCommon");
  const session = await auth();

  const users = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "WRITER"] } },
    orderBy: { createdAt: "desc" },
  });

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
  }));

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      header: t("user"),
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size={32} />
          <span className="text-primary">{r.name}</span>
        </div>
      ),
    },
    { key: "email", header: tc("email"), render: (r) => r.email },
    {
      key: "role",
      header: t("role"),
      render: (r) => <Badge variant="outline">{r.role}</Badge>,
    },
    { key: "createdAt", header: t("created"), render: (r) => formatDate(r.createdAt, locale) },
    {
      key: "status",
      header: tc("accountStatus"),
      align: "end",
      render: (r) => (
        <StatusPill label={r.status === "SUSPENDED" ? tc("suspended") : tc("active")} tone={userStatusTone(r.status)} />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (r) => (
        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/admin/users/${r.id}/edit`}
            className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
          >
            {tc("edit")}
          </Link>
          <UserStatusToggle userId={r.id} status={r.status} disabled={session?.user?.id === r.id} />
          <DeleteButton id={r.id} action={deleteStaffUser} confirmMessage={tc("confirmDeleteVendor", { name: r.name })} />
        </div>
      ),
    },
  ];

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-12 max-w-container-max">
      <div className="flex items-center justify-between mb-12">
        <h1 className="font-display text-headline-lg text-primary">{t("title")}</h1>
        <Link href="/admin/users/new" className={buttonClasses("primary", "md")}>
          {t("createUser")}
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-on-surface-variant text-center py-24">{t("empty")}</p>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-8">
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
        </div>
      )}
    </div>
  );
}
