import { Icon } from "./icons/Icon";
import { Link } from "@/i18n/navigation";
import { Fragment } from "react";

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <Icon name="chevron_right" size={14} className="rtl:rotate-180" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-primary">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
