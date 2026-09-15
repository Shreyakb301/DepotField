import { cn } from "@/lib/utils";
import { TONE_BG_CLASS, type StatusTone } from "@/lib/format";

/** A solid block of color scaled to a value — the one chart primitive in the app. */
export function SolidBar({
  value,
  max,
  tone = "blue",
  className,
}: {
  value: number;
  max: number;
  tone?: StatusTone;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={cn("h-2.5 w-full min-w-16 bg-secondary", className)}>
      <div
        className={cn("h-full", TONE_BG_CLASS[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
