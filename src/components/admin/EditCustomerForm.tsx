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
  vipTier: string;
  phone: string | null;
  location: string | null;
};

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const t = useTranslations("AdminCustomers");
  const tc = useTranslations("AdminCommon");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSaved(false);
    startTransition(async () => {
      await updateCustomer(customer.id, formData);
      setSaved(true);
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
      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? tc("saving") : tc("saveChanges")}
        </Button>
        {saved && !pending && <span className="text-sm text-on-surface-variant">{tc("saved")}</span>}
      </div>
    </form>
  );
}
