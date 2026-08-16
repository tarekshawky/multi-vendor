import { cn } from "@/lib/cn";

type ProgressBarProps = {
  label: string;
  percent: number;
  className?: string;
};

export function ProgressBar({ label, percent, className }: ProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between font-body-md text-sm text-on-surface-variant">
        <span>{label}</span>
        <span className="text-primary">{percent}%</span>
      </div>
      <div className="h-1 w-full bg-surface-container-high">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
