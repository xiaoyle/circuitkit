import { ArrowLeft, Gauge } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { ToolDefinition } from "@/lib/tools";

type CalculatorShellProps = {
  tool: ToolDefinition;
  children: ReactNode;
};

export function CalculatorShell({ tool, children }: CalculatorShellProps) {
  return (
    <main id="main-content" className="mx-auto w-full max-w-page px-page-gutter py-10 sm:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 font-mono text-xs text-muted-ink">
          <li>
            <Link
              href="/calculators"
              className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-sm outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Calculators
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {tool.shortName}
          </li>
        </ol>
      </nav>

      <header className="mt-8 grid gap-8 border-b border-line pb-10 lg:grid-cols-[1fr_22rem] lg:items-end">
        <div>
          <p className="utility-label">{tool.category}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-ink sm:text-5xl">
            {tool.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-ink sm:text-lg">
            {tool.description}
          </p>
        </div>
        <div className="border-l-2 border-accent pl-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Gauge aria-hidden="true" className="size-4 text-accent" />
            Available now
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-ink">
            Validated unit-aware inputs, live results, and visible calculation steps.
          </p>
        </div>
      </header>

      {children}
    </main>
  );
}
