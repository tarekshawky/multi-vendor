import { requireWriter } from "@/lib/session";
import { WriterSidebar } from "@/components/writer/WriterSidebar";

export default async function WriterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { user } = await requireWriter(locale);

  return (
    <>
      <WriterSidebar name={user.name ?? "Writer"} />
      <main className="md:ps-64 pt-[73px] md:pt-0 min-h-screen bg-surface">{children}</main>
    </>
  );
}
