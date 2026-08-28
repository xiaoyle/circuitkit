import {
  parseToSI,
  type ResistanceUnit,
  type UnitConversionErrorCode,
  type VoltageUnit,
} from "../units";

export type VoltageDividerField = "vin" | "r1" | "r2";

export type VoltageDividerInput = {
  vin: { value: unknown; unit: VoltageUnit };
  r1: { value: unknown; unit: ResistanceUnit };
  r2: { value: unknown; unit: ResistanceUnit };
};

export type VoltageDividerSIInput = {
  inputVoltage: number;
  upperResistance: number;
  lowerResistance: number;
};

export type VoltageDividerErrorCode =
  | UnitConversionErrorCode
  | "NEGATIVE_VOLTAGE"
  | "NON_POSITIVE_RESISTANCE"
  | "CALCULATION_RANGE";

export type VoltageDividerError = {
  field: VoltageDividerField;
  code: VoltageDividerErrorCode;
  message: string;
};

export type VoltageDividerResult =
  | {
      ok: true;
      outputVoltage: number;
      dividerCurrent: number;
      inputSI: VoltageDividerSIInput;
    }
  | {
      ok: false;
      errors: VoltageDividerError[];
    };

const fieldLabels: Record<VoltageDividerField, string> = {
  vin: "input voltage",
  r1: "R1",
  r2: "R2",
};

function conversionError(
  field: VoltageDividerField,
  code: UnitConversionErrorCode,
): VoltageDividerError {
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

export function calculateVoltageDividerSI(input: VoltageDividerSIInput): VoltageDividerResult {
  const errors: VoltageDividerError[] = [];

  if (!Number.isFinite(input.inputVoltage)) {
    errors.push({
      field: "vin",
      code: "NON_FINITE_VALUE",
      message: "Input voltage must be a finite number.",
    });
  } else if (input.inputVoltage < 0) {
    errors.push({
      field: "vin",
      code: "NEGATIVE_VOLTAGE",
      message: "Input voltage must be zero or greater.",
    });
  }

  for (const [field, resistance] of [
    ["r1", input.upperResistance],
    ["r2", input.lowerResistance],
  ] as const) {
    if (!Number.isFinite(resistance)) {
      errors.push({
        field,
        code: "NON_FINITE_VALUE",
        message: `${fieldLabels[field]} must be a finite number.`,
      });
    } else if (resistance <= 0) {
      errors.push({
        field,
        code: "NON_POSITIVE_RESISTANCE",
        message: `${fieldLabels[field]} must be greater than zero.`,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const totalResistance = input.upperResistance + input.lowerResistance;

  if (!Number.isFinite(totalResistance) || totalResistance <= 0) {
    return {
      ok: false,
      errors: [
        {
          field: "r2",
          code: "CALCULATION_RANGE",
          message: "The combined resistance is outside the supported range.",
        },
      ],
    };
  }

  const outputVoltage =
    (input.inputVoltage * input.lowerResistance) / totalResistance;
  const dividerCurrent = input.inputVoltage / totalResistance;

  if (!Number.isFinite(outputVoltage) || !Number.isFinite(dividerCurrent)) {
    return {
      ok: false,
      errors: [
        {
          field: "vin",
          code: "CALCULATION_RANGE",
          message: "These values produce a result outside the supported range.",
        },
      ],
    };
  }

  return {
    ok: true,
    outputVoltage,
    dividerCurrent,
    inputSI: input,
  };
}

export function calculateVoltageDivider(input: VoltageDividerInput): VoltageDividerResult {
  const vin = parseToSI("voltage", input.vin.value, input.vin.unit);
  const r1 = parseToSI("resistance", input.r1.value, input.r1.unit);
  const r2 = parseToSI("resistance", input.r2.value, input.r2.unit);
  const errors: VoltageDividerError[] = [];

  if (!vin.ok) errors.push(conversionError("vin", vin.error.code));
  if (!r1.ok) errors.push(conversionError("r1", r1.error.code));
  if (!r2.ok) errors.push(conversionError("r2", r2.error.code));

  if (!vin.ok || !r1.ok || !r2.ok) {
    return { ok: false, errors };
  }

  return calculateVoltageDividerSI({
    inputVoltage: vin.value,
    upperResistance: r1.value,
    lowerResistance: r2.value,
  });
}

