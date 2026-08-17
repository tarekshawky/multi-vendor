import { requireAdmin } from "@/lib/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);

  return (
    <>
      <AdminSidebar />
      <main className="md:ps-64 pt-[73px] md:pt-0 min-h-screen bg-surface">{children}</main>
    </>
  );
}
