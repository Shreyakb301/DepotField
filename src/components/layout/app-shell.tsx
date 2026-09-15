"use client";

import { NavLinks } from "./nav-links";
import { useDepot } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { resetDemoData } = useDepot();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="border-b-2 border-ink">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-sm font-bold whitespace-nowrap text-ink">
              DEPOTFIELD
              <span aria-hidden className="cursor-blink ml-0.5">
                {"█"}
              </span>
            </span>
            <NavLinks />
          </div>
          <button
            onClick={() => {
              if (confirm("Reset all demo data to its original seeded state?")) {
                resetDemoData();
              }
            }}
            className="text-left text-xs text-ink-faint hover:text-ink sm:text-right"
          >
            reset demo data
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
