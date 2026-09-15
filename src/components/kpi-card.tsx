import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  tone?: "default" | "warning";
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {subtext && (
          <p
            className={cn(
              "text-xs",
              tone === "warning" ? "text-amber-600 font-medium" : "text-muted-foreground",
            )}
          >
            {subtext}
          </p>
        )}
      </div>
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          tone === "warning" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
        )}
      >
        <Icon className="size-4.5" strokeWidth={2} />
      </div>
    </div>
  );
}
