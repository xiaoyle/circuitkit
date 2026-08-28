import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-page gap-8 px-page-gutter py-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Link
            href="/"
            aria-label="CircuitKit home"
            className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
          >
            <BrandMark />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-ink">
            Practical electronics calculators with visible formulas, unit-aware inputs,
            and engineering context.
          </p>
        </div>
        <p className="font-mono text-xs text-muted-ink">
          Built carefully for real circuits.
        </p>
      </div>
    </footer>
  );
}
