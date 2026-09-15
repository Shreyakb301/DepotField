"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Warehouse,
  Truck,
  PackagePlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/warehouse", label: "Warehouse", icon: Warehouse },
  { href: "/receiving", label: "Receiving", icon: Truck },
  { href: "/reorder-planning", label: "Reorder Planning", icon: PackagePlus },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 border-l-[3px] px-3.5 py-2 text-[13px] font-medium transition-colors",
              active
                ? "border-l-primary bg-sidebar-accent text-sidebar-accent-foreground"
                : "border-l-transparent text-sidebar-foreground/70 hover:border-l-sidebar-border hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
