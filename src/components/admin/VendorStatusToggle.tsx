"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { updateVendorStatus } from "@/server/actions/admin";
import type { VendorStatus } from "@/generated/prisma/client";

export function VendorStatusToggle({ vendorId, status }: { vendorId: string; status: VendorStatus }) {
  const t = useTranslations("AdminVendors");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next: VendorStatus = status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    startTransition(async () => {
      await updateVendorStatus(vendorId, next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
    >
      {status === "SUSPENDED" ? t("activate") : t("suspend")}
    </button>
  );
}
