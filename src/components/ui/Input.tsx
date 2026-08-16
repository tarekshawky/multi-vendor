import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "input-editorial font-body-lg text-body-lg text-primary placeholder:text-on-surface-variant/60",
        className,
      )}
      {...props}
    />
  );
}
