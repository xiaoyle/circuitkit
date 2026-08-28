"use client";

import { CheckCircle2, RotateCcw, Sigma } from "lucide-react";
import { type FormEvent, useMemo, useRef, useState } from "react";

import { OpAmpDiagram } from "@/components/calculators/op-amp-diagram";
import { UnitInput } from "@/components/calculators/unit-input";
import { Button } from "@/components/ui/button";
import {
  calculateOpAmpGain,
  opAmpModes,
  type OpAmpGainField,
  type OpAmpMode,
} from "@/lib/calculators/op-amp-gain";
import {
  formatEngineering,
  formatSignificant,
  resistanceUnits,
  voltageUnits,
  type ResistanceUnit,
  type VoltageUnit,
} from "@/lib/units";

type FormValues = {
  mode: OpAmpMode;
  feedbackResistance: { value: string; unit: ResistanceUnit };
  secondaryResistance: { value: string; unit: ResistanceUnit };
  inputVoltage: { value: string; unit: VoltageUnit };
};

const initialValues: FormValues = {
  mode: "non-inverting",
  feedbackResistance: { value: "9", unit: "kΩ" },
  secondaryResistance: { value: "1", unit: "kΩ" },
  inputVoltage: { value: "0.2", unit: "V" },
};

const modeLabels: Record<OpAmpMode, string> = {
  "non-inverting": "Non-inverting",
  inverting: "Inverting",
};

const modeExplanations: Record<OpAmpMode, string> = {
  "non-inverting":
    "The output follows the input polarity. The closed-loop gain is always positive and at least 1 V/V.",
  inverting:
    "The output reverses the input polarity. The gain is negative, indicating a 180° phase inversion.",
};

function displayInput(value: string, unit: string) {
  return `${formatSignificant(Number(value), 6)} ${unit}`;
}

export function OpAmpGainCalculator() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const modeRef = useRef<HTMLSelectElement>(null);
  const feedbackResistanceRef = useRef<HTMLInputElement>(null);
  const secondaryResistanceRef = useRef<HTMLInputElement>(null);
  const inputVoltageRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const calculation = useMemo(
    () =>
      calculateOpAmpGain({
        mode: values.mode,
        feedbackResistance: values.feedbackResistance,
        ...(values.mode === "non-inverting"
          ? { gainResistance: values.secondaryResistance }
          : { inputResistance: values.secondaryResistance }),
        inputVoltage: values.inputVoltage,
      }),
    [values],
  );

  const errors = useMemo(() => {
    if (calculation.ok) return {};

    return Object.fromEntries(
      calculation.errors.map((error) => [error.field, error.message]),
    ) as Partial<Record<OpAmpGainField, string>>;
  }, [calculation]);

  const secondaryField =
    values.mode === "non-inverting" ? "gainResistance" : "inputResistance";
  const secondaryLabel = values.mode === "non-inverting" ? "Gain resistance" : "Input resistance";
  const secondarySymbol = values.mode === "non-inverting" ? "Rg" : "Rin";
  const gainText = calculation.ok ? formatSignificant(calculation.gain, 4) : null;
  const outputVoltage =
    calculation.ok && calculation.expectedOutputVoltage !== undefined
      ? formatEngineering("voltage", calculation.expectedOutputVoltage, 4)
      : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!calculation.ok) {
      const refs: Record<OpAmpGainField, React.RefObject<HTMLElement | null>> = {
        mode: modeRef,
        feedbackResistance: feedbackResistanceRef,
        gainResistance: secondaryResistanceRef,
        inputResistance: secondaryResistanceRef,
        inputVoltage: inputVoltageRef,
      };
      refs[calculation.errors[0]?.field]?.current?.focus();
      return;
    }

    resultHeadingRef.current?.focus();
  }

  function resetValues() {
    setValues(initialValues);
    requestAnimationFrame(() => modeRef.current?.focus());
  }

  return (
    <section
      aria-label="Op-Amp Gain calculator workspace"
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
            Amplifier configuration
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-ink">
            Choose a closed-loop topology and resistor values. Vin is optional when
            you only need the voltage gain.
          </p>
        </div>

        <div className="mt-7 space-y-3">
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="op-amp-mode" className="text-sm font-semibold text-ink">
                Amplifier mode
              </label>
              <span className="font-mono text-xs text-muted-ink">Topology</span>
            </div>
            <select
              ref={modeRef}
              id="op-amp-mode"
              value={values.mode}
              aria-invalid={Boolean(errors.mode)}
              aria-describedby={errors.mode ? "op-amp-mode-error" : undefined}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  mode: event.target.value as OpAmpMode,
                }))
              }
              className="h-12 w-full cursor-pointer scroll-mt-24 rounded-md border border-line bg-paper px-4 text-sm font-semibold text-ink outline-none transition-colors hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent/25 aria-invalid:border-caution aria-invalid:focus:border-caution aria-invalid:focus:ring-caution/20"
            >
              {opAmpModes.map((mode) => (
                <option key={mode} value={mode}>
                  {modeLabels[mode]}
                </option>
              ))}
            </select>
            <p
              id="op-amp-mode-error"
              role={errors.mode ? "alert" : undefined}
              className="min-h-6 pt-1.5 text-xs leading-5 text-caution"
            >
              {errors.mode ?? ""}
            </p>
          </div>

          <UnitInput
            id="op-amp-feedback-resistance"
            label="Feedback resistance"
            symbol="Rf"
            value={values.feedbackResistance.value}
            unit={values.feedbackResistance.unit}
            units={resistanceUnits}
            error={errors.feedbackResistance}
            inputRef={feedbackResistanceRef}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                feedbackResistance: { ...current.feedbackResistance, value },
              }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({
                ...current,
                feedbackResistance: { ...current.feedbackResistance, unit },
              }))
            }
          />

          <UnitInput
            id="op-amp-secondary-resistance"
            label={secondaryLabel}
            symbol={secondarySymbol}
            value={values.secondaryResistance.value}
            unit={values.secondaryResistance.unit}
            units={resistanceUnits}
            error={errors[secondaryField]}
            inputRef={secondaryResistanceRef}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                secondaryResistance: { ...current.secondaryResistance, value },
              }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({
                ...current,
                secondaryResistance: { ...current.secondaryResistance, unit },
              }))
            }
          />

          <UnitInput
            id="op-amp-input-voltage"
            label="Input voltage (optional)"
            symbol="Vin"
            value={values.inputVoltage.value}
            unit={values.inputVoltage.unit}
            units={voltageUnits}
            error={errors.inputVoltage}
            inputRef={inputVoltageRef}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                inputVoltage: { ...current.inputVoltage, value },
              }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({
                ...current,
                inputVoltage: { ...current.inputVoltage, unit },
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
          Results update as values or mode change. Calculate moves focus to the result.
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

          {calculation.ok && gainText ? (
            <>
              <dl
                className={`mt-5 grid border-y border-line bg-accent-soft/45 ${
                  outputVoltage ? "sm:grid-cols-2" : ""
                }`}
              >
                <div className={`px-5 py-6 ${outputVoltage ? "sm:border-r sm:border-line" : ""}`}>
                  <dt className="text-sm font-semibold text-muted-ink">Voltage Gain</dt>
                  <dd className="mt-2 font-mono text-3xl font-semibold tracking-[-0.04em] text-ink tabular-nums">
                    {gainText} V/V
                  </dd>
                </div>
                {outputVoltage ? (
                  <div className="border-t border-line px-5 py-6 sm:border-t-0">
                    <dt className="text-sm font-semibold text-muted-ink">
                      Expected Output Voltage
                    </dt>
                    <dd className="mt-2 font-mono text-3xl font-semibold tracking-[-0.04em] text-ink tabular-nums">
                      {outputVoltage.text}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <dl className="flex items-baseline justify-between gap-4 border-b border-line px-1 py-4">
                <dt className="text-sm text-muted-ink">Configuration</dt>
                <dd className="font-mono text-sm font-semibold text-ink">
                  {modeLabels[values.mode]}
                </dd>
              </dl>
            </>
          ) : (
            <div className="mt-5 min-h-28 border-y border-line bg-surface px-5 py-6">
              <p className="text-sm font-semibold text-caution">
                Check the highlighted inputs.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-ink">
                Resistor values must be finite and greater than zero.
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="diagram-heading">
          <h2 id="diagram-heading" className="utility-label text-ink">
            Simplified circuit
          </h2>
          <div className="mt-4 border-y border-line bg-surface px-2 py-3 sm:px-5">
            <OpAmpDiagram mode={values.mode} />
          </div>
        </section>

        <section aria-labelledby="formula-heading">
          <div className="flex items-center gap-2">
            <Sigma aria-hidden="true" className="size-4 text-accent" />
            <h2 id="formula-heading" className="utility-label text-ink">
              Formula
            </h2>
          </div>
          <div className="mt-4 space-y-3 border-l-2 border-accent pl-5 font-mono text-sm text-ink sm:text-base">
            <p>
              {values.mode === "non-inverting" ? "Av = 1 + Rf / Rg" : "Av = −Rf / Rin"}
            </p>
            <p>Vout = Av × Vin</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-ink">
            The resistor ratio sets the ideal closed-loop gain; both resistors must use
            the same physical unit after conversion.
          </p>
        </section>

        <section aria-labelledby="calculation-heading">
          <h2 id="calculation-heading" className="utility-label text-ink">
            Calculation
          </h2>

          {calculation.ok && gainText ? (
            <div className="mt-4 divide-y divide-line border-y border-line font-mono text-sm text-ink sm:text-base">
              <div className="space-y-2 py-4">
                <p>
                  Rf = {displayInput(values.feedbackResistance.value, values.feedbackResistance.unit)}
                </p>
                <p>
                  {secondarySymbol} = {displayInput(values.secondaryResistance.value, values.secondaryResistance.unit)}
                </p>
              </div>
              <div className="space-y-2 py-4">
                <p className="overflow-x-auto pb-1">
                  {values.mode === "non-inverting"
                    ? `Av = 1 + ${displayInput(values.feedbackResistance.value, values.feedbackResistance.unit)} / ${displayInput(values.secondaryResistance.value, values.secondaryResistance.unit)}`
                    : `Av = −${displayInput(values.feedbackResistance.value, values.feedbackResistance.unit)} / ${displayInput(values.secondaryResistance.value, values.secondaryResistance.unit)}`}
                </p>
                <p className="text-accent-strong">= {gainText} V/V</p>
              </div>
              {outputVoltage && calculation.expectedOutputVoltage !== undefined ? (
                <div className="space-y-2 py-4">
                  <p className="overflow-x-auto pb-1">
                    Vout = {gainText} × {displayInput(values.inputVoltage.value, values.inputVoltage.unit)}
                  </p>
                  <p className="text-accent-strong">= {outputVoltage.text}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-ink">
              Correct the input errors to see the substituted calculation.
            </p>
          )}
        </section>

        <section aria-labelledby="behavior-heading" className="border-t border-line pt-7">
          <h2 id="behavior-heading" className="utility-label text-ink">
            Amplifier behavior
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-ink">
            {modeExplanations[values.mode]}
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
                These equations assume an ideal op-amp with negative feedback, so the
                calculated Vout is an ideal estimate. This calculator covers closed-loop
                gain only; real op-amps are limited by supply rails, output swing,
                bandwidth, slew rate, and input common-mode range.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
