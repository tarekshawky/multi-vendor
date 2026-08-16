"use client";

import { useState } from "react";
import { createPromoCode } from "@/server/actions/promotions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type Labels = {
  createPromoCode: string;
  code: string;
  title: string;
  description: string;
  discountType: string;
  percent: string;
  fixed: string;
  freeShipping: string;
  discountValue: string;
  minOrderValue: string;
  usageLimit: string;
  validFrom: string;
  validUntil: string;
  create: string;
  cancel: string;
};

export function CreatePromoForm({ labels }: { labels: Labels }) {
  const [open, setOpen] = useState(false);
  const [defaultDates] = useState(() => ({
    from: new Date().toISOString().slice(0, 10),
    until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  }));

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        {labels.createPromoCode}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4">
      <form
        action={async (formData) => {
          await createPromoCode(formData);
          setOpen(false);
        }}
        className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/30 p-8 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-headline-sm text-headline-sm text-primary">{labels.createPromoCode}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.code}
            </label>
            <Input name="code" required placeholder="SUMMER20" />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.title}
            </label>
            <Input name="title" required />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
            {labels.description}
          </label>
          <Textarea name="description" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.discountType}
            </label>
            <Select name="discountType" defaultValue="PERCENT">
              <option value="PERCENT">{labels.percent}</option>
              <option value="FIXED">{labels.fixed}</option>
              <option value="FREE_SHIPPING">{labels.freeShipping}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.discountValue}
            </label>
            <Input name="discountValue" type="number" min={0} step="0.01" defaultValue={10} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.minOrderValue}
            </label>
            <Input name="minOrderValue" type="number" min={0} step="0.01" />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.usageLimit}
            </label>
            <Input name="usageLimit" type="number" min={0} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.validFrom}
            </label>
            <Input name="validFrom" type="date" required defaultValue={defaultDates.from} />
          </div>
          <div className="space-y-2">
            <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {labels.validUntil}
            </label>
            <Input
              name="validUntil"
              type="date"
              required
              defaultValue={defaultDates.until}
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">
            {labels.create}
          </Button>
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
            {labels.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}
