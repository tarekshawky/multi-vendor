import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "solid" | "outline";
};

export function Badge({ variant = "solid", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-3 py-1 font-label-caps text-[10px] uppercase tracking-widest",
        variant === "solid" ? "bg-primary text-on-primary" : "border border-outline-variant text-on-surface-variant",
        className,
      )}
      {...props}
    />
  );
}

export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary-fixed text-[10px] font-bold text-on-secondary-fixed",
        className,
      )}
    >
      {count}
    </span>
  );
}
