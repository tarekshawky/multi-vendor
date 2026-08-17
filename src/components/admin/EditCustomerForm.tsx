"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateCustomer } from "@/server/actions/admin";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type Customer = {
  id: string;
  name: string;
  email: string;
  vipTier: string;
  phone: string | null;
  location: string | null;
};

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const t = useTranslations("AdminCustomers");
  const tc = useTranslations("AdminCommon");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await updateCustomer(customer.id, formData);
      if (!result.ok) {
        setError(tc(result.error ?? "deleteFailed"));
      } else {
        setSaved(true);
        form.querySelector<HTMLInputElement>('input[name="newPassword"]')!.value = "";
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("name")}
        </label>
        <Input type="text" name="name" defaultValue={customer.name} required />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("loginEmail")}
        </label>
        <Input type="email" name="email" defaultValue={customer.email} required />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("newPassword")}
        </label>
        <Input type="password" name="newPassword" minLength={8} autoComplete="new-password" />
        <p className="text-xs text-on-surface-variant">{tc("passwordHint")}</p>
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {t("vipTier")}
        </label>
        <Select name="vipTier" defaultValue={customer.vipTier}>
          <option value="STANDARD">STANDARD</option>
          <option value="ELITE">ELITE</option>
          <option value="VIP">VIP</option>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("phone")}
        </label>
        <Input type="text" name="phone" defaultValue={customer.phone ?? ""} />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("location")}
        </label>
        <Input type="text" name="location" defaultValue={customer.location ?? ""} />
      </div>
      {error && <p className="text-error text-sm">{error}</p>}
      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? tc("saving") : tc("saveChanges")}
        </Button>
        {saved && !pending && <span className="text-sm text-on-surface-variant">{tc("saved")}</span>}
      </div>
    </form>
  );
}
