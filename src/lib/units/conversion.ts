import { unitDefinitions, type Quantity, type UnitFor } from "./definitions";

export type UnitConversionErrorCode =
  | "EMPTY_VALUE"
  | "INVALID_NUMBER"
  | "NON_FINITE_VALUE"
  | "INVALID_UNIT";

export type UnitConversionResult =
  | { ok: true; value: number }
  | {
      ok: false;
      error: {
        code: UnitConversionErrorCode;
        message: string;
      };
    };

export type FormattedEngineeringValue<Q extends Quantity> = {
  value: number;
  unit: UnitFor<Q>;
  text: string;
};

function isUnitFor<Q extends Quantity>(quantity: Q, unit: unknown): unit is UnitFor<Q> {
  return typeof unit === "string" && unit in unitDefinitions[quantity].units;
}

function parseFiniteNumber(value: unknown): UnitConversionResult {
  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
    return {
      ok: false,
      error: { code: "EMPTY_VALUE", message: "Enter a value." },
    };
  }

  const parsed = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(parsed)) {
    return {
      ok: false,
      error: { code: "INVALID_NUMBER", message: "Enter a valid number." },
    };
  }

  if (!Number.isFinite(parsed)) {
    return {
      ok: false,
      error: { code: "NON_FINITE_VALUE", message: "Enter a finite number." },
    };
  }

  return { ok: true, value: parsed };
}

/**
 * Converts a trusted, typed engineering value to its SI base unit.
 */
export function toSI<Q extends Quantity>(
  quantity: Q,
  value: number,
  unit: UnitFor<Q>,
): number {
  if (!Number.isFinite(value)) {
    throw new RangeError("Engineering values must be finite numbers.");
  }

  if (!isUnitFor(quantity, unit)) {
    throw new RangeError(`Unsupported ${quantity} unit: ${String(unit)}`);
  }

  const units = unitDefinitions[quantity].units as Readonly<Record<string, number>>;
  const factor = units[unit];
  return value * factor;
}

/**
 * Safe conversion boundary for form or API data. It never returns a numeric result
 * when the value or unit is invalid.
 */
export function parseToSI<Q extends Quantity>(
  quantity: Q,
  value: unknown,
  unit: unknown,
): UnitConversionResult {
  const parsedValue = parseFiniteNumber(value);

  if (!parsedValue.ok) {
    return parsedValue;
  }

  if (!isUnitFor(quantity, unit)) {
    return {
      ok: false,
      error: {
        code: "INVALID_UNIT",
        message: `Choose a supported ${quantity} unit.`,
      },
    };
  }

  const converted = toSI(quantity, parsedValue.value, unit);

  if (!Number.isFinite(converted)) {
    return {
      ok: false,
      error: {
        code: "NON_FINITE_VALUE",
        message: "The converted value is outside the supported range.",
      },
    };
  }

  return { ok: true, value: converted };
}

export function formatSignificant(value: number, maximumSignificantDigits = 3): string {
  if (!Number.isFinite(value)) {
    throw new RangeError("Only finite values can be formatted.");
  }

  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits,
    useGrouping: false,
  }).format(value);
}

export function formatEngineering<Q extends Quantity>(
  quantity: Q,
  valueInSI: number,
  maximumSignificantDigits = 3,
): FormattedEngineeringValue<Q> {
  if (!Number.isFinite(valueInSI)) {
    throw new RangeError("Only finite SI values can be formatted.");
  }

  const definition = unitDefinitions[quantity];
  const entries = (Object.entries(definition.units) as Array<[UnitFor<Q>, number]>).sort(
    (left, right) => right[1] - left[1],
  );
  const absoluteValue = Math.abs(valueInSI);
  const selected =
    valueInSI === 0
      ? ([definition.baseUnit, 1] as [UnitFor<Q>, number])
      : entries.find(([, factor]) => absoluteValue / factor >= definition.displayMinimum) ??
        entries.at(-1)!;
  const [unit, factor] = selected;
  const value = valueInSI / factor;

  return {
    value,
    unit,
    text: `${formatSignificant(value, maximumSignificantDigits)} ${unit}`,
  };
}
