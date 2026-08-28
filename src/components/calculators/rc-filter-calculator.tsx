"use client";

import { CheckCircle2, RotateCcw, Sigma } from "lucide-react";
import { type FormEvent, useMemo, useRef, useState } from "react";

import { UnitInput } from "@/components/calculators/unit-input";
import { Button } from "@/components/ui/button";
import {
  calculateRcFilter,
  rcFilterTypes,
  type RcFilterField,
  type RcFilterType,
} from "@/lib/calculators/rc-filter";
import {
  capacitanceUnits,
  formatEngineering,
  formatSignificant,
  resistanceUnits,
  type CapacitanceUnit,
  type ResistanceUnit,
} from "@/lib/units";

type FormValues = {
  resistance: { value: string; unit: ResistanceUnit };
  capacitance: { value: string; unit: CapacitanceUnit };
  filterType: RcFilterType;
};

const initialValues: FormValues = {
  resistance: { value: "10", unit: "kΩ" },
  capacitance: { value: "100", unit: "nF" },
  filterType: "low-pass",
};

const filterTypeLabels: Record<RcFilterType, string> = {
  "low-pass": "Low-pass",
  "high-pass": "High-pass",
};

const filterExplanations: Record<RcFilterType, string> = {
  "low-pass":
    "Low-frequency signals pass through while higher frequencies are progressively attenuated.",
  "high-pass":
    "High-frequency signals pass through while lower frequencies are progressively attenuated.",
};

function displayInput(value: string, unit: string) {
  return `${formatSignificant(Number(value), 6)} ${unit}`;
}

export function RcFilterCalculator() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const resistanceRef = useRef<HTMLInputElement>(null);
  const capacitanceRef = useRef<HTMLInputElement>(null);
  const filterTypeRef = useRef<HTMLSelectElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const calculation = useMemo(() => calculateRcFilter(values), [values]);

  const errors = useMemo(() => {
    if (calculation.ok) return {};

    return Object.fromEntries(
      calculation.errors.map((error) => [error.field, error.message]),
    ) as Partial<Record<RcFilterField, string>>;
  }, [calculation]);

  const cutoffFrequency = calculation.ok
    ? formatEngineering("frequency", calculation.cutoffFrequency)
    : null;
  const timeConstant = calculation.ok
    ? formatEngineering("time", calculation.timeConstant)
    : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!calculation.ok) {
      const firstError = calculation.errors[0]?.field;
      const refs = {
        resistance: resistanceRef,
        capacitance: capacitanceRef,
        filterType: filterTypeRef,
      };
      refs[firstError]?.current?.focus();
      return;
    }

    resultHeadingRef.current?.focus();
  }

  function resetValues() {
    setValues(initialValues);
    requestAnimationFrame(() => resistanceRef.current?.focus());
  }

  return (
    <section
      aria-label="RC Filter calculator workspace"
      className="grid gap-8 py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        className="self-start rounded-lg border border-line bg-surface p-6 sm:p-8"
      >
        <div className="border-b border-line pb-6">
          <p className="utility-label">Input</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-ink">
            RC network values
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-ink">
            Set the resistor, capacitor, and filter response. Both filter types share
            the same cutoff-frequency calculation.
          </p>
        </div>

        <div className="mt-7 space-y-3">
          <UnitInput
            id="rc-resistance"
            label="Resistance"
            symbol="R"
            value={values.resistance.value}
            unit={values.resistance.unit}
            units={resistanceUnits}
            error={errors.resistance}
            inputRef={resistanceRef}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                resistance: { ...current.resistance, value },
              }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({
                ...current,
                resistance: { ...current.resistance, unit },
              }))
            }
          />
          <UnitInput
            id="rc-capacitance"
            label="Capacitance"
            symbol="C"
            value={values.capacitance.value}
            unit={values.capacitance.unit}
            units={capacitanceUnits}
            error={errors.capacitance}
            inputRef={capacitanceRef}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                capacitance: { ...current.capacitance, value },
              }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({
                ...current,
                capacitance: { ...current.capacitance, unit },
              }))
            }
          />
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="filter-type" className="text-sm font-semibold text-ink">
                Filter type
              </label>
              <span className="font-mono text-xs text-muted-ink">Response</span>
            </div>
            <select
              ref={filterTypeRef}
              id="filter-type"
              value={values.filterType}
              aria-invalid={Boolean(errors.filterType)}
              aria-describedby={errors.filterType ? "filter-type-error" : undefined}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  filterType: event.target.value as RcFilterType,
                }))
              }
              className="h-12 w-full cursor-pointer scroll-mt-24 rounded-md border border-line bg-paper px-4 text-sm font-semibold text-ink outline-none transition-colors hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent/25 aria-invalid:border-caution aria-invalid:focus:border-caution aria-invalid:focus:ring-caution/20"
            >
              {rcFilterTypes.map((filterType) => (
                <option key={filterType} value={filterType}>
                  {filterTypeLabels[filterType]}
                </option>
              ))}
            </select>
            <p
              id="filter-type-error"
              role={errors.filterType ? "alert" : undefined}
              className="min-h-6 pt-1.5 text-xs leading-5 text-caution"
            >
              {errors.filterType ?? ""}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <Button type="submit">Calculate</Button>
          <Button type="button" variant="outline" onClick={resetValues}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset values
          </Button>
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-ink">
          Results update as values or filter type change. Calculate moves focus to the
          result.
        </p>
      </form>

      <div className="space-y-9">
        <section aria-labelledby="result-heading" aria-live="polite">
          <p className="utility-label">Result</p>
          <h2
            ref={resultHeadingRef}
            id="result-heading"
            tabIndex={-1}
            className="mt-2 scroll-mt-24 text-2xl font-semibold tracking-[-0.035em] text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Calculated values
          </h2>

          {calculation.ok && cutoffFrequency && timeConstant ? (
            <>
              <dl className="mt-5 grid border-y border-line bg-accent-soft/45 sm:grid-cols-2">
                <div className="px-5 py-6 sm:border-r sm:border-line">
                  <dt className="text-sm font-semibold text-muted-ink">
                    Cutoff Frequency
                  </dt>
                  <dd className="mt-2 font-mono text-3xl font-semibold tracking-[-0.04em] text-ink tabular-nums">
                    {cutoffFrequency.text}
                  </dd>
                </div>
                <div className="border-t border-line px-5 py-6 sm:border-t-0">
                  <dt className="text-sm font-semibold text-muted-ink">
                    Time Constant
                  </dt>
                  <dd className="mt-2 font-mono text-3xl font-semibold tracking-[-0.04em] text-ink tabular-nums">
                    {timeConstant.text}
                  </dd>
                </div>
              </dl>
              <dl className="flex items-baseline justify-between gap-4 border-b border-line px-1 py-4">
                <dt className="text-sm text-muted-ink">Filter Response</dt>
                <dd className="font-mono text-sm font-semibold text-ink">
                  {filterTypeLabels[calculation.filterType]}
                </dd>
              </dl>
            </>
          ) : (
            <div className="mt-5 min-h-28 border-y border-line bg-surface px-5 py-6">
              <p className="text-sm font-semibold text-caution">
                Check the highlighted inputs.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-ink">
                Resistance and capacitance must both be finite values greater than zero.
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="formula-heading">
          <div className="flex items-center gap-2">
            <Sigma aria-hidden="true" className="size-4 text-accent" />
            <h2 id="formula-heading" className="utility-label text-ink">
              Formula
            </h2>
          </div>
          <div className="mt-4 space-y-3 border-l-2 border-accent pl-5 font-mono text-sm text-ink sm:text-base">
            <p>fc = 1 / (2πRC)</p>
            <p>τ = RC</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-ink">
            A first-order RC low-pass and high-pass filter use the same R and C product
            to set their cutoff frequency.
          </p>
        </section>

        <section aria-labelledby="calculation-heading">
          <h2 id="calculation-heading" className="utility-label text-ink">
            Calculation
          </h2>

          {calculation.ok && cutoffFrequency && timeConstant ? (
            <div className="mt-4 divide-y divide-line border-y border-line font-mono text-sm text-ink sm:text-base">
              <div className="space-y-2 py-4">
                <p>
                  R = {displayInput(values.resistance.value, values.resistance.unit)} ={" "}
                  {formatSignificant(calculation.inputSI.resistance, 8)} Ω
                </p>
                <p>
                  C = {displayInput(values.capacitance.value, values.capacitance.unit)} ={" "}
                  {formatSignificant(calculation.inputSI.capacitance, 8)} F
                </p>
              </div>
              <div className="space-y-2 py-4">
                <p className="overflow-x-auto pb-1">
                  RC = {formatSignificant(calculation.inputSI.resistance, 8)} ×{" "}
                  {formatSignificant(calculation.inputSI.capacitance, 8)}
                </p>
                <p className="text-accent-strong">
                  = {formatSignificant(calculation.timeConstant, 8)} s ({timeConstant.text})
                </p>
              </div>
              <div className="space-y-2 py-4">
                <p className="overflow-x-auto pb-1">
                  fc = 1 / (2π × {formatSignificant(calculation.timeConstant, 8)})
                </p>
                <p className="text-accent-strong">≈ {cutoffFrequency.text}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-ink">
              Correct the input errors to see the substituted calculation.
            </p>
          )}
        </section>

        <section aria-labelledby="behavior-heading" className="border-t border-line pt-7">
          <h2 id="behavior-heading" className="utility-label text-ink">
            Filter behavior
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-ink">
            {filterExplanations[values.filterType]}
          </p>
        </section>

        <section aria-labelledby="notes-heading" className="border-t border-line pt-7">
          <div className="flex gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <h2 id="notes-heading" className="utility-label text-ink">
                Engineering note
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-ink">
                For a first-order RC filter, cutoff is the −3 dB point where signal
                magnitude is approximately 70.7% of the passband value.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
