"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateStaffUser } from "@/server/actions/admin";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "WRITER";
};

export function EditStaffUserForm({ user, isSelf }: { user: StaffUser; isSelf: boolean }) {
  const t = useTranslations("AdminUsers");
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
      const result = await updateStaffUser(user.id, formData);
      if (!result.ok) {
        setError(
          result.error === "cannotChangeSelfRole" ? t("cannotChangeSelfRole") : tc(result.error ?? "deleteFailed"),
        );
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
        <Input type="text" name="name" defaultValue={user.name} required />
      </div>

      <div className="space-y-2">
        <label className="block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tc("loginEmail")}
        </label>
        <Input type="email" name="email" defaultValue={user.email} required />
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
          {t("role")}
        </label>
        {isSelf ? (
          <>
            {/* A disabled <select> wouldn't submit its value at all — keep the
                visible control disabled for UX, but carry the real value via
                a hidden input so the rest of the form (name/email/password)
                can still be saved for your own account. */}
            <Select name="role_display" defaultValue={user.role} disabled>
              <option value="ADMIN">{t("roleAdmin")}</option>
              <option value="WRITER">{t("roleWriter")}</option>
            </Select>
            <input type="hidden" name="role" value={user.role} />
            <p className="text-xs text-on-surface-variant">{t("cannotChangeSelfRole")}</p>
          </>
        ) : (
          <Select name="role" defaultValue={user.role}>
            <option value="ADMIN">{t("roleAdmin")}</option>
            <option value="WRITER">{t("roleWriter")}</option>
          </Select>
        )}
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
