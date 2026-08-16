"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icons/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const navItems = [
  { key: "dashboard", href: "/vendor/dashboard", icon: "dashboard" },
  { key: "collections", href: "/vendor/collections", icon: "inventory_2" },
  { key: "orders", href: "/vendor/orders", icon: "local_shipping" },
  { key: "customers", href: "/vendor/customers", icon: "group" },
  { key: "messages", href: "/vendor/messages", icon: "forum" },
  { key: "promotions", href: "/vendor/promotions", icon: "sell" },
  { key: "marketing", href: "/vendor/marketing", icon: "campaign" },
  { key: "analytics", href: "/vendor/analytics", icon: "trending_up" },
  { key: "settings", href: "/vendor/settings/profile", icon: "settings" },
] as const;

type VendorSidebarProps = {
  brandName: string;
  logoImage?: string | null;
};

function NavLinks({ pathname, t, onNavigate }: { pathname: string; t: (key: string) => string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-4 px-4 py-3 font-label-caps text-label-caps uppercase tracking-widest transition-all duration-300",
              active
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary",
            )}
          >
            <Icon name={item.icon} weight={active ? 500 : 300} size={20} />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}

export function VendorSidebar({ brandName, logoImage }: VendorSidebarProps) {
  const t = useTranslations("VendorNav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-screen fixed start-0 top-0 w-64 border-e border-outline-variant/20 bg-surface z-40 overflow-y-auto">
        <div className="flex flex-col items-center px-4 pt-8 pb-12">
          <Avatar src={logoImage} name={brandName} size={64} className="mb-4" />
          <p className="font-headline-sm text-headline-sm text-primary text-center">{brandName}</p>
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mt-1">
            {t("partnerStudio")}
          </p>
        </div>
        <div className="px-4 flex-1">
          <NavLinks pathname={pathname} t={t} />
        </div>
        <div className="p-4">
          <Link href="/vendor/collections/new/step-1" className={buttonClasses("primary", "md", "w-full")}>
            {t("addCollection")}
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex fixed top-0 w-full z-50 justify-between items-center bg-surface/95 backdrop-blur-md border-b border-outline-variant/20 px-margin-mobile py-4">
        <div className="flex items-center gap-3">
          <Avatar src={logoImage} name={brandName} size={32} />
          <p className="font-headline-sm text-headline-sm text-primary">{brandName}</p>
        </div>
        <button aria-label={t("menu")} onClick={() => setMenuOpen((v) => !v)} className="text-primary">
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] z-40 bg-surface px-4 py-6 overflow-y-auto">
          <NavLinks pathname={pathname} t={t} onNavigate={() => setMenuOpen(false)} />
          <div className="mt-6">
            <Link
              href="/vendor/collections/new/step-1"
              onClick={() => setMenuOpen(false)}
              className={buttonClasses("primary", "md", "w-full")}
            >
              {t("addCollection")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
