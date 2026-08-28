import { describe, expect, it } from "vitest";

import type { ResistanceUnit, VoltageUnit } from "../units";
import {
  calculateOpAmpGain,
  calculateOpAmpGainSI,
  type OpAmpGainField,
  type OpAmpGainResult,
  type OpAmpMode,
} from "./op-amp-gain";

function expectError(result: OpAmpGainResult, field: OpAmpGainField, code: string) {
  expect(result.ok).toBe(false);

  if (!result.ok) {
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field, code })]),
    );
  }
}

describe("op-amp gain calculation", () => {
  it("calculates the non-inverting reference circuit", () => {
    const result = calculateOpAmpGain({
      mode: "non-inverting",
      feedbackResistance: { value: 9, unit: "kΩ" },
      gainResistance: { value: 1, unit: "kΩ" },
      inputVoltage: { value: 0.2, unit: "V" },
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.gain).toBeCloseTo(10, 12);
      expect(result.expectedOutputVoltage).toBeCloseTo(2, 12);
      expect(result.inputSI).toEqual({
        mode: "non-inverting",
        feedbackResistance: 9_000,
        gainResistance: 1_000,
        inputVoltage: 0.2,
      });
    }
  });

  it("calculates the inverting reference circuit", () => {
    const result = calculateOpAmpGain({
      mode: "inverting",
      feedbackResistance: { value: 10, unit: "kΩ" },
      inputResistance: { value: 1, unit: "kΩ" },
      inputVoltage: { value: 0.1, unit: "V" },
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.gain).toBeCloseTo(-10, 12);
      expect(result.expectedOutputVoltage).toBeCloseTo(-1, 12);
    }
  });

  it.each([
    [9, "Ω", 1, "Ω"],
    [9, "kΩ", 1, "kΩ"],
    [9, "MΩ", 1, "MΩ"],
  ] as const)(
    "supports %s %s and %s %s",
    (feedback, feedbackUnit, gainResistance, gainUnit) => {
      const result = calculateOpAmpGain({
        mode: "non-inverting",
        feedbackResistance: { value: feedback, unit: feedbackUnit },
        gainResistance: { value: gainResistance, unit: gainUnit },
      });

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.gain).toBeCloseTo(10, 12);
    },
  );

  it("supports millivolts and allows Vin to be omitted", () => {
    const withMillivolts = calculateOpAmpGain({
      mode: "non-inverting",
      feedbackResistance: { value: 9, unit: "kΩ" },
      gainResistance: { value: 1, unit: "kΩ" },
      inputVoltage: { value: 200, unit: "mV" },
    });
    const withoutVin = calculateOpAmpGain({
      mode: "non-inverting",
      feedbackResistance: { value: 9, unit: "kΩ" },
      gainResistance: { value: 1, unit: "kΩ" },
      inputVoltage: { value: "", unit: "V" },
    });

    expect(withMillivolts.ok).toBe(true);
    expect(withoutVin.ok).toBe(true);

    if (withMillivolts.ok) {
      expect(withMillivolts.expectedOutputVoltage).toBeCloseTo(2, 12);
    }
    if (withoutVin.ok) {
      expect(withoutVin.gain).toBeCloseTo(10, 12);
      expect(withoutVin.expectedOutputVoltage).toBeUndefined();
      expect("inputVoltage" in withoutVin.inputSI).toBe(false);
    }
  });

  it("allows negative Vin", () => {
    const result = calculateOpAmpGain({
      mode: "inverting",
      feedbackResistance: { value: 10, unit: "kΩ" },
      inputResistance: { value: 1, unit: "kΩ" },
      inputVoltage: { value: -100, unit: "mV" },
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.expectedOutputVoltage).toBeCloseTo(1, 12);
  });

  it("rejects zero and negative resistances", () => {
    expectError(
      calculateOpAmpGainSI({
        mode: "non-inverting",
        feedbackResistance: 0,
        gainResistance: 1_000,
      }),
      "feedbackResistance",
      "NON_POSITIVE_RESISTANCE",
    );
    expectError(
      calculateOpAmpGainSI({
        mode: "non-inverting",
        feedbackResistance: 9_000,
        gainResistance: 0,
      }),
      "gainResistance",
      "NON_POSITIVE_RESISTANCE",
    );
    expectError(
      calculateOpAmpGainSI({
        mode: "inverting",
        feedbackResistance: -10_000,
        inputResistance: -1_000,
      }),
      "feedbackResistance",
      "NON_POSITIVE_RESISTANCE",
    );
    expectError(
      calculateOpAmpGainSI({
        mode: "inverting",
        feedbackResistance: -10_000,
        inputResistance: -1_000,
      }),
      "inputResistance",
      "NON_POSITIVE_RESISTANCE",
    );
  });

  it("rejects invalid, non-finite, and unsupported input", () => {
    expectError(
      calculateOpAmpGain({
        mode: "non-inverting",
        feedbackResistance: { value: "", unit: "Ω" },
        gainResistance: { value: 1, unit: "kΩ" },
      }),
      "feedbackResistance",
      "EMPTY_VALUE",
    );
    expectError(
      calculateOpAmpGain({
        mode: "non-inverting",
        feedbackResistance: { value: "bad", unit: "Ω" },
        gainResistance: { value: 1, unit: "kΩ" },
      }),
      "feedbackResistance",
      "INVALID_NUMBER",
    );
    expectError(
      calculateOpAmpGainSI({
        mode: "inverting",
        feedbackResistance: Number.POSITIVE_INFINITY,
        inputResistance: Number.NaN,
        inputVoltage: Number.NEGATIVE_INFINITY,
      }),
      "feedbackResistance",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateOpAmpGainSI({
        mode: "inverting",
        feedbackResistance: Number.POSITIVE_INFINITY,
        inputResistance: Number.NaN,
        inputVoltage: Number.NEGATIVE_INFINITY,
      }),
      "inputResistance",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateOpAmpGainSI({
        mode: "inverting",
        feedbackResistance: Number.POSITIVE_INFINITY,
        inputResistance: Number.NaN,
        inputVoltage: Number.NEGATIVE_INFINITY,
      }),
      "inputVoltage",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateOpAmpGain({
        mode: "non-inverting",
        feedbackResistance: { value: 9, unit: "GΩ" as ResistanceUnit },
        gainResistance: { value: 1, unit: "kΩ" },
      }),
      "feedbackResistance",
      "INVALID_UNIT",
    );
    expectError(
      calculateOpAmpGain({
        mode: "non-inverting",
        feedbackResistance: { value: 9, unit: "kΩ" },
        gainResistance: { value: 1, unit: "kΩ" },
        inputVoltage: { value: 0.2, unit: "kV" as VoltageUnit },
      }),
      "inputVoltage",
      "INVALID_UNIT",
    );
    expectError(
      calculateOpAmpGain({
        mode: "buffer" as OpAmpMode,
        feedbackResistance: { value: 9, unit: "kΩ" },
        gainResistance: { value: 1, unit: "kΩ" },
      }),
      "mode",
      "INVALID_MODE",
    );
  });
});
