import { cn } from "@/lib/utils";
import { TONE_BG_CLASS, type StatusTone } from "@/lib/format";

/** A solid block of color, the way a departure board flags a status — not a soft tinted pill. */
export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white",
        TONE_BG_CLASS[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
