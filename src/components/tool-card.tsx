import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ToolIcon } from "@/components/tool-icon";
import type { ToolDefinition } from "@/lib/tools";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <li className="group border-t border-line">
      <Link
        href={`/calculators/${tool.slug}`}
        className="relative grid min-h-52 cursor-pointer grid-cols-[auto_1fr_auto] gap-x-5 gap-y-5 py-7 pr-1 outline-none transition-colors duration-200 hover:bg-surface focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:px-5 sm:-mx-5"
      >
        <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted-ink">
          {tool.index}
        </span>
        <div>
          <div className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.13em] text-accent-strong">
            <ToolIcon icon={tool.icon} />
            {tool.category}
          </div>
          <h3 className="mt-6 text-xl font-semibold tracking-[-0.035em] text-ink sm:text-2xl">
            {tool.shortName}
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted-ink">
            {tool.description}
          </p>
          <p className="mt-5 font-mono text-xs text-muted-ink">{tool.formula}</p>
        </div>
        <ArrowUpRight
          aria-hidden="true"
          className="size-5 text-muted-ink transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
        />
      </Link>
    </li>
  );
}
