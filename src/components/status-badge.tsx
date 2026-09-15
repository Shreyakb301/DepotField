import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/format";

/** [BRACKETED] status text, the way a CLI or log line flags state — no pill, no fill. */
export function StatusBadge({
  label,
  tone = "default",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-bold whitespace-nowrap",
        tone === "bad" ? "text-bad" : tone === "good" ? "text-good" : "text-ink",
        className,
      )}
    >
      [{label.toUpperCase()}]
    </span>
  );
}
