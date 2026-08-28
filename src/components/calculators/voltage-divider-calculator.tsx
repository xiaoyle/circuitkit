"use client";

import { CheckCircle2, RotateCcw, Sigma } from "lucide-react";
import { type FormEvent, useMemo, useRef, useState } from "react";

import { UnitInput } from "@/components/calculators/unit-input";
import { Button } from "@/components/ui/button";
import {
  calculateVoltageDivider,
  type VoltageDividerField,
} from "@/lib/calculators/voltage-divider";
import {
  formatEngineering,
  formatSignificant,
  resistanceUnits,
  voltageUnits,
  type ResistanceUnit,
  type VoltageUnit,
} from "@/lib/units";

type FormValues = {
  vin: { value: string; unit: VoltageUnit };
  r1: { value: string; unit: ResistanceUnit };
  r2: { value: string; unit: ResistanceUnit };
};

const initialValues: FormValues = {
  vin: { value: "5", unit: "V" },
  r1: { value: "10", unit: "kΩ" },
  r2: { value: "20", unit: "kΩ" },
};

function displayInput(value: string, unit: string) {
  return `${formatSignificant(Number(value), 6)} ${unit}`;
}

export function VoltageDividerCalculator() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const vinRef = useRef<HTMLInputElement>(null);
  const r1Ref = useRef<HTMLInputElement>(null);
  const r2Ref = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const calculation = useMemo(
    () => calculateVoltageDivider(values),
    [values],
  );

  const errors = useMemo(() => {
    if (calculation.ok) return {};

    return Object.fromEntries(
      calculation.errors.map((error) => [error.field, error.message]),
    ) as Partial<Record<VoltageDividerField, string>>;
  }, [calculation]);

  const outputVoltage = calculation.ok
    ? formatEngineering("voltage", calculation.outputVoltage)
    : null;
  const dividerCurrent = calculation.ok
    ? formatEngineering("current", calculation.dividerCurrent)
    : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!calculation.ok) {
      const firstError = calculation.errors[0]?.field;
      const refs = { vin: vinRef, r1: r1Ref, r2: r2Ref };
      refs[firstError]?.current?.focus();
      return;
    }

    resultHeadingRef.current?.focus();
  }

  function resetValues() {
    setValues(initialValues);
    requestAnimationFrame(() => vinRef.current?.focus());
  }

  return (
    <section
      aria-label="Voltage Divider calculator workspace"
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
            Divider values
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-ink">
            Enter values in familiar engineering units. CircuitKit converts them to SI
            units before calculation.
          </p>
        </div>

        <div className="mt-7 space-y-3">
          <UnitInput
            id="vin"
            label="Input voltage"
            symbol="Vin"
            value={values.vin.value}
            unit={values.vin.unit}
            units={voltageUnits}
            error={errors.vin}
            inputRef={vinRef}
            onValueChange={(value) =>
              setValues((current) => ({ ...current, vin: { ...current.vin, value } }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({ ...current, vin: { ...current.vin, unit } }))
            }
          />
          <UnitInput
            id="r1"
            label="Upper resistance"
            symbol="R1"
            value={values.r1.value}
            unit={values.r1.unit}
            units={resistanceUnits}
            error={errors.r1}
            inputRef={r1Ref}
            onValueChange={(value) =>
              setValues((current) => ({ ...current, r1: { ...current.r1, value } }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({ ...current, r1: { ...current.r1, unit } }))
            }
          />
          <UnitInput
            id="r2"
            label="Lower resistance"
            symbol="R2"
            value={values.r2.value}
            unit={values.r2.unit}
            units={resistanceUnits}
            error={errors.r2}
            inputRef={r2Ref}
            onValueChange={(value) =>
              setValues((current) => ({ ...current, r2: { ...current.r2, value } }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({ ...current, r2: { ...current.r2, unit } }))
            }
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <Button type="submit">Calculate</Button>
          <Button type="button" variant="outline" onClick={resetValues}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset values
          </Button>
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-ink">
          Results update as values or units change. Calculate moves focus to the result.
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

          {calculation.ok && outputVoltage && dividerCurrent ? (
            <dl className="mt-5 grid border-y border-line bg-accent-soft/45 sm:grid-cols-2">
              <div className="px-5 py-6 sm:border-r sm:border-line">
                <dt className="text-sm font-semibold text-muted-ink">Output Voltage</dt>
                <dd className="mt-2 font-mono text-3xl font-semibold tracking-[-0.04em] text-ink tabular-nums">
                  {outputVoltage.text}
                </dd>
              </div>
              <div className="border-t border-line px-5 py-6 sm:border-t-0">
                <dt className="text-sm font-semibold text-muted-ink">Divider Current</dt>
                <dd className="mt-2 font-mono text-3xl font-semibold tracking-[-0.04em] text-ink tabular-nums">
                  {dividerCurrent.text}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="mt-5 min-h-28 border-y border-line bg-surface px-5 py-6">
              <p className="text-sm font-semibold text-caution">
                Check the highlighted inputs.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-ink">
                A result is shown only when all three values and units are valid.
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
            <p>Vout = Vin × R2 / (R1 + R2)</p>
            <p>I = Vin / (R1 + R2)</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-ink">
            For an unloaded ideal divider, the same series current flows through R1 and
            R2; Vout is the voltage across R2.
          </p>
        </section>

        <section aria-labelledby="calculation-heading">
          <h2 id="calculation-heading" className="utility-label text-ink">
            Calculation
          </h2>

          {calculation.ok && outputVoltage && dividerCurrent ? (
            <div className="mt-4 divide-y divide-line border-y border-line font-mono text-sm text-ink sm:text-base">
              <div className="space-y-2 py-4">
                <p className="overflow-x-auto pb-1">
                  {displayInput(values.vin.value, values.vin.unit)} ×{" "}
                  {displayInput(values.r2.value, values.r2.unit)} / ({" "}
                  {displayInput(values.r1.value, values.r1.unit)} +{" "}
                  {displayInput(values.r2.value, values.r2.unit)} )
                </p>
                <p className="text-accent-strong">= {outputVoltage.text}</p>
              </div>
              <div className="space-y-2 py-4">
                <p className="overflow-x-auto pb-1">
                  {displayInput(values.vin.value, values.vin.unit)} / ({" "}
                  {displayInput(values.r1.value, values.r1.unit)} +{" "}
                  {displayInput(values.r2.value, values.r2.unit)} )
                </p>
                <p className="text-accent-strong">= {dividerCurrent.text}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-ink">
              Correct the input errors to see the substituted calculation.
            </p>
          )}
        </section>

        <section aria-labelledby="notes-heading" className="border-t border-line pt-7">
          <div className="flex gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <h2 id="notes-heading" className="utility-label text-ink">
                Engineering note
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-ink">
                Voltage dividers are suitable for signal scaling and high-impedance
                inputs. They should generally not be used to directly power a load.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

