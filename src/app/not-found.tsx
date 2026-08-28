import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto flex w-full max-w-page items-center px-page-gutter py-24 sm:py-32">
      <div className="max-w-xl border-l-2 border-accent pl-7">
        <p className="utility-label">404 / Open circuit</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.055em] text-ink">
          This path is not connected.
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-ink">
          The page may have moved, or the calculator address may be incomplete.
        </p>
        <Link className={buttonVariants({ className: "mt-8" })} href="/calculators">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to calculators
        </Link>
      </div>
    </main>
  );
}
