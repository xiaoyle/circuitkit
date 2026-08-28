import {
  parseToSI,
  type CapacitanceUnit,
  type InductanceUnit,
  type UnitConversionErrorCode,
} from "../units";

export type RlcResonanceField = "inductance" | "capacitance";

export type RlcResonanceInput = {
  inductance: { value: unknown; unit: InductanceUnit };
  capacitance: { value: unknown; unit: CapacitanceUnit };
};

export type RlcResonanceSIInput = {
  inductance: number;
  capacitance: number;
};

export type RlcResonanceErrorCode =
  | UnitConversionErrorCode
  | "NON_POSITIVE_VALUE"
  | "CALCULATION_RANGE";

export type RlcResonanceError = {
  field: RlcResonanceField;
  code: RlcResonanceErrorCode;
  message: string;
};

export type RlcResonanceResult =
  | {
      ok: true;
      resonantFrequency: number;
      angularResonantFrequency: number;
      lcProduct: number;
      rootLc: number;
      inputSI: RlcResonanceSIInput;
    }
  | {
      ok: false;
      errors: RlcResonanceError[];
    };

const fieldLabels: Record<RlcResonanceField, string> = {
  inductance: "inductance",
  capacitance: "capacitance",
};

function conversionError(
  field: RlcResonanceField,
  code: UnitConversionErrorCode,
): RlcResonanceError {
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

export function calculateRlcResonanceSI(
  input: RlcResonanceSIInput,
): RlcResonanceResult {
  const errors: RlcResonanceError[] = [];

  for (const [field, value] of [
    ["inductance", input.inductance],
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

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const lcProduct = input.inductance * input.capacitance;
  const rootLc = Math.sqrt(lcProduct);
  const angularResonantFrequency = 1 / rootLc;
  const resonantFrequency = angularResonantFrequency / (2 * Math.PI);

  if (
    !Number.isFinite(lcProduct) ||
    lcProduct <= 0 ||
    !Number.isFinite(rootLc) ||
    rootLc <= 0 ||
    !Number.isFinite(angularResonantFrequency) ||
    angularResonantFrequency <= 0 ||
    !Number.isFinite(resonantFrequency) ||
    resonantFrequency <= 0
  ) {
    return {
      ok: false,
      errors: [
        {
          field: "inductance",
          code: "CALCULATION_RANGE",
          message: "These values produce a result outside the supported range.",
        },
      ],
    };
  }

  return {
    ok: true,
    resonantFrequency,
    angularResonantFrequency,
    lcProduct,
    rootLc,
    inputSI: input,
  };
}

export function calculateRlcResonance(
  input: RlcResonanceInput,
): RlcResonanceResult {
  const inductance = parseToSI(
    "inductance",
    input.inductance.value,
    input.inductance.unit,
  );
  const capacitance = parseToSI(
    "capacitance",
    input.capacitance.value,
    input.capacitance.unit,
  );
  const errors: RlcResonanceError[] = [];

  if (!inductance.ok) {
    errors.push(conversionError("inductance", inductance.error.code));
  }

  if (!capacitance.ok) {
    errors.push(conversionError("capacitance", capacitance.error.code));
  }

  if (!inductance.ok || !capacitance.ok) {
    return { ok: false, errors };
  }

  return calculateRlcResonanceSI({
    inductance: inductance.value,
    capacitance: capacitance.value,
  });
}
