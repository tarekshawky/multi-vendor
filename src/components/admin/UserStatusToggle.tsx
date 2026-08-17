"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { setUserStatus } from "@/server/actions/admin";
import type { UserStatus } from "@/generated/prisma/client";

export function UserStatusToggle({
  userId,
  status,
  disabled,
}: {
  userId: string;
  status: UserStatus;
  disabled?: boolean;
}) {
  const tc = useTranslations("AdminCommon");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next: UserStatus = status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    startTransition(async () => {
      const result = await setUserStatus(userId, next);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending || disabled}
      title={disabled ? tc("cannotSuspendSelf") : undefined}
      className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40 disabled:hover:text-on-surface-variant"
    >
      {status === "SUSPENDED" ? tc("activateAccount") : tc("suspendAccount")}
    </button>
  );
}
