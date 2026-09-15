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
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
