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
        "inline-flex items-center rounded-[3px] border px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-tight whitespace-nowrap",
        TONE_CLASSNAMES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

/**
 * The rubber-stamp treatment — reserved for quality-hold flags, the one
 * status that really does get stamped on paper in a real warehouse.
 * Don't reuse this for ordinary status pills; it only means something
 * because it's rare.
 */
export function InkStamp({
  label,
  tone = "danger",
  className,
}: {
  label: string;
  tone?: Extract<BadgeTone, "flag" | "danger" | "ok">;
  className?: string;
}) {
  const colorVar =
    tone === "flag" ? "var(--stamp-flag)" : tone === "ok" ? "var(--stamp-ok)" : "var(--stamp-danger)";
  return (
    <span
      className={cn(
        "inline-flex -rotate-3 items-center justify-center whitespace-nowrap border-[3px] px-2.5 py-1 font-heading text-xs font-extrabold tracking-[0.12em] uppercase",
        className,
      )}
      style={{
        color: colorVar,
        borderColor: colorVar,
        boxShadow: `inset 0 0 0 1px ${colorVar}`,
      }}
    >
      {label}
    </span>
  );
}
