import type { Ref } from "react";

type UnitInputProps<Unit extends string> = {
  id: string;
  label: string;
  symbol: string;
  value: string;
  unit: Unit;
  units: readonly Unit[];
  error?: string;
  inputRef?: Ref<HTMLInputElement>;
  onValueChange: (value: string) => void;
  onUnitChange: (unit: Unit) => void;
};

export function UnitInput<Unit extends string>({
  id,
  label,
  symbol,
  value,
  unit,
  units,
  error,
  inputRef,
  onValueChange,
  onUnitChange,
}: UnitInputProps<Unit>) {
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        <span className="font-mono text-xs text-muted-ink">{symbol}</span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_6.5rem]">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onValueChange(event.target.value)}
          className="h-12 min-w-0 scroll-mt-24 rounded-l-md border border-r-0 border-line bg-surface px-4 font-mono text-base tabular-nums text-ink outline-none transition-colors placeholder:text-muted-ink/60 hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent/25 aria-invalid:border-caution aria-invalid:focus:border-caution aria-invalid:focus:ring-caution/20"
        />
        <label className="sr-only" htmlFor={`${id}-unit`}>
          {label} unit
        </label>
        <select
          id={`${id}-unit`}
          name={`${id}-unit`}
          value={unit}
          onChange={(event) => onUnitChange(event.target.value as Unit)}
          className="h-12 cursor-pointer rounded-r-md border border-line bg-paper px-3 font-mono text-sm text-ink outline-none transition-colors hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent/25"
        >
          {units.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <p id={errorId} role={error ? "alert" : undefined} className="min-h-6 pt-1.5 text-xs leading-5 text-caution">
        {error ?? ""}
      </p>
    </div>
  );
}

