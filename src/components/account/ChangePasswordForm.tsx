"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { changePassword } from "@/server/actions/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ChangePasswordForm({ triggerClassName }: { triggerClassName?: string }) {
  const t = useTranslations("Account");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await changePassword(formData);
      if (!result.ok) {
        setError(t(result.error ?? "genericError"));
      } else {
        setSuccess(true);
        form.reset();
      }
    });
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName ?? "text-sm text-primary underline"}>
        {t("updatePassword")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-outline-variant/30 p-4 bg-surface-container-lowest">
      <div className="flex items-center justify-between">
        <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">{t("updatePassword")}</p>
        <button type="button" onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-primary text-sm">
          ✕
        </button>
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
          {t("currentPassword")}
        </label>
        <Input type="password" name="currentPassword" required autoComplete="current-password" />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
          {t("newPassword")}
        </label>
        <Input type="password" name="newPassword" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="space-y-2">
        <label className="block font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
          {t("confirmPassword")}
        </label>
        <Input type="password" name="confirmPassword" required minLength={8} autoComplete="new-password" />
      </div>
      {error && <p className="text-error text-sm">{error}</p>}
      {success && <p className="text-sm text-on-surface-variant">{t("passwordUpdated")}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? t("updating") : t("updatePassword")}
      </Button>
    </form>
  );
}
