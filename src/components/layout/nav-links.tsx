"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview" },
  { href: "/inventory", label: "Inventory" },
  { href: "/orders", label: "Orders" },
  { href: "/warehouse", label: "Warehouse" },
  { href: "/receiving", label: "Receiving" },
  { href: "/reorder-planning", label: "Reorder" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {NAV_ITEMS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-2 py-1 text-sm transition-colors",
              active
                ? "bg-ink font-semibold text-background"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
