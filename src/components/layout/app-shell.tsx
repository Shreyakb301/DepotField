"use client";

import { useState } from "react";
import { Menu, RotateCcw } from "lucide-react";
import { NavLinks } from "./nav-links";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useDepot } from "@/lib/store";

function Brand() {
  return (
    <div className="flex items-center gap-2 px-4 py-4">
      <span className="flex h-6 items-center border border-sidebar-border px-1.5 font-mono text-[11px] font-semibold tracking-wide text-sidebar-foreground/80">
        DF
      </span>
      <p
        className="text-lg leading-none font-bold tracking-tight"
        style={{ fontFamily: "var(--font-big-shoulders-stencil)" }}
      >
        <span className="text-sidebar-foreground">DEPOT</span>
        <span className="text-primary">FIELD</span>
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { resetDemoData } = useDepot();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-sidebar-border md:bg-sidebar">
        <Brand />
        <div className="flex-1 overflow-y-auto py-2">
          <NavLinks />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => {
              if (confirm("Reset all demo data to its original seeded state?")) {
                resetDemoData();
              }
            }}
            className="flex w-full items-center gap-2 px-1 py-1.5 text-[11px] font-medium text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset demo data
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-sidebar-border bg-sidebar px-2 py-2 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <div className="py-2">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <p
            className="text-base leading-none font-bold tracking-tight"
            style={{ fontFamily: "var(--font-big-shoulders-stencil)" }}
          >
            <span className="text-sidebar-foreground">DEPOT</span>
            <span className="text-primary">FIELD</span>
          </p>
        </header>

        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
