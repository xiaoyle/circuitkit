"use client";

import { CheckCircle2, RotateCcw, Sigma } from "lucide-react";
import { type FormEvent, useMemo, useRef, useState } from "react";

import { UnitInput } from "@/components/calculators/unit-input";
import { Button } from "@/components/ui/button";
import {
  calculateLedResistor,
  type LedResistorField,
} from "@/lib/calculators/led-resistor";
import {
  resistorSeries,
  type ResistorSeries,
} from "@/lib/electronics/resistor-series";
import {
  currentUnits,
  formatEngineering,
  formatSignificant,
  voltageUnits,
  type CurrentUnit,
  type VoltageUnit,
} from "@/lib/units";

type FormValues = {
  supplyVoltage: { value: string; unit: VoltageUnit };
  forwardVoltage: { value: string; unit: VoltageUnit };
  ledCurrent: { value: string; unit: CurrentUnit };
};

const initialValues: FormValues = {
  supplyVoltage: { value: "5", unit: "V" },
  forwardVoltage: { value: "2", unit: "V" },
  ledCurrent: { value: "10", unit: "mA" },
};

function displayInput(value: string, unit: string) {
  return `${formatSignificant(Number(value), 6)} ${unit}`;
}

function displayPercent(value: number) {
  const formatted = formatSignificant(value, 3);
  return `${value > 0 ? "+" : ""}${formatted}%`;
}

export function LedResistorCalculator() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [series, setSeries] = useState<ResistorSeries>("E12");
  const supplyVoltageRef = useRef<HTMLInputElement>(null);
  const forwardVoltageRef = useRef<HTMLInputElement>(null);
  const ledCurrentRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const calculation = useMemo(
    () => calculateLedResistor(values, series),
    [series, values],
  );

  const errors = useMemo(() => {
    if (calculation.ok) return {};

    return Object.fromEntries(
      calculation.errors.map((error) => [error.field, error.message]),
    ) as Partial<Record<LedResistorField, string>>;
  }, [calculation]);

  const requiredResistance = calculation.ok
    ? formatEngineering("resistance", calculation.requiredResistance)
    : null;
  const resistorPower = calculation.ok
    ? formatEngineering("power", calculation.resistorPower)
    : null;
  const resistorVoltage = calculation.ok
    ? formatEngineering("voltage", calculation.resistorVoltage)
    : null;
  const recommendedResistance = calculation.ok
    ? formatEngineering("resistance", calculation.recommendedResistance)
    : null;
  const actualLedCurrent = calculation.ok
    ? formatEngineering("current", calculation.actualLedCurrent)
    : null;
  const currentDeviation = calculation.ok
    ? displayPercent(calculation.currentDeviationPercent)
    : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!calculation.ok) {
      const firstError = calculation.errors[0]?.field;
      const refs = {
        supplyVoltage: supplyVoltageRef,
        forwardVoltage: forwardVoltageRef,
        ledCurrent: ledCurrentRef,
      };
      refs[firstError]?.current?.focus();
      return;
    }

    resultHeadingRef.current?.focus();
  }

  function resetValues() {
    setValues(initialValues);
    setSeries("E12");
    requestAnimationFrame(() => supplyVoltageRef.current?.focus());
  }

  return (
    <section
      aria-label="LED Resistor calculator workspace"
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
            LED operating point
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-ink">
            Set the source, LED forward voltage, and target current. CircuitKit converts
            every value to SI units before calculation.
          </p>
        </div>

        <div className="mt-7 space-y-3">
          <UnitInput
            id="supply-voltage"
            label="Supply voltage"
            symbol="Vsupply"
            value={values.supplyVoltage.value}
            unit={values.supplyVoltage.unit}
            units={voltageUnits}
            error={errors.supplyVoltage}
            inputRef={supplyVoltageRef}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                supplyVoltage: { ...current.supplyVoltage, value },
              }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({
                ...current,
                supplyVoltage: { ...current.supplyVoltage, unit },
              }))
            }
          />
          <UnitInput
            id="forward-voltage"
            label="LED forward voltage"
            symbol="Vf"
            value={values.forwardVoltage.value}
            unit={values.forwardVoltage.unit}
            units={voltageUnits}
            error={errors.forwardVoltage}
            inputRef={forwardVoltageRef}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                forwardVoltage: { ...current.forwardVoltage, value },
              }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({
                ...current,
                forwardVoltage: { ...current.forwardVoltage, unit },
              }))
            }
          />
          <UnitInput
            id="led-current"
            label="LED current"
            symbol="I"
            value={values.ledCurrent.value}
            unit={values.ledCurrent.unit}
            units={currentUnits}
            error={errors.ledCurrent}
            inputRef={ledCurrentRef}
            onValueChange={(value) =>
              setValues((current) => ({
                ...current,
                ledCurrent: { ...current.ledCurrent, value },
              }))
            }
            onUnitChange={(unit) =>
              setValues((current) => ({
                ...current,
                ledCurrent: { ...current.ledCurrent, unit },
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

          <div className="mt-5 flex flex-col gap-2 border-y border-line py-3 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="resistor-series" className="text-sm font-semibold text-ink">
              Standard resistor series
            </label>
            <select
              id="resistor-series"
              value={series}
              onChange={(event) => setSeries(event.target.value as ResistorSeries)}
              className="h-10 w-full cursor-pointer rounded-md border border-line bg-paper px-3 font-mono text-sm text-ink outline-none transition-colors hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent/25 sm:w-28"
            >
              {resistorSeries.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {calculation.ok &&
          requiredResistance &&
          recommendedResistance &&
          actualLedCurrent &&
          resistorPower &&
          resistorVoltage &&
          currentDeviation ? (
            <>
              <dl className="grid border-b border-line bg-accent-soft/45 sm:grid-cols-2">
                <div className="px-5 py-6 sm:border-r sm:border-line">
                  <dt className="text-sm font-semibold text-muted-ink">
                    Theoretical Resistance
                  </dt>
                  <dd className="mt-2 font-mono text-3xl font-semibold tracking-[-0.04em] text-ink tabular-nums">
                    {requiredResistance.text}
                  </dd>
                </div>
                <div className="border-t border-line px-5 py-6 sm:border-t-0">
                  <dt className="text-sm font-semibold text-muted-ink">
                    Recommended Standard Resistor
                  </dt>
                  <dd className="mt-2 font-mono text-3xl font-semibold tracking-[-0.04em] text-ink tabular-nums">
                    {recommendedResistance.text}
                  </dd>
                  <p className="mt-1 font-mono text-xs text-accent-strong">
                    {calculation.resistorSeries} series
                  </p>
                </div>
              </dl>
              <dl className="divide-y divide-line border-b border-line px-1">
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-muted-ink">Actual LED Current</dt>
                  <dd className="font-mono text-sm font-semibold text-ink tabular-nums">
                    {actualLedCurrent.text}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-muted-ink">Current Deviation</dt>
                  <dd className="font-mono text-sm font-semibold text-ink tabular-nums">
                    {currentDeviation}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-muted-ink">
                    Resistor Power Dissipation
                  </dt>
                  <dd className="font-mono text-sm font-semibold text-ink tabular-nums">
                    {resistorPower.text}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-sm text-muted-ink">Voltage Across Resistor</dt>
                  <dd className="font-mono text-sm font-semibold text-ink tabular-nums">
                    {resistorVoltage.text}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="mt-5 min-h-28 border-y border-line bg-surface px-5 py-6">
              <p className="text-sm font-semibold text-caution">
                Check the highlighted inputs.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-ink">
                Supply voltage must exceed forward voltage, and current must be greater
                than zero.
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
            <p>R = (Vsupply - Vf) / I</p>
            <p>P = I²R</p>
            <p>Iactual = (Vsupply - Vf) / Rstandard</p>
            <p>ΔI = (Iactual - Itarget) / Itarget × 100%</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-ink">
            The resistor drops the voltage left after the LED forward voltage. Its power
            can equivalently be checked with P = (Vsupply - Vf) × I.
          </p>
        </section>

        <section aria-labelledby="calculation-heading">
          <h2 id="calculation-heading" className="utility-label text-ink">
            Calculation
          </h2>

          {calculation.ok &&
          requiredResistance &&
          recommendedResistance &&
          actualLedCurrent &&
          resistorPower &&
          currentDeviation ? (
            <div className="mt-4 divide-y divide-line border-y border-line font-mono text-sm text-ink sm:text-base">
              <div className="space-y-2 py-4">
                <p className="overflow-x-auto pb-1">
                  R = ({displayInput(values.supplyVoltage.value, values.supplyVoltage.unit)}
                  {" - "}
                  {displayInput(values.forwardVoltage.value, values.forwardVoltage.unit)}) /{" "}
                  {displayInput(values.ledCurrent.value, values.ledCurrent.unit)}
                </p>
                <p className="text-accent-strong">= {requiredResistance.text}</p>
              </div>
              <div className="space-y-2 py-4">
                <p className="overflow-x-auto pb-1">
                  P = ({displayInput(values.ledCurrent.value, values.ledCurrent.unit)})² ×{" "}
                  {requiredResistance.text}
                </p>
                <p className="text-accent-strong">= {resistorPower.text}</p>
              </div>
              <div className="space-y-2 py-4">
                <p className="overflow-x-auto pb-1">
                  {calculation.resistorSeries} standard = {recommendedResistance.text}
                </p>
                <p className="overflow-x-auto pb-1">
                  Iactual = ({displayInput(values.supplyVoltage.value, values.supplyVoltage.unit)}
                  {" - "}
                  {displayInput(values.forwardVoltage.value, values.forwardVoltage.unit)}) /{" "}
                  {recommendedResistance.text}
                </p>
                <p className="text-accent-strong">= {actualLedCurrent.text}</p>
              </div>
              <div className="space-y-2 py-4">
                <p className="overflow-x-auto pb-1">
                  ΔI = ({actualLedCurrent.text} -{" "}
                  {displayInput(values.ledCurrent.value, values.ledCurrent.unit)}) /{" "}
                  {displayInput(values.ledCurrent.value, values.ledCurrent.unit)} × 100%
                </p>
                <p className="text-accent-strong">= {currentDeviation}</p>
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
                The calculated resistance is the theoretical target for the requested
                current. CircuitKit recommends the nearest selected-series value and
                chooses the larger resistor when two values are equally close, reducing
                LED current for safety. The resistor must also have a sufficient power
                rating.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
