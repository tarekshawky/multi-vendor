import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type TagProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  dashed?: boolean;
};

export function Tag({ active = false, dashed = false, className, ...props }: TagProps) {
  return (
    <button
      type="button"
      className={cn(
        "px-4 py-2 font-label-caps text-label-caps uppercase tracking-widest cursor-pointer transition-colors duration-300",
        dashed
          ? "border border-dashed border-outline-variant text-on-surface-variant hover:border-primary"
          : active
            ? "bg-primary text-on-primary border border-primary"
            : "bg-surface-container border border-outline-variant/50 text-primary hover:bg-primary hover:text-on-primary",
        className,
      )}
      {...props}
    />
  );
}
