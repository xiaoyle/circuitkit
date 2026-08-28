import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/90 bg-paper/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between px-page-gutter">
        <Link
          href="/"
          aria-label="CircuitKit home"
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
        >
          <BrandMark />
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-1">
          <Link className="nav-link hidden sm:inline-flex" href="/">
            Home
          </Link>
          <Link className="nav-link inline-flex" href="/calculators">
            Calculators
          </Link>
        </nav>
      </div>
    </header>
  );
}
