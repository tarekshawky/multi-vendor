"use client";

import { cn } from "@/lib/cn";

type Tab = { value: string; label: string };

type TabsProps = {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  variant?: "underline" | "pill";
  className?: string;
};

export function Tabs({ tabs, value, onChange, variant = "underline", className }: TabsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "font-label-caps text-label-caps uppercase tracking-widest transition-colors duration-300",
              variant === "underline"
                ? cn(
                    "pb-2 border-b-2",
                    active
                      ? "text-primary border-primary"
                      : "text-on-surface-variant border-transparent hover:text-primary",
                  )
                : cn(
                    "px-4 py-2",
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
                  ),
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
