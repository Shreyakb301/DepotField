import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DepotProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DepotField — Warehouse Operations",
  description:
    "An ERP-style warehouse operations demo: inventory, orders, receiving, and reorder planning for a fictional online retailer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <DepotProvider>
          <AppShell>{children}</AppShell>
        </DepotProvider>
      </body>
    </html>
  );
}
