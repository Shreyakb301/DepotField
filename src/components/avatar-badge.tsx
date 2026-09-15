import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-solid-blue",
  "bg-solid-amber",
  "bg-solid-green",
  "bg-solid-red",
  "bg-solid-purple",
  "bg-solid-teal",
  "bg-solid-slate",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function initials(name: string): string {
  const digits = name.match(/\d+/)?.[0];
  if (digits) return digits.slice(0, 2);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** A colored initials square, the way TDX shows a requestor's avatar. */
export function AvatarBadge({ name, className }: { name: string; className?: string }) {
  const tone = PALETTE[hashString(name) % PALETTE.length];
  return (
    <div
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-md text-base font-bold text-white",
        tone,
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
