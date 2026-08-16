"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";

type Option = { value: string; label: string };

export function SortSelect({ options, ariaLabel }: { options: Option[]; ariaLabel: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Select
      aria-label={ariaLabel}
      defaultValue={searchParams.get("sort") ?? "newest"}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value === "newest") {
          params.delete("sort");
        } else {
          params.set("sort", e.target.value);
        }
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
