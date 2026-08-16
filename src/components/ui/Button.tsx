import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-label-caps text-label-caps uppercase tracking-widest whitespace-nowrap rounded-none transition-colors duration-300 ease-in-out disabled:opacity-40 disabled:pointer-events-none",
    {
      sm: "px-4 py-2",
      md: "px-6 py-3",
      lg: "px-8 py-4",
    }[size],
    {
      primary: "bg-primary text-on-primary hover:bg-secondary-fixed hover:text-on-secondary-fixed",
      secondary: "border border-primary text-primary bg-transparent hover:bg-primary hover:text-on-primary",
      ghost: "text-on-surface-variant hover:text-primary",
      danger: "bg-error text-on-error hover:opacity-90",
    }[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}
