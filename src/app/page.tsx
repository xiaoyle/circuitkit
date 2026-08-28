import { ArrowDown, ArrowRight, Braces, Ruler, Sigma } from "lucide-react";
import Link from "next/link";

import { ToolsDirectory } from "@/components/tools-directory";
import { buttonVariants } from "@/components/ui/button";
import { tools } from "@/lib/tools";

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="relative isolate overflow-hidden border-b border-line">
        <div aria-hidden="true" className="circuit-grid absolute inset-0 -z-10 opacity-60" />

        <div className="mx-auto grid max-w-page gap-12 px-page-gutter py-16 sm:py-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 border-l-2 border-accent pl-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-strong">
              <span className="size-1.5 rounded-full bg-accent" />
              Electronics engineering toolkit
            </div>

            <h1 className="mt-7 max-w-3xl text-[clamp(2.55rem,4.5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-ink">
              Practical electronics calculations,
              <span className="text-accent"> explained.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-ink sm:text-xl">
              为电子工程学习与设计提供可靠、可解释的在线计算工具。
            </p>
            <p className="mt-4 font-mono text-xs leading-6 text-muted-ink">
              Unit-aware inputs · Visible formulas · Engineering notes
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className={buttonVariants({ size: "lg" })}
                href="/calculators/voltage-divider"
              >
                Open Voltage Divider
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                className={buttonVariants({ size: "lg", variant: "outline" })}
                href="#calculators"
              >
                Browse all tools
                <ArrowDown aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>

          <section
            aria-labelledby="worked-example-title"
            className="border-y border-line bg-surface/75"
          >
            <header className="flex items-start justify-between gap-5 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <p className="utility-label">Worked example</p>
                <h2
                  id="worked-example-title"
                  className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink"
                >
                  Voltage Divider
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 font-mono text-[0.6875rem] font-semibold text-accent-strong">
                <span className="size-1.5 rounded-full bg-accent" />
                Available
              </span>
            </header>

            <div className="grid sm:grid-cols-[0.84fr_1.16fr]">
              <dl className="divide-y divide-line border-b border-line sm:border-b-0 sm:border-r">
                {[
                  ["Vin", "5 V"],
                  ["R1", "10 kΩ"],
                  ["R2", "20 kΩ"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-5 py-4 sm:px-6">
                    <dt className="font-mono text-xs text-muted-ink">{label}</dt>
                    <dd className="font-mono text-sm font-semibold tabular-nums text-ink">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col justify-between px-5 py-5 sm:px-6">
                <div>
                  <p className="utility-label">Formula</p>
                  <p className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-sm text-ink">
                    Vout = Vin × R2 / (R1 + R2)
                  </p>
                  <p className="mt-3 font-mono text-xs leading-5 text-muted-ink">
                    5 × 20k / (10k + 20k)
                  </p>
                </div>

                <div className="mt-6 border-l-2 border-accent pl-4">
                  <p className="utility-label">Output voltage</p>
                  <p className="mt-2 font-mono text-3xl font-semibold tracking-[-0.04em] tabular-nums text-ink">
                    3.33 V
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mx-auto max-w-page px-page-gutter pb-8">
          <div className="flex items-center justify-between gap-4 border-t border-line py-4">
            <p className="utility-label text-ink">MVP tool status</p>
            <p className="font-mono text-[0.6875rem] text-muted-ink">05 available / MVP complete</p>
          </div>

          <ul className="divide-y divide-line border-y border-line bg-paper/70 lg:grid lg:grid-cols-5 lg:divide-x lg:divide-y-0">
            {tools.map((tool) => {
              return (
                <li key={tool.slug} className="min-w-0">
                  <Link
                    href={`/calculators/${tool.slug}`}
                    className="block min-h-28 cursor-pointer px-4 py-5 outline-none transition-colors duration-200 hover:bg-surface focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                  >
                    <span className="font-mono text-[0.625rem] tracking-[0.12em] text-muted-ink">
                      {tool.index}
                    </span>
                    <span className="mt-3 block text-sm font-semibold text-ink">
                      {tool.shortName}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-2 font-mono text-[0.6875rem] text-accent-strong">
                      <span className="size-1.5 rounded-full bg-accent" />
                      Available
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="calculators" className="scroll-mt-20">
        <div className="mx-auto max-w-page px-page-gutter py-18 sm:py-22">
          <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:items-end">
            <div>
              <p className="utility-label">Calculator library</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-ink sm:text-5xl">
                Five essentials,
                <br />
                clearly explained.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-muted-ink md:justify-self-end">
              Start with the relationships that appear again and again in circuits.
              Each tool is designed around familiar engineering units and a transparent
              calculation trail.
            </p>
          </div>

          <div className="mt-12 sm:mt-16">
            <ToolsDirectory />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-page gap-10 px-page-gutter py-18 md:grid-cols-3 md:py-22">
          <div>
            <Ruler aria-hidden="true" className="size-5 text-accent" />
            <h2 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-ink">
              Engineering units built in
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-ink">
              Work in kΩ, µF, mH, or mA. CircuitKit handles conversion at the boundary.
            </p>
          </div>
          <div>
            <Sigma aria-hidden="true" className="size-5 text-accent" />
            <h2 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-ink">
              Reasoning stays visible
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-ink">
              See the governing formula and substituted values instead of a black-box answer.
            </p>
          </div>
          <div>
            <Braces aria-hidden="true" className="size-5 text-accent" />
            <h2 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-ink">
              Logic separated from UI
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-ink">
              Pure calculation modules stay testable and ready for a future API or mobile app.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
