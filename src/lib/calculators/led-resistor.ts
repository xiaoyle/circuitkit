import {
  parseToSI,
  type CurrentUnit,
  type UnitConversionErrorCode,
  type VoltageUnit,
} from "../units";
import {
  findNearestStandardResistor,
  type ResistorSeries,
} from "../electronics/resistor-series";

export type LedResistorField = "supplyVoltage" | "forwardVoltage" | "ledCurrent";

export type LedResistorInput = {
  supplyVoltage: { value: unknown; unit: VoltageUnit };
  forwardVoltage: { value: unknown; unit: VoltageUnit };
  ledCurrent: { value: unknown; unit: CurrentUnit };
};

export type LedResistorSIInput = {
  supplyVoltage: number;
  forwardVoltage: number;
  ledCurrent: number;
};

export type LedResistorErrorCode =
  | UnitConversionErrorCode
  | "NEGATIVE_VOLTAGE"
  | "NON_POSITIVE_CURRENT"
  | "INSUFFICIENT_SUPPLY_VOLTAGE"
  | "CALCULATION_RANGE";

export type LedResistorError = {
  field: LedResistorField;
  code: LedResistorErrorCode;
  message: string;
};

export type LedResistorResult =
  | {
      ok: true;
      requiredResistance: number;
      resistorPower: number;
      resistorVoltage: number;
      resistorSeries: ResistorSeries;
      recommendedResistance: number;
      actualLedCurrent: number;
      currentDeviationPercent: number;
      inputSI: LedResistorSIInput;
    }
  | {
      ok: false;
      errors: LedResistorError[];
    };

const fieldLabels: Record<LedResistorField, string> = {
  supplyVoltage: "supply voltage",
  forwardVoltage: "LED forward voltage",
  ledCurrent: "LED current",
};

function conversionError(
  field: LedResistorField,
  code: UnitConversionErrorCode,
): LedResistorError {
  const label = fieldLabels[field];

  if (code === "EMPTY_VALUE") {
    return { field, code, message: `Enter a value for ${label}.` };
  }

  if (code === "INVALID_UNIT") {
    return { field, code, message: `Choose a supported unit for ${label}.` };
  }

  if (code === "NON_FINITE_VALUE") {
    return { field, code, message: `${label} must be a finite number.` };
  }

  return { field, code, message: `Enter a valid number for ${label}.` };
}

export function calculateLedResistorSI(
  input: LedResistorSIInput,
  series: ResistorSeries = "E12",
): LedResistorResult {
  const errors: LedResistorError[] = [];

  for (const [field, voltage] of [
    ["supplyVoltage", input.supplyVoltage],
    ["forwardVoltage", input.forwardVoltage],
  ] as const) {
    if (!Number.isFinite(voltage)) {
      errors.push({
        field,
        code: "NON_FINITE_VALUE",
        message: `${fieldLabels[field]} must be a finite number.`,
      });
    } else if (voltage < 0) {
      errors.push({
        field,
        code: "NEGATIVE_VOLTAGE",
        message: `${fieldLabels[field]} must be zero or greater.`,
      });
    }
  }

  if (!Number.isFinite(input.ledCurrent)) {
    errors.push({
      field: "ledCurrent",
      code: "NON_FINITE_VALUE",
      message: "LED current must be a finite number.",
    });
  } else if (input.ledCurrent <= 0) {
    errors.push({
      field: "ledCurrent",
      code: "NON_POSITIVE_CURRENT",
      message: "LED current must be greater than zero.",
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (input.supplyVoltage <= input.forwardVoltage) {
    return {
      ok: false,
      errors: [
        {
          field: "supplyVoltage",
          code: "INSUFFICIENT_SUPPLY_VOLTAGE",
          message: "Supply voltage must be greater than the LED forward voltage.",
        },
      ],
    };
  }

  const resistorVoltage = input.supplyVoltage - input.forwardVoltage;
  const requiredResistance = resistorVoltage / input.ledCurrent;
  const resistorPower = input.ledCurrent ** 2 * requiredResistance;
  let recommendedResistance: number;

  try {
    recommendedResistance = findNearestStandardResistor(requiredResistance, series);
  } catch {
    return {
      ok: false,
      errors: [
        {
          field: "ledCurrent",
          code: "CALCULATION_RANGE",
          message: "These values produce a result outside the supported range.",
        },
      ],
    };
  }

  const actualLedCurrent = resistorVoltage / recommendedResistance;
  const currentDeviationPercent =
    ((actualLedCurrent - input.ledCurrent) / input.ledCurrent) * 100;

  if (
    !Number.isFinite(resistorVoltage) ||
    !Number.isFinite(requiredResistance) ||
    !Number.isFinite(resistorPower) ||
    !Number.isFinite(actualLedCurrent) ||
    !Number.isFinite(currentDeviationPercent)
  ) {
    return {
      ok: false,
      errors: [
        {
          field: "ledCurrent",
          code: "CALCULATION_RANGE",
          message: "These values produce a result outside the supported range.",
        },
      ],
    };
  }

  return {
    ok: true,
    requiredResistance,
    resistorPower,
    resistorVoltage,
    resistorSeries: series,
    recommendedResistance,
    actualLedCurrent,
    currentDeviationPercent,
    inputSI: input,
  };
}

export function calculateLedResistor(
  input: LedResistorInput,
  series: ResistorSeries = "E12",
): LedResistorResult {
  const supplyVoltage = parseToSI(
    "voltage",
    input.supplyVoltage.value,
    input.supplyVoltage.unit,
  );
  const forwardVoltage = parseToSI(
    "voltage",
    input.forwardVoltage.value,
    input.forwardVoltage.unit,
  );
  const ledCurrent = parseToSI("current", input.ledCurrent.value, input.ledCurrent.unit);
  const errors: LedResistorError[] = [];

  if (!supplyVoltage.ok) {
    errors.push(conversionError("supplyVoltage", supplyVoltage.error.code));
  }
  if (!forwardVoltage.ok) {
    errors.push(conversionError("forwardVoltage", forwardVoltage.error.code));
  }
  if (!ledCurrent.ok) {
    errors.push(conversionError("ledCurrent", ledCurrent.error.code));
  }

  if (!supplyVoltage.ok || !forwardVoltage.ok || !ledCurrent.ok) {
    return { ok: false, errors };
  }

  return calculateLedResistorSI(
    {
      supplyVoltage: supplyVoltage.value,
      forwardVoltage: forwardVoltage.value,
      ledCurrent: ledCurrent.value,
    },
    series,
  );
}
