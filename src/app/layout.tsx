import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/manrope";
import type { Metadata, Viewport } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CircuitKit — Electronics calculators that explain the math",
    template: "%s — CircuitKit",
  },
  description:
    "Practical, unit-aware electronics engineering calculators with formulas, calculation steps, and engineering notes.",
  applicationName: "CircuitKit",
  keywords: [
    "electronics calculator",
    "voltage divider",
    "LED resistor",
    "RC filter",
    "op-amp gain",
    "RLC resonance",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "CircuitKit — Electronics calculators that explain the math",
    description:
      "Practical, unit-aware electronics engineering calculators with formulas, calculation steps, and engineering notes.",
    siteName: "CircuitKit",
  },
  twitter: {
    card: "summary",
    title: "CircuitKit — Electronics calculators that explain the math",
    description:
      "Practical, unit-aware electronics engineering calculators with formulas, calculation steps, and engineering notes.",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#F5F7F4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased">
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-50 -translate-y-20 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white outline-none transition-transform focus:translate-y-0 focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          Skip to content
        </a>
        <div className="flex min-h-svh flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
