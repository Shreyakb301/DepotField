import { cn } from "@/lib/utils";

/**
 * A bar rendered from '#' and '.' characters, monospace, no SVG.
 * This is the one graphical device in the whole app — everything
 * else is text and rules.
 */
export function AsciiBar({
  value,
  max,
  width = 24,
  tone = "default",
  className,
}: {
  value: number;
  max: number;
  width?: number;
  tone?: "default" | "good" | "bad";
  className?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const filled = Math.round(ratio * width);
  const bar = "#".repeat(filled) + ".".repeat(Math.max(0, width - filled));
  return (
    <span
      className={cn(
        "whitespace-pre",
        tone === "bad" ? "text-bad" : tone === "good" ? "text-good" : "text-ink",
        className,
      )}
    >
      {bar}
    </span>
  );
}
