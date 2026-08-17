"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Icon } from "@/components/ui/icons/Icon";
import { CountBadge } from "@/components/ui/Badge";
import { SearchOverlay } from "@/components/storefront/SearchOverlay";
import { useCart } from "@/components/storefront/CartContext";
import { cn } from "@/lib/cn";

const navItems = [
  { key: "designers", href: "/designers" },
  { key: "collections", href: "/collections" },
  { key: "editorial", href: "/editorial" },
  { key: "newArrivals", href: "/collections?sort=new" },
] as const;

const roleDestinations: Record<string, string> = {
  VENDOR: "/vendor/dashboard",
  ADMIN: "/admin/dashboard",
  WRITER: "/writer/dashboard",
};

function useProfileHref(pathname: string) {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session?.user) {
    return `/login?callbackUrl=${encodeURIComponent(pathname)}`;
  }
  return roleDestinations[session.user.role as string] ?? "/account";
}

function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className={cn("flex items-center gap-2 font-label-caps text-label-caps", className)}>
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-2">
          {i > 0 && <span className="text-outline-variant">/</span>}
          <Link
            href={pathname}
            locale={loc}
            className={loc === locale ? "text-primary" : "text-on-surface-variant hover:text-primary transition-colors"}
          >
            {loc.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalCount, open: openCart } = useCart();
  const profileHref = useProfileHref(pathname);

  return (
    <>
      {/* Tablet header (md–lg): the desktop header's absolutely-centered
          logo has no reserved space, so nav links collide with it once the
          row gets tight — verified broken as late as 1024px. Give tablet
          its own two-row layout instead: logo left + icons right on top,
          nav wrapped and centered underneath in a smaller size. */}
      <header className="hidden md:flex 2xl:hidden flex-col bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 px-margin-desktop py-4 max-w-container-max mx-auto border-b border-outline-variant/30 gap-4 duration-500 ease-in-out">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="font-display text-headline-sm text-primary tracking-tighter hover:opacity-70 transition-opacity duration-500 cursor-pointer"
          >
            VOGUE-CHIC
          </Link>
          <div className="flex items-center gap-5">
            <LocaleSwitcher />
            <button
              type="button"
              aria-label={t("search")}
              onClick={() => setSearchOpen(true)}
              className="text-primary hover:opacity-70 transition-opacity duration-500"
            >
              <Icon name="search" weight={300} />
            </button>
            <Link href={profileHref} aria-label={t("profile")} className="text-primary hover:opacity-70 transition-opacity duration-500">
              <Icon name="person" weight={300} />
            </Link>
            <button
              type="button"
              aria-label={t("bag")}
              onClick={openCart}
              className="relative text-primary hover:opacity-70 transition-opacity duration-500"
            >
              <Icon name="shopping_bag" weight={300} />
              <CountBadge count={totalCount} />
            </button>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-5">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "font-label-caps text-[10px] uppercase tracking-widest transition-colors duration-300",
                pathname === item.href
                  ? "text-primary border-b border-primary pb-1"
                  : "text-on-surface-variant hover:text-primary",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </header>

      {/* Desktop header (2xl+ only). Uses a 3-column grid instead of an
          absolutely-positioned centered logo, but the nav's rendered width
          (~550px) only comfortably fits once the row's side columns reach
          their stable share of the 1440px container cap — anywhere below
          that (down through 1280px) the columns are still narrower than
          the container's max, so the nav can overflow into the logo's
          column (a flex/grid min-width:auto quirk) even though nothing
          here is absolutely positioned anymore. Waiting for 2xl guarantees
          the container is already saturated at 1440px before this layout
          is used, instead of chasing a flaky pixel-perfect threshold. */}
      <header className="hidden 2xl:grid grid-cols-[1fr_auto_1fr] bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-50 items-center px-margin-desktop py-unit max-w-container-max mx-auto border-b border-outline-variant/30 duration-500 ease-in-out">
        <nav className="flex gap-8 justify-self-start">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "font-label-caps text-label-caps uppercase tracking-widest transition-colors duration-300",
                pathname === item.href
                  ? "text-primary border-b border-primary pb-1"
                  : "text-on-surface-variant hover:text-primary",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="justify-self-center font-display text-headline-lg text-primary tracking-tighter hover:opacity-70 transition-opacity duration-500 cursor-pointer"
        >
          VOGUE-CHIC
        </Link>
        <div className="flex items-center gap-6 justify-self-end">
          <LocaleSwitcher />
          <button
            type="button"
            aria-label={t("search")}
            onClick={() => setSearchOpen(true)}
            className="text-primary hover:opacity-70 transition-opacity duration-500"
          >
            <Icon name="search" weight={300} />
          </button>
          <Link href={profileHref} aria-label={t("profile")} className="text-primary hover:opacity-70 transition-opacity duration-500">
            <Icon name="person" weight={300} />
          </Link>
          <button
            type="button"
            aria-label={t("bag")}
            onClick={openCart}
            className="relative text-primary hover:opacity-70 transition-opacity duration-500"
          >
            <Icon name="shopping_bag" weight={300} />
            <CountBadge count={totalCount} />
          </button>
        </div>
      </header>

      {/* Mobile header */}
      <header className="md:hidden flex bg-surface/90 backdrop-blur-md fixed top-0 w-full z-50 justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/20">
        <Link href="/" className="font-display text-headline-sm text-primary tracking-tighter">
          VOGUE-CHIC
        </Link>
        <div className="flex items-center gap-5">
          <button type="button" aria-label={t("search")} onClick={() => setSearchOpen(true)} className="text-primary">
            <Icon name="search" />
          </button>
          <button type="button" aria-label={t("bag")} onClick={openCart} className="relative text-primary">
            <Icon name="shopping_bag" />
            <CountBadge count={totalCount} />
          </button>
          <button aria-label={t("menu")} onClick={() => setMenuOpen((v) => !v)} className="text-primary">
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-40 bg-surface px-margin-mobile py-8 flex flex-col gap-6">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-label-caps text-label-caps uppercase tracking-widest text-primary"
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href={profileHref}
            onClick={() => setMenuOpen(false)}
            className="font-label-caps text-label-caps uppercase tracking-widest text-primary"
          >
            {t("profile")}
          </Link>
          <LocaleSwitcher className="pt-6 border-t border-outline-variant/30" />
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
