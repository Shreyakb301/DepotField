export const BIN_ROWS = ["A", "B", "C", "D"] as const;
export const BIN_COLS = ["01", "02", "03", "04"] as const;
export const BIN_CAPACITY = 240;

export interface Bin {
  id: string;
  row: (typeof BIN_ROWS)[number];
  col: (typeof BIN_COLS)[number];
  capacity: number;
}

export const BINS: Bin[] = BIN_ROWS.flatMap((row) =>
  BIN_COLS.map((col) => ({
    id: `${row}-${col}`,
    row,
    col,
    capacity: BIN_CAPACITY,
  })),
);
