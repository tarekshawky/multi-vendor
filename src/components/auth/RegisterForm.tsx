"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registerAction } from "@/server/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {t("name")}
        </label>
        <Input type="text" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {t("email")}
        </label>
        <Input type="email" name="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {t("password")}
        </label>
        <Input type="password" name="password" required minLength={8} autoComplete="new-password" />
      </div>
      {state?.error && <p className="text-error text-sm">{t(state.error)}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t("creatingAccount") : t("createAccount")}
      </Button>
      <p className="text-center text-sm text-on-surface-variant">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-primary underline">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
