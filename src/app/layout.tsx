import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { DepotProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/app-shell";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "DepotField — Warehouse Operations",
  description:
    "An ERP-style warehouse operations demo: inventory, orders, receiving, and reorder planning for a fictional online retailer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <DepotProvider>
          <AppShell>{children}</AppShell>
        </DepotProvider>
      </body>
    </html>
  );
}
