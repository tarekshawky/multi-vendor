"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createVendor, type AdminActionState } from "@/server/actions/admin";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function CreateVendorForm({ locale }: { locale: string }) {
  const t = useTranslations("AdminVendors");
  const tc = useTranslations("AdminCommon");
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(createVendor, undefined);

  return (
    <form action={formAction} className="space-y-8 max-w-lg">
      <input type="hidden" name="locale" value={locale} />
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {t("brandName")}
        </label>
        <Input type="text" name="brandName" required />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("email")}
        </label>
        <Input type="email" name="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("password")}
        </label>
        <Input type="password" name="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {t("currency")}
        </label>
        <Select name="currency" defaultValue="USD">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </Select>
      </div>
      {state?.error && <p className="text-error text-sm">{tc(state.error)}</p>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? tc("creating") : tc("create")}
      </Button>
    </form>
  );
}
