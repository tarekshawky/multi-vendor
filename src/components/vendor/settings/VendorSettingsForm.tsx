"use client";

import { useState, useTransition } from "react";
import { updateVendorProfile } from "@/server/actions/vendor-settings";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { ImageUploadField } from "@/components/vendor/ImageUploadField";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

type VendorSettingsFormProps = {
  vendor: {
    brandName: string;
    tagline: string | null;
    bio: string | null;
    logoImage: string | null;
    coverImage: string | null;
    contactEmail: string | null;
    phone: string | null;
    hqAddress: string | null;
    shippingPolicy: string | null;
    bespokePolicy: string | null;
    orderNotificationsEnabled: boolean;
    marketingUpdatesEnabled: boolean;
  };
  labels: Record<string, string>;
};

export function VendorSettingsForm({ vendor, labels }: VendorSettingsFormProps) {
  const [orderNotifications, setOrderNotifications] = useState(vendor.orderNotificationsEnabled);
  const [marketingUpdates, setMarketingUpdates] = useState(vendor.marketingUpdatesEnabled);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("orderNotificationsEnabled", String(orderNotifications));
    formData.set("marketingUpdatesEnabled", String(marketingUpdates));
    startTransition(async () => {
      await updateVendorProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-12">
        <section className="space-y-6">
          <h2 className="font-headline-sm text-headline-sm text-primary">{labels.brandProfile}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                {labels.logo}
              </label>
              <ImageUploadField name="logoImage" defaultValue={vendor.logoImage} className="aspect-square" />
            </div>
            <div className="space-y-2">
              <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                {labels.coverImage}
              </label>
              <ImageUploadField name="coverImage" defaultValue={vendor.coverImage} className="aspect-square" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.brandName}
            </label>
            <Input name="brandName" defaultValue={vendor.brandName} required />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.tagline}
            </label>
            <Input name="tagline" defaultValue={vendor.tagline ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.bio}
            </label>
            <Textarea name="bio" rows={4} defaultValue={vendor.bio ?? ""} />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-headline-sm text-headline-sm text-primary">{labels.businessInformation}</h2>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.contactEmail}
            </label>
            <Input type="email" name="contactEmail" defaultValue={vendor.contactEmail ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.phone}
            </label>
            <Input name="phone" defaultValue={vendor.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.hqAddress}
            </label>
            <Input name="hqAddress" defaultValue={vendor.hqAddress ?? ""} />
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-headline-sm text-headline-sm text-primary">{labels.policyManagement}</h2>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.shippingPolicy}
            </label>
            <Textarea name="shippingPolicy" rows={3} defaultValue={vendor.shippingPolicy ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.bespokePolicy}
            </label>
            <Textarea name="bespokePolicy" rows={3} defaultValue={vendor.bespokePolicy ?? ""} />
          </div>
        </section>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={pending}>
            {pending ? labels.saving : labels.save}
          </Button>
          {saved && <span className="text-sm text-on-surface-variant">{labels.saved}</span>}
        </div>
      </form>

      <div className="space-y-8">
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-6">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-6">{labels.accountPreferences}</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-primary font-medium">{labels.orderNotifications}</p>
                <p className="text-sm text-on-surface-variant">{labels.orderNotificationsHint}</p>
              </div>
              <Switch checked={orderNotifications} onCheckedChange={setOrderNotifications} aria-label={labels.orderNotifications} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-primary font-medium">{labels.marketingUpdates}</p>
                <p className="text-sm text-on-surface-variant">{labels.marketingUpdatesHint}</p>
              </div>
              <Switch checked={marketingUpdates} onCheckedChange={setMarketingUpdates} aria-label={labels.marketingUpdates} />
            </div>
          </div>
          <div className="border-t border-outline-variant/20 mt-6 pt-6">
            <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
              {labels.passwordSecurity}
            </p>
            <ChangePasswordForm triggerClassName="text-sm text-primary underline" />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/20 p-6">
          <p className="font-body-md text-primary mb-2">{labels.partnerSupport}</p>
          <p className="text-sm text-on-surface-variant">{labels.partnerSupportCopy}</p>
        </div>
      </div>
    </div>
  );
}
