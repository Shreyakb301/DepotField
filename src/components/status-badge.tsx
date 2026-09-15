import { cn } from "@/lib/utils";
import { TONE_CLASSNAMES, type BadgeTone } from "@/lib/format";

export function StatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSNAMES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
