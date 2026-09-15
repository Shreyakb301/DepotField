"use client";

import { useState } from "react";
import { Menu, PackageSearch, RotateCcw } from "lucide-react";
import { NavLinks } from "./nav-links";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useDepot } from "@/lib/store";

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3 py-4">
      <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500 text-white">
        <PackageSearch className="size-4.5" strokeWidth={2.25} />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-white">DepotField</p>
        <p className="text-[11px] text-slate-400">Warehouse Operations</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { resetDemoData } = useDepot();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-sidebar-border md:bg-sidebar">
        <Brand />
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <NavLinks />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => {
              if (confirm("Reset all demo data to its original seeded state?")) {
                resetDemoData();
              }
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            Reset demo data
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-sidebar px-4 py-3 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 hover:text-white"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <div className="px-3 py-2">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold text-white">DepotField</span>
        </header>

        <main className="flex-1 overflow-x-hidden bg-background px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
