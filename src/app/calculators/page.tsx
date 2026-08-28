import type { Metadata } from "next";

import { ToolsDirectory } from "@/components/tools-directory";

export const metadata: Metadata = {
  title: "Calculators",
  description: "Browse CircuitKit's practical electronics engineering calculators.",
};

export default function CalculatorsPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-page px-page-gutter py-14 sm:py-20">
      <header className="grid gap-8 border-b border-line pb-12 md:grid-cols-[0.9fr_1.1fr] md:items-end">
        <div>
          <p className="utility-label">Tool directory</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-ink sm:text-6xl">
            Calculators
          </h1>
        </div>
        <p className="max-w-xl text-base leading-7 text-muted-ink md:justify-self-end">
          A focused set of electronics tools for common circuit relationships. Every
          calculator includes unit-aware inputs, a visible formula, worked steps,
          and an engineering note.
        </p>
      </header>

      <section aria-labelledby="all-tools-heading" className="py-12 sm:py-16">
        <h2 id="all-tools-heading" className="sr-only">
          All calculators
        </h2>
        <ToolsDirectory />
      </section>
    </main>
  );
}
