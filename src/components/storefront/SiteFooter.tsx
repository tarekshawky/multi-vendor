import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const links = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
  { key: "careers", href: "/careers" },
  { key: "contact", href: "/contact" },
  { key: "shipping", href: "/shipping" },
] as const;

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-surface w-full py-section-gap px-margin-mobile md:px-margin-desktop border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-8">
      <div className="font-headline-sm text-headline-sm text-primary tracking-widest">VOGUE-CHIC</div>
      <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors duration-300"
          >
            {t(link.key)}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        <span aria-hidden="true">·</span>
        <a
          href="https://tarekshawky.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors duration-300"
        >
          {t("credit")}
        </a>
      </div>
    </footer>
  );
}
