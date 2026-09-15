"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE_TEXT_CLASS, type StatusTone } from "@/lib/format";

/** A small stat box — white, bordered, with a colored number. Not a solid color block. */
export function KpiBox({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: StatusTone;
}) {
  return (
    <div className="rounded-lg border border-rule bg-card p-3 shadow-sm">
      <p className="text-xs font-semibold text-ink-soft">{label}</p>
      <p className={cn("text-2xl leading-tight font-bold", TONE_TEXT_CLASS[tone])}>{value}</p>
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

/** A widget box — white body, bordered header with a title and a refresh icon, like a TDX desktop widget. */
export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [spinning, setSpinning] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-rule bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-rule bg-secondary/40 px-3 py-2.5">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          <button
            aria-label="Refresh"
            onClick={() => {
              setSpinning(true);
              window.setTimeout(() => setSpinning(false), 500);
            }}
            className="text-ink-faint hover:text-ink"
          >
            <RefreshCw className={cn("size-3.5", spinning && "animate-spin")} />
          </button>
        </div>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
