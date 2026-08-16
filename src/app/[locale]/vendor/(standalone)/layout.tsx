import { requireVendor } from "@/lib/session";

export default async function VendorStandaloneLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireVendor(locale);

  return <>{children}</>;
}
