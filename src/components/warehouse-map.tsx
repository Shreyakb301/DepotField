"use client";

import { Forklift } from "lucide-react";
import { cn } from "@/lib/utils";
import { BIN_ROWS } from "@/lib/bins";
import { binFillLevel } from "@/lib/selectors";
import type { DepotData } from "@/lib/types";

/** A positioned rectangle on the floor plan, placed by percentage of the building's footprint. */
function Zone({
  left,
  top,
  width,
  height,
  className,
  children,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("absolute", className)}
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
    >
      {children}
    </div>
  );
}

const PACKING_DESKS = [
  { left: 26, top: 4 },
  { left: 44.5, top: 4 },
  { left: 26, top: 15.5 },
  { left: 44.5, top: 15.5 },
];

const PALETTE_STACK = [
  { label: "Box", tone: "bg-teal-300 border-teal-700/40" },
  { label: "Plt", tone: "bg-blue-300 border-blue-700/40" },
  { label: "Plt", tone: "bg-blue-300 border-blue-700/40" },
  { label: "Plt", tone: "bg-blue-300 border-blue-700/40" },
  { label: "Plt", tone: "bg-blue-300 border-blue-700/40" },
];

const DOCK_TICKS = [28, 35, 42, 49, 56, 63, 70];

const LEFT_COLS = ["01", "02"] as const;
const RIGHT_COLS = ["03", "04"] as const;

function BinCell({
  data,
  binId,
  active,
  onClick,
}: {
  data: DepotData;
  binId: string;
  active: boolean;
  onClick: () => void;
}) {
  const fill = binFillLevel(data, binId);
  const bad = fill.pct >= 90;
  return (
    <button
      onClick={onClick}
      title={`${binId} — ${fill.pct}% full`}
      className={cn(
        "flex flex-col items-center justify-center border text-center leading-tight transition-colors",
        bad ? "bg-solid-red/20 border-solid-red/50 hover:bg-solid-red/30" : "bg-orange-200 border-orange-700/40 hover:bg-orange-300",
        active && "ring-2 ring-primary ring-inset",
      )}
    >
      <span className="text-[10px] font-bold text-ink sm:text-xs">{binId}</span>
      <span className="text-[8px] text-ink-soft sm:text-[10px]">{fill.pct}%</span>
    </button>
  );
}

function StorageBlock({
  left,
  width,
  data,
  cols,
  selectedBin,
  onSelectBin,
}: {
  left: number;
  width: number;
  data: DepotData;
  cols: readonly string[];
  selectedBin: string | null;
  onSelectBin: (id: string) => void;
}) {
  return (
    <Zone left={left} top={30} width={width} height={48} className="grid grid-cols-2 gap-[3px]">
      {BIN_ROWS.flatMap((row) =>
        cols.map((col) => {
          const binId = `${row}-${col}`;
          return (
            <BinCell
              key={binId}
              data={data}
              binId={binId}
              active={selectedBin === binId}
              onClick={() => onSelectBin(binId)}
            />
          );
        }),
      )}
    </Zone>
  );
}

export function WarehouseMap({
  data,
  selectedBin,
  onSelectBin,
}: {
  data: DepotData;
  selectedBin: string | null;
  onSelectBin: (id: string) => void;
}) {
  return (
    <div className="relative aspect-[8/5] w-full border-[3px] border-ink bg-white">
      {/* dock doors, top wall */}
      <Zone left={8} top={1.2} width={14} height={1.6} className="flex flex-col justify-between">
        <div className="h-px bg-ink-faint" />
        <div className="h-px bg-ink-faint" />
      </Zone>
      <Zone left={77} top={1.2} width={14} height={1.6} className="flex flex-col justify-between">
        <div className="h-px bg-ink-faint" />
        <div className="h-px bg-ink-faint" />
      </Zone>

      {/* floor labels */}
      <Zone left={11} top={7.5} width={16} height={4}>
        <span className="text-xs font-semibold tracking-wide text-ink-faint uppercase sm:text-sm">
          Shipping
        </span>
      </Zone>
      <Zone left={81} top={7.5} width={16} height={4}>
        <span className="text-xs font-semibold tracking-wide text-ink-faint uppercase sm:text-sm">
          Receiving
        </span>
      </Zone>

      {/* packing desks */}
      {PACKING_DESKS.map((d, i) => (
        <Zone
          key={i}
          left={d.left}
          top={d.top}
          width={16.5}
          height={5.5}
          className="flex items-center justify-center border border-lime-700/40 bg-lime-300 text-[9px] font-semibold text-ink sm:text-xs"
        >
          Packing Desk
        </Zone>
      ))}

      {/* boxes + pallets column */}
      {PALETTE_STACK.map((cell, i) => (
        <Zone
          key={i}
          left={64.5}
          top={4 + i * 6.6}
          width={4}
          height={6}
          className={cn("flex items-center justify-center border text-center text-[8px] font-semibold text-ink", cell.tone)}
        >
          {cell.label}
        </Zone>
      ))}

      {/* partition wall between storage floor and receiving corridor */}
      <div className="absolute top-[3%] h-[34%] w-[2px] bg-ink" style={{ left: "70%" }} />

      {/* forklifts, receiving corridor */}
      <Zone left={72} top={9} width={6} height={6} className="flex items-center justify-center text-ink-faint">
        <Forklift className="size-full" />
      </Zone>
      <Zone left={72} top={21} width={6} height={6} className="flex items-center justify-center text-ink-faint">
        <Forklift className="size-full" />
      </Zone>

      {/* dock levelers, right wall */}
      {DOCK_TICKS.map((top, i) => (
        <div
          key={i}
          className="absolute h-[1.4%] w-[2%] border border-ink-faint bg-secondary"
          style={{ left: "98.2%", top: `${top}%` }}
        />
      ))}

      {/* storage racks — the 16 real bins, two aisles */}
      <StorageBlock left={26} width={14} data={data} cols={LEFT_COLS} selectedBin={selectedBin} onSelectBin={onSelectBin} />
      <StorageBlock left={47} width={14} data={data} cols={RIGHT_COLS} selectedBin={selectedBin} onSelectBin={onSelectBin} />

      {/* backstock */}
      <Zone
        left={8.5}
        top={68}
        width={2.6}
        height={23}
        className="flex items-center justify-center border border-red-700/40 bg-red-300"
      >
        <span className="text-[8px] font-semibold whitespace-nowrap text-ink [writing-mode:vertical-rl] sm:text-[10px]">
          Backstock
        </span>
      </Zone>
      <Zone
        left={15}
        top={68}
        width={2.6}
        height={23}
        className="flex items-center justify-center border border-red-700/40 bg-red-300"
      >
        <span className="text-[8px] font-semibold whitespace-nowrap text-ink [writing-mode:vertical-rl] sm:text-[10px]">
          Backstock
        </span>
      </Zone>

      {/* breakroom */}
      <Zone
        left={35}
        top={84}
        width={34}
        height={9}
        className="flex items-center justify-center border border-yellow-700/40 bg-yellow-300 text-[10px] font-semibold text-ink sm:text-sm"
      >
        Breakroom
      </Zone>

      {/* facilities */}
      {[70.5, 76.8, 83.1].map((left, i) => (
        <Zone key={i} left={left} top={84} width={5.3} height={9} className="border border-gray-500/40 bg-gray-300" />
      ))}
    </div>
  );
}
