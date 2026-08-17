"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateVendor } from "@/server/actions/admin";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type Vendor = {
  id: string;
  loginName: string;
  loginEmail: string;
  brandName: string;
  tagline: string | null;
  bio: string | null;
  contactEmail: string | null;
  phone: string | null;
  hqAddress: string | null;
  currency: string;
};

export function EditVendorForm({ vendor }: { vendor: Vendor }) {
  const t = useTranslations("AdminVendors");
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
      const result = await updateVendor(vendor.id, formData);
      if (!result.ok) {
        setError(tc(result.error ?? "deleteFailed"));
      } else {
        setSaved(true);
        form.querySelector<HTMLInputElement>('input[name="newPassword"]')!.value = "";
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 max-w-lg">
      <div className="space-y-8">
        <h2 className="font-headline-sm text-headline-sm text-primary">{tc("accountCredentials")}</h2>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {tc("name")}
          </label>
          <Input type="text" name="name" defaultValue={vendor.loginName} required />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {tc("loginEmail")}
          </label>
          <Input type="email" name="email" defaultValue={vendor.loginEmail} required />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {tc("newPassword")}
          </label>
          <Input type="password" name="newPassword" minLength={8} autoComplete="new-password" />
          <p className="text-xs text-on-surface-variant">{tc("passwordHint")}</p>
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-outline-variant/20">
        <h2 className="font-headline-sm text-headline-sm text-primary">{t("title")}</h2>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("brandName")}
          </label>
          <Input type="text" name="brandName" defaultValue={vendor.brandName} required />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("tagline")}
          </label>
          <Input type="text" name="tagline" defaultValue={vendor.tagline ?? ""} />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("bio")}
          </label>
          <Textarea name="bio" rows={4} defaultValue={vendor.bio ?? ""} />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {tc("email")}
          </label>
          <Input type="email" name="contactEmail" defaultValue={vendor.contactEmail ?? ""} />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("phone")}
          </label>
          <Input type="text" name="phone" defaultValue={vendor.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("hqAddress")}
          </label>
          <Input type="text" name="hqAddress" defaultValue={vendor.hqAddress ?? ""} />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {t("currency")}
          </label>
          <Select name="currency" defaultValue={vendor.currency}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </Select>
        </div>
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
