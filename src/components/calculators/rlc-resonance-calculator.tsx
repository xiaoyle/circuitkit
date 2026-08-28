"use client";

import { CheckCircle2, RotateCcw, Sigma } from "lucide-react";
import { type FormEvent, useMemo, useRef, useState } from "react";

import { RlcResonanceDiagram } from "@/components/calculators/rlc-resonance-diagram";
import { UnitInput } from "@/components/calculators/unit-input";
import { Button } from "@/components/ui/button";
import {
  calculateRlcResonance,
  type RlcResonanceField,
} from "@/lib/calculators/rlc-resonance";
import {
  capacitanceUnits,
  formatEngineering,
  formatSignificant,
  inductanceUnits,
  type CapacitanceUnit,
  type InductanceUnit,
} from "@/lib/units";

type FormValues = {
  inductance: { value: string; unit: InductanceUnit };
  capacitance: { value: string; unit: CapacitanceUnit };
};

const initialValues: FormValues = {
  inductance: { value: "10", unit: "mH" },
  capacitance: { value: "100", unit: "nF" },
};

function displayInput(value: string, unit: string) {
  return `${formatSignificant(Number(value), 6)} ${unit}`;
}

function formatAngularFrequency(value: number) {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1e6) {
    return `${formatSignificant(value / 1e6, 4)} Mrad/s`;
  }

  if (absoluteValue >= 1e3) {
    return `${formatSignificant(value / 1e3, 4)} krad/s`;
  }

  return `${formatSignificant(value, 4)} rad/s`;
}

export function RlcResonanceCalculator() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const inductanceRef = useRef<HTMLInputElement>(null);
  const capacitanceRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const calculation = useMemo(() => calculateRlcResonance(values), [values]);

  const errors = useMemo(() => {
    if (calculation.ok) return {};

    return Object.fromEntries(
      calculation.errors.map((error) => [error.field, error.message]),
    ) as Partial<Record<RlcResonanceField, string>>;
  }, [calculation]);

  const resonantFrequency = calculation.ok
    ? formatEngineering("frequency", calculation.resonantFrequency)
    : null;
  const angularFrequency = calculation.ok
    ? formatAngularFrequency(calculation.angularResonantFrequency)
    : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!calculation.ok) {
      const refs = {
        inductance: inductanceRef,
        capacitance: capacitanceRef,
      };
      refs[calculation.errors[0]?.field]?.current?.focus();
      return;
    }

    resultHeadingRef.current?.focus();
  }

  function resetValues() {
    setValues(initialValues);
    requestAnimationFrame(() => inductanceRef.current?.focus());
  }

  return (
    <section
      aria-label="RLC Resonance calculator workspace"
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
            Resonant network values
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-ink">
            Set the inductor and capacitor. CircuitKit converts both values to SI units
            before calculating the ideal natural frequency.
          </p>
        </div>

        <div className="mt-7 space-y-3">
          <UnitInput
            id="rlc-inductance"
            label="Inductance"
            symbol="L"
            value={values.inductance.value}
            unit={values.inductance.unit}
            units={inductanceUnits}
            error={errors.inductance}
            inputRef={inductanceRef}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                inductance: { ...current.inductance, value },
              }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({
                ...current,
                inductance: { ...current.inductance, unit },
              }))
            }
          />
          <UnitInput
            id="rlc-capacitance"
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

          {calculation.ok && resonantFrequency && angularFrequency ? (
            <>
              <dl className="mt-5 border-y border-line bg-accent-soft/45">
                <div className="px-5 py-6">
                  <dt className="text-sm font-semibold text-muted-ink">
                    Resonant Frequency
                  </dt>
                  <dd className="mt-2 font-mono text-4xl font-semibold tracking-[-0.045em] text-ink tabular-nums">
                    {resonantFrequency.text}
                  </dd>
                </div>
              </dl>
              <dl className="divide-y divide-line border-b border-line px-1">
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-muted-ink">Angular Resonant Frequency</dt>
                  <dd className="font-mono text-sm font-semibold text-ink tabular-nums">
                    {angularFrequency}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-muted-ink">Network Model</dt>
                  <dd className="font-mono text-sm font-semibold text-ink">Ideal LC</dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="mt-5 min-h-28 border-y border-line bg-surface px-5 py-6">
              <p className="text-sm font-semibold text-caution">
                Check the highlighted inputs.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-ink">
                Inductance and capacitance must both be finite values greater than zero.
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="diagram-heading">
          <h2 id="diagram-heading" className="utility-label text-ink">
            Simplified resonant network
          </h2>
          <div className="mt-4 border-y border-line bg-surface px-2 py-3 sm:px-5">
            <RlcResonanceDiagram />
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-ink">
            R represents real circuit loss and is not an input in this ideal-frequency calculation.
          </p>
        </section>

        <section aria-labelledby="formula-heading">
          <div className="flex items-center gap-2">
            <Sigma aria-hidden="true" className="size-4 text-accent" />
            <h2 id="formula-heading" className="utility-label text-ink">
              Formula
            </h2>
          </div>
          <div className="mt-4 space-y-3 border-l-2 border-accent pl-5 font-mono text-sm text-ink sm:text-base">
            <p>f₀ = 1 / (2π√(LC))</p>
            <p>ω₀ = 1 / √(LC)</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-ink">
            L and C determine the ideal natural frequency. Resistance changes damping,
            Q factor, and bandwidth rather than this ideal LC result.
          </p>
        </section>

        <section aria-labelledby="calculation-heading">
          <h2 id="calculation-heading" className="utility-label text-ink">
            Calculation
          </h2>

          {calculation.ok && resonantFrequency && angularFrequency ? (
            <div className="mt-4 divide-y divide-line border-y border-line font-mono text-sm text-ink sm:text-base">
              <div className="space-y-2 py-4">
                <p>
                  L = {displayInput(values.inductance.value, values.inductance.unit)} ={" "}
                  {formatSignificant(calculation.inputSI.inductance, 8)} H
                </p>
                <p>
                  C = {displayInput(values.capacitance.value, values.capacitance.unit)} ={" "}
                  {formatSignificant(calculation.inputSI.capacitance, 8)} F
                </p>
              </div>
              <div className="space-y-2 py-4">
                <p>
                  LC = {formatSignificant(calculation.inputSI.inductance, 8)} ×{" "}
                  {formatSignificant(calculation.inputSI.capacitance, 8)}
                </p>
                <p className="text-accent-strong">
                  = {formatSignificant(calculation.lcProduct, 8)} H·F
                </p>
                <p>√(LC) = {formatSignificant(calculation.rootLc, 8)} s</p>
              </div>
              <div className="space-y-2 py-4">
                <p>ω₀ = 1 / {formatSignificant(calculation.rootLc, 8)} s</p>
                <p className="text-accent-strong">≈ {angularFrequency}</p>
              </div>
              <div className="space-y-2 py-4">
                <p className="overflow-x-auto pb-1">
                  f₀ = 1 / (2π × {formatSignificant(calculation.rootLc, 8)} s)
                </p>
                <p>
                  ≈ {formatSignificant(calculation.resonantFrequency, 9)} Hz
                </p>
                <p className="text-accent-strong">≈ {resonantFrequency.text}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-ink">
              Correct the input errors to see the substituted calculation.
            </p>
          )}
        </section>

        <section aria-labelledby="explanation-heading" className="border-t border-line pt-7">
          <h2 id="explanation-heading" className="utility-label text-ink">
            Why resonance occurs
          </h2>
          <div className="mt-3 space-y-2 text-sm leading-6 text-muted-ink">
            <p>
              Resonance occurs when energy exchange between the inductor and capacitor
              reaches the circuit&apos;s natural frequency.
            </p>
            <p>
              The inductor stores magnetic-field energy, while the capacitor stores
              electric-field energy. At resonance, this exchange creates a strong
              frequency-selective response.
            </p>
          </div>
        </section>

        <section aria-labelledby="notes-heading" className="border-t border-line pt-7">
          <div className="flex gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <h2 id="notes-heading" className="utility-label text-ink">
                Engineering note
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-ink">
                This formula assumes ideal components. Real inductors and capacitors
                have tolerance and parasitic resistance; resistance affects damping,
                Q factor, and bandwidth, so the actual resonant frequency may differ.
                Q and bandwidth are future enhancements, not part of this calculation.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
