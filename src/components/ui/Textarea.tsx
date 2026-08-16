import { cn } from "@/lib/cn";
import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "input-editorial font-body-lg text-body-lg text-primary placeholder:text-on-surface-variant/60 resize-none",
        className,
      )}
      {...props}
    />
  );
}
