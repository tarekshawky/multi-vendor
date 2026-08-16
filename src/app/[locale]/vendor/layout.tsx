import { requireVendor } from "@/lib/session";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";

export default async function VendorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { vendor } = await requireVendor(locale);

  return (
    <>
      <VendorSidebar brandName={vendor.brandName} logoImage={vendor.logoImage} />
      <main className="md:ps-64 pt-[73px] md:pt-0 min-h-screen bg-surface">{children}</main>
    </>
  );
}
