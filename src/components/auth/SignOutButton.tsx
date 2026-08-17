"use client";

import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/ui/icons/Icon";
import { cn } from "@/lib/cn";

export function SignOutButton({ className }: { className?: string }) {
  const t = useTranslations("Auth");
  const locale = useLocale();

  return (
    <form action="/api/logout" method="POST">
      <input type="hidden" name="redirectTo" value={`/${locale}`} />
      <button
        type="submit"
        className={cn(
          "flex items-center gap-4 px-4 py-3 w-full font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-lowest hover:text-error transition-all duration-300",
          className,
        )}
      >
        <Icon name="logout" size={20} weight={300} />
        {t("signOut")}
      </button>
    </form>
  );
}
