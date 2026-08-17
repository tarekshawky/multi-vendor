import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { CartProvider } from "@/components/storefront/CartContext";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <CartProvider>
        <SiteHeader />
        <main className="pt-24 md:pt-32">{children}</main>
        <SiteFooter />
        <CartDrawer />
      </CartProvider>
    </AuthSessionProvider>
  );
}
