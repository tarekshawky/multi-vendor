import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return <input type="checkbox" className={cn("editorial-checkbox", className)} {...props} />;
}
