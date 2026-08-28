import { CircuitBoard } from "lucide-react";

export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-md border border-ink bg-ink text-paper">
        <CircuitBoard aria-hidden="true" className="size-4.5" strokeWidth={1.8} />
      </span>
      <span className="text-[0.95rem] font-bold tracking-[-0.025em] text-ink">
        CircuitKit
      </span>
    </span>
  );
}
