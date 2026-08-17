"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loginAction } from "@/server/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm({ locale, callbackUrl }: { locale: string; callbackUrl?: string }) {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
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
        <Input type="password" name="password" required autoComplete="current-password" />
      </div>
      {state?.error && <p className="text-error text-sm">{t(state.error)}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t("signingIn") : t("signIn")}
      </Button>
      <p className="text-center text-sm text-on-surface-variant">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-primary underline">
          {t("createOne")}
        </Link>
      </p>
    </form>
  );
}
