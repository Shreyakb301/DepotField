"use client";

import { RotateCcw } from "lucide-react";
import { NavLinks } from "./nav-links";
import { useDepot } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { resetDemoData } = useDepot();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="bg-ink">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-lg font-bold tracking-tight text-white">DepotField</span>
          <button
            onClick={() => {
              if (confirm("Reset all demo data to its original seeded state?")) {
                resetDemoData();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            Reset demo data
          </button>
        </div>
      </div>

      <header className="border-b border-rule bg-card">
        <div className="mx-auto w-full max-w-[1400px] overflow-x-auto px-4 sm:px-6">
          <NavLinks />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
