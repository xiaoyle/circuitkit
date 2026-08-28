import {
  parseToSI,
  type CapacitanceUnit,
  type ResistanceUnit,
  type UnitConversionErrorCode,
} from "../units";

export const rcFilterTypes = ["low-pass", "high-pass"] as const;

export type RcFilterType = (typeof rcFilterTypes)[number];
export type RcFilterField = "resistance" | "capacitance" | "filterType";

export type RcFilterInput = {
  resistance: { value: unknown; unit: ResistanceUnit };
  capacitance: { value: unknown; unit: CapacitanceUnit };
  filterType: unknown;
};

export type RcFilterSIInput = {
  resistance: number;
  capacitance: number;
  filterType: RcFilterType;
};

export type RcFilterErrorCode =
  | UnitConversionErrorCode
  | "NON_POSITIVE_VALUE"
  | "INVALID_FILTER_TYPE"
  | "CALCULATION_RANGE";

export type RcFilterError = {
  field: RcFilterField;
  code: RcFilterErrorCode;
  message: string;
};

export type RcFilterResult =
  | {
      ok: true;
      cutoffFrequency: number;
      timeConstant: number;
      filterType: RcFilterType;
      inputSI: RcFilterSIInput;
    }
  | {
      ok: false;
      errors: RcFilterError[];
    };

const fieldLabels = {
  resistance: "resistance",
  capacitance: "capacitance",
} as const;

function isRcFilterType(value: unknown): value is RcFilterType {
  return typeof value === "string" && rcFilterTypes.includes(value as RcFilterType);
}

function conversionError(
  field: "resistance" | "capacitance",
  code: UnitConversionErrorCode,
): RcFilterError {
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

export function calculateRcFilterSI(input: RcFilterSIInput): RcFilterResult {
  const errors: RcFilterError[] = [];

  for (const [field, value] of [
    ["resistance", input.resistance],
    ["capacitance", input.capacitance],
  ] as const) {
    if (!Number.isFinite(value)) {
      errors.push({
        field,
        code: "NON_FINITE_VALUE",
        message: `${fieldLabels[field]} must be a finite number.`,
      });
    } else if (value <= 0) {
      errors.push({
        field,
        code: "NON_POSITIVE_VALUE",
        message: `${fieldLabels[field]} must be greater than zero.`,
      });
    }
  }

  if (!isRcFilterType(input.filterType)) {
    errors.push({
      field: "filterType",
      code: "INVALID_FILTER_TYPE",
      message: "Choose low-pass or high-pass.",
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const timeConstant = input.resistance * input.capacitance;
  const cutoffFrequency = 1 / (2 * Math.PI * timeConstant);

  if (!Number.isFinite(timeConstant) || !Number.isFinite(cutoffFrequency)) {
    return {
      ok: false,
      errors: [
        {
          field: "capacitance",
          code: "CALCULATION_RANGE",
          message: "These values produce a result outside the supported range.",
        },
      ],
    };
  }

  return {
    ok: true,
    cutoffFrequency,
    timeConstant,
    filterType: input.filterType,
    inputSI: input,
  };
}

export function calculateRcFilter(input: RcFilterInput): RcFilterResult {
  const resistance = parseToSI(
    "resistance",
    input.resistance.value,
    input.resistance.unit,
  );
  const capacitance = parseToSI(
    "capacitance",
    input.capacitance.value,
    input.capacitance.unit,
  );
  const errors: RcFilterError[] = [];

  if (!resistance.ok) {
    errors.push(conversionError("resistance", resistance.error.code));
  }

  if (!capacitance.ok) {
    errors.push(conversionError("capacitance", capacitance.error.code));
  }

  if (!isRcFilterType(input.filterType)) {
    errors.push({
      field: "filterType",
      code: "INVALID_FILTER_TYPE",
      message: "Choose low-pass or high-pass.",
    });
  }

  if (!resistance.ok || !capacitance.ok || !isRcFilterType(input.filterType)) {
    return { ok: false, errors };
  }

  return calculateRcFilterSI({
    resistance: resistance.value,
    capacitance: capacitance.value,
    filterType: input.filterType,
  });
}
