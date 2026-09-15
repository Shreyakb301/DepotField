import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
}

/**
 * A manifest header block — the row of figures printed across the top
 * of a bill of lading, not a grid of icon-in-a-box KPI tiles.
 */
export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 divide-y divide-rule border border-rule sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-4 sm:px-5">
          <p className="text-[13px] text-ink-soft">{s.label}</p>
          <p
            className={cn(
              "mt-1 font-mono text-3xl leading-none font-semibold tabular-nums sm:text-4xl",
              s.warn ? "text-stamp-danger" : "text-ink",
            )}
          >
            {s.value}
          </p>
          {s.hint && (
            <p
              className={cn(
                "mt-1.5 text-xs",
                s.warn ? "font-medium text-stamp-flag" : "text-ink-faint",
              )}
            >
              {s.hint}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
