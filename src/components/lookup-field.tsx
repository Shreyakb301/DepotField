"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LookupOption {
  id: string;
  label: string;
  sublabel?: string;
}

/** A TDX-style lookup field: text input plus attached search/clear buttons, with a typeahead dropdown. */
export function LookupField({
  query,
  onQueryChange,
  placeholder,
  options,
  onSelect,
  onClear,
  className,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  placeholder: string;
  options: LookupOption[];
  onSelect: (option: LookupOption) => void;
  onClear: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const showOptions = open && options.length > 0;

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-stretch border border-rule bg-card focus-within:border-primary">
        <input
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="h-9 min-w-0 flex-1 bg-transparent px-2.5 text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Search"
          className="flex w-9 shrink-0 items-center justify-center border-l border-rule text-solid-blue hover:bg-secondary"
        >
          <Search className="size-4" />
        </button>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear"
          className="flex w-9 shrink-0 items-center justify-center border-l border-rule text-solid-red hover:bg-secondary"
        >
          <X className="size-4" />
        </button>
      </div>
      {showOptions && (
        <ul className="absolute z-10 mt-0.5 w-full border border-rule bg-card shadow-sm">
          {options.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                className="block w-full px-2.5 py-1.5 text-left text-sm text-ink hover:bg-secondary"
              >
                {opt.label}
                {opt.sublabel && <span className="ml-1.5 text-xs text-ink-faint">{opt.sublabel}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
