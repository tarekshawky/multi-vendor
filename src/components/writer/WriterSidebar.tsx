"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icons/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClasses } from "@/components/ui/Button";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { cn } from "@/lib/cn";

const navItems = [
  { key: "dashboard", href: "/writer/dashboard", icon: "dashboard" },
  { key: "stories", href: "/writer/stories", icon: "auto_stories" },
] as const;

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

export function WriterSidebar({ name }: { name: string }) {
  const t = useTranslations("WriterNav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-screen fixed start-0 top-0 w-64 border-e border-outline-variant/20 bg-surface z-40 overflow-y-auto">
        <div className="flex flex-col items-center px-4 pt-8 pb-12">
          <Avatar name={name} size={64} className="mb-4" />
          <p className="font-headline-sm text-headline-sm text-primary text-center">{name}</p>
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mt-1">
            {t("subtitle")}
          </p>
        </div>
        <div className="px-4 flex-1">
          <NavLinks pathname={pathname} t={t} />
        </div>
        <div className="px-4 pb-2">
          <SignOutButton />
        </div>
        <div className="p-4">
          <Link href="/writer/stories/new" className={buttonClasses("primary", "md", "w-full")}>
            {t("newStory")}
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex fixed top-0 w-full z-50 justify-between items-center bg-surface/95 backdrop-blur-md border-b border-outline-variant/20 px-margin-mobile py-4">
        <div className="flex items-center gap-3">
          <Avatar name={name} size={32} />
          <p className="font-headline-sm text-headline-sm text-primary">{name}</p>
        </div>
        <button aria-label={t("menu")} onClick={() => setMenuOpen((v) => !v)} className="text-primary">
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] z-40 bg-surface px-4 py-6 overflow-y-auto">
          <NavLinks pathname={pathname} t={t} onNavigate={() => setMenuOpen(false)} />
          <div className="mt-4">
            <SignOutButton />
          </div>
          <div className="mt-6">
            <Link
              href="/writer/stories/new"
              onClick={() => setMenuOpen(false)}
              className={buttonClasses("primary", "md", "w-full")}
            >
              {t("newStory")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
