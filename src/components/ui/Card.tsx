import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("bg-surface-container-lowest border border-outline-variant/20 p-8", className)}
      {...props}
    />
  );
}
