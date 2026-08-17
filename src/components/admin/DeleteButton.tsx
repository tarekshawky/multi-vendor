"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type DeleteButtonProps = {
  confirmMessage: string;
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
  id: string;
  redirectTo?: string;
};

export function DeleteButton({ confirmMessage, action, id, redirectTo }: DeleteButtonProps) {
  const t = useTranslations("AdminCommon");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      const result = await action(id);
      if (!result.ok) {
        setError(result.error === "hasOrders" ? t("deleteBlockedHasOrders") : t("deleteFailed"));
      } else if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="font-label-caps text-label-caps uppercase tracking-widest text-error hover:opacity-70 transition-opacity disabled:opacity-40"
      >
        {t("delete")}
      </button>
      {error && <p className="text-error text-xs mt-1 max-w-40">{error}</p>}
    </div>
  );
}
