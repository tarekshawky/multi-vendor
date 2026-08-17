"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createCustomer, type AdminActionState } from "@/server/actions/admin";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function CreateCustomerForm({ locale }: { locale: string }) {
  const t = useTranslations("AdminCustomers");
  const tc = useTranslations("AdminCommon");
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(createCustomer, undefined);

  return (
    <form action={formAction} className="space-y-8 max-w-lg">
      <input type="hidden" name="locale" value={locale} />
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("name")}
        </label>
        <Input type="text" name="name" required autoComplete="name" />
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
          {t("vipTier")}
        </label>
        <Select name="vipTier" defaultValue="STANDARD">
          <option value="STANDARD">STANDARD</option>
          <option value="ELITE">ELITE</option>
          <option value="VIP">VIP</option>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("phone")}
        </label>
        <Input type="text" name="phone" />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("location")}
        </label>
        <Input type="text" name="location" />
      </div>
      {state?.error && <p className="text-error text-sm">{tc(state.error)}</p>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? tc("creating") : tc("create")}
      </Button>
    </form>
  );
}
