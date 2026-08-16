import { cn } from "@/lib/cn";

type Tone = "neutral" | "positive" | "warning" | "error" | "muted";

const toneStyles: Record<Tone, { dot: string; text: string }> = {
  neutral: { dot: "bg-primary", text: "text-primary" },
  positive: { dot: "bg-secondary", text: "text-on-surface-variant" },
  warning: { dot: "bg-secondary", text: "text-on-surface-variant" },
  error: { dot: "bg-error", text: "text-on-surface-variant" },
  muted: { dot: "bg-outline-variant", text: "text-on-surface-variant" },
};

type StatusPillProps = {
  label: string;
  tone?: Tone;
  className?: string;
};

export function StatusPill({ label, tone = "neutral", className }: StatusPillProps) {
  const styles = toneStyles[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm bg-surface-container-high px-2 py-1 font-label-caps text-[10px]",
        styles.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {label}
    </span>
  );
}
