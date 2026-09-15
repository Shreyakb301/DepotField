import { cn } from "@/lib/utils";

/** A segmented level gauge — closer to a warehouse fuel/stock gauge than a smooth progress bar. */
export function Gauge({
  pct,
  segments = 16,
  className,
}: {
  pct: number;
  segments?: number;
  className?: string;
}) {
  const filled = Math.round((Math.min(100, pct) / 100) * segments);
  const tone = pct >= 90 ? "bg-stamp-danger" : pct >= 70 ? "bg-stamp-flag" : "bg-ink";
  return (
    <div className={cn("flex gap-[2px]", className)}>
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={cn("h-2 flex-1", i < filled ? tone : "bg-rule")}
        />
      ))}
    </div>
  );
}
