import { cn } from "@/lib/cn";
import { Icon } from "./icons/Icon";

type StatCardProps = {
  label: string;
  value: string;
  icon?: string;
  trend?: { direction: "up" | "down"; label: string };
  inverted?: boolean;
  className?: string;
};

export function StatCard({ label, value, icon, trend, inverted = false, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-between gap-6 p-8 border",
        inverted
          ? "bg-primary text-on-primary border-primary"
          : "bg-surface-container-lowest text-primary border-outline-variant/20",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-label-caps text-label-caps uppercase tracking-widest",
            inverted ? "text-on-primary/70" : "text-on-surface-variant",
          )}
        >
          {label}
        </span>
        {icon && (
          <Icon name={icon} className={cn("shrink-0", inverted ? "text-on-primary/70" : "text-on-surface-variant")} />
        )}
      </div>
      <div className="min-w-0">
        <div className="font-headline-lg text-headline-lg wrap-break-word">{value}</div>
        {trend && (
          <div
            className={cn(
              "mt-1 flex items-center gap-1 text-sm",
              inverted ? "text-on-primary/80" : "text-on-surface-variant",
            )}
          >
            <Icon
              name={trend.direction === "up" ? "arrow_upward" : "arrow_downward"}
              size={16}
              className={inverted ? "text-on-primary" : "text-primary"}
            />
            {trend.label}
          </div>
        )}
      </div>
    </div>
  );
}
