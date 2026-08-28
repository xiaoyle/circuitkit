import {
  parseToSI,
  type ResistanceUnit,
  type UnitConversionErrorCode,
  type VoltageUnit,
} from "../units";

export const opAmpModes = ["non-inverting", "inverting"] as const;

export type OpAmpMode = (typeof opAmpModes)[number];
export type OpAmpGainField =
  | "mode"
  | "feedbackResistance"
  | "gainResistance"
  | "inputResistance"
  | "inputVoltage";

type ResistanceInput = { value: unknown; unit: ResistanceUnit };
type VoltageInput = { value: unknown; unit: VoltageUnit };

export type OpAmpGainInput = {
  mode: unknown;
  feedbackResistance: ResistanceInput;
  gainResistance?: ResistanceInput;
  inputResistance?: ResistanceInput;
  inputVoltage?: VoltageInput;
};

export type OpAmpGainSIInput = {
  mode: unknown;
  feedbackResistance: number;
  gainResistance?: number;
  inputResistance?: number;
  inputVoltage?: number;
};

export type ResolvedOpAmpGainSIInput =
  | {
      mode: "non-inverting";
      feedbackResistance: number;
      gainResistance: number;
      inputVoltage?: number;
    }
  | {
      mode: "inverting";
      feedbackResistance: number;
      inputResistance: number;
      inputVoltage?: number;
    };

export type OpAmpGainErrorCode =
  | UnitConversionErrorCode
  | "INVALID_MODE"
  | "NON_POSITIVE_RESISTANCE"
  | "CALCULATION_RANGE";

export type OpAmpGainError = {
  field: OpAmpGainField;
  code: OpAmpGainErrorCode;
  message: string;
};

export type OpAmpGainResult =
  | {
      ok: true;
      gain: number;
      expectedOutputVoltage?: number;
      inputSI: ResolvedOpAmpGainSIInput;
    }
  | {
      ok: false;
      errors: OpAmpGainError[];
    };

const fieldLabels: Record<Exclude<OpAmpGainField, "mode">, string> = {
  feedbackResistance: "feedback resistance Rf",
  gainResistance: "gain resistance Rg",
  inputResistance: "input resistance Rin",
  inputVoltage: "input voltage Vin",
};

function isOpAmpMode(value: unknown): value is OpAmpMode {
  return typeof value === "string" && opAmpModes.includes(value as OpAmpMode);
}

function isEmptyOptionalValue(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function conversionError(
  field: Exclude<OpAmpGainField, "mode">,
  code: UnitConversionErrorCode,
): OpAmpGainError {
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

export function calculateOpAmpGainSI(input: OpAmpGainSIInput): OpAmpGainResult {
  const errors: OpAmpGainError[] = [];

  if (!isOpAmpMode(input.mode)) {
    errors.push({
      field: "mode",
      code: "INVALID_MODE",
      message: "Choose non-inverting or inverting mode.",
    });
  }

  if (!Number.isFinite(input.feedbackResistance)) {
    errors.push({
      field: "feedbackResistance",
      code: "NON_FINITE_VALUE",
      message: "feedback resistance Rf must be a finite number.",
    });
  } else if (input.feedbackResistance <= 0) {
    errors.push({
      field: "feedbackResistance",
      code: "NON_POSITIVE_RESISTANCE",
      message: "feedback resistance Rf must be greater than zero.",
    });
  }

  if (isOpAmpMode(input.mode)) {
    const field =
      input.mode === "non-inverting" ? "gainResistance" : "inputResistance";
    const resistance = input[field];

    if (typeof resistance !== "number" || !Number.isFinite(resistance)) {
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

  if (input.inputVoltage !== undefined && !Number.isFinite(input.inputVoltage)) {
    errors.push({
      field: "inputVoltage",
      code: "NON_FINITE_VALUE",
      message: "input voltage Vin must be a finite number.",
    });
  }

  if (errors.length > 0 || !isOpAmpMode(input.mode)) {
    return { ok: false, errors };
  }

  const secondaryResistance =
    input.mode === "non-inverting" ? input.gainResistance! : input.inputResistance!;
  const gain =
    input.mode === "non-inverting"
      ? 1 + input.feedbackResistance / secondaryResistance
      : -input.feedbackResistance / secondaryResistance;
  const expectedOutputVoltage =
    input.inputVoltage === undefined ? undefined : gain * input.inputVoltage;

  if (
    !Number.isFinite(gain) ||
    (expectedOutputVoltage !== undefined && !Number.isFinite(expectedOutputVoltage))
  ) {
    return {
      ok: false,
      errors: [
        {
          field: "feedbackResistance",
          code: "CALCULATION_RANGE",
          message: "These values produce a result outside the supported range.",
        },
      ],
    };
  }

  const optionalVoltage =
    input.inputVoltage === undefined ? {} : { inputVoltage: input.inputVoltage };
  const inputSI: ResolvedOpAmpGainSIInput =
    input.mode === "non-inverting"
      ? {
          mode: input.mode,
          feedbackResistance: input.feedbackResistance,
          gainResistance: secondaryResistance,
          ...optionalVoltage,
        }
      : {
          mode: input.mode,
          feedbackResistance: input.feedbackResistance,
          inputResistance: secondaryResistance,
          ...optionalVoltage,
        };

  return {
    ok: true,
    gain,
    ...(expectedOutputVoltage === undefined ? {} : { expectedOutputVoltage }),
    inputSI,
  };
}

export function calculateOpAmpGain(input: OpAmpGainInput): OpAmpGainResult {
  const feedbackResistance = parseToSI(
    "resistance",
    input.feedbackResistance.value,
    input.feedbackResistance.unit,
  );
  const errors: OpAmpGainError[] = [];

  if (!feedbackResistance.ok) {
    errors.push(conversionError("feedbackResistance", feedbackResistance.error.code));
  }

  if (!isOpAmpMode(input.mode)) {
    errors.push({
      field: "mode",
      code: "INVALID_MODE",
      message: "Choose non-inverting or inverting mode.",
    });
  }

  const secondaryField =
    input.mode === "non-inverting" ? "gainResistance" : "inputResistance";
  const secondaryInput =
    input.mode === "non-inverting" ? input.gainResistance : input.inputResistance;
  const secondaryResistance = isOpAmpMode(input.mode)
    ? parseToSI(
        "resistance",
        secondaryInput?.value,
        secondaryInput?.unit,
      )
    : null;

  if (secondaryResistance && !secondaryResistance.ok) {
    errors.push(conversionError(secondaryField, secondaryResistance.error.code));
  }

  let inputVoltage: number | undefined;

  if (input.inputVoltage && !isEmptyOptionalValue(input.inputVoltage.value)) {
    const parsedInputVoltage = parseToSI(
      "voltage",
      input.inputVoltage.value,
      input.inputVoltage.unit,
    );

    if (!parsedInputVoltage.ok) {
      errors.push(conversionError("inputVoltage", parsedInputVoltage.error.code));
    } else {
      inputVoltage = parsedInputVoltage.value;
    }
  }

  if (
    errors.length > 0 ||
    !feedbackResistance.ok ||
    !secondaryResistance ||
    !secondaryResistance.ok ||
    !isOpAmpMode(input.mode)
  ) {
    return { ok: false, errors };
  }

  return calculateOpAmpGainSI({
    mode: input.mode,
    feedbackResistance: feedbackResistance.value,
    ...(input.mode === "non-inverting"
      ? { gainResistance: secondaryResistance.value }
      : { inputResistance: secondaryResistance.value }),
    ...(inputVoltage === undefined ? {} : { inputVoltage }),
  });
}
