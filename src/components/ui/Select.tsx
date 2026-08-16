import { cn } from "@/lib/cn";
import type { SelectHTMLAttributes } from "react";
import { Icon } from "./icons/Icon";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "input-editorial font-body-lg text-body-lg text-primary appearance-none pe-6",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute end-0 top-1/2 -translate-y-1/2 text-on-surface-variant"
        size={20}
      />
    </div>
  );
}
