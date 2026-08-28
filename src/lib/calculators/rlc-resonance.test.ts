import { describe, expect, it } from "vitest";

import type { CapacitanceUnit, InductanceUnit } from "../units";
import {
  calculateRlcResonance,
  calculateRlcResonanceSI,
  type RlcResonanceField,
  type RlcResonanceResult,
} from "./rlc-resonance";

function expectError(
  result: RlcResonanceResult,
  field: RlcResonanceField,
  code: string,
) {
  expect(result.ok).toBe(false);

  if (!result.ok) {
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field, code })]),
    );
  }
}

describe("RLC resonance calculation", () => {
  it("calculates the 10 mH and 100 nF reference network", () => {
    const result = calculateRlcResonance({
      inductance: { value: 10, unit: "mH" },
      capacitance: { value: 100, unit: "nF" },
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.inputSI.inductance).toBeCloseTo(0.01, 15);
      expect(result.inputSI.capacitance).toBeCloseTo(1e-7, 18);
      expect(result.lcProduct).toBeCloseTo(1e-9, 18);
      expect(result.rootLc).toBeCloseTo(Math.sqrt(1e-9), 15);
      expect(result.angularResonantFrequency).toBeCloseTo(31_622.7766017, 7);
      expect(result.resonantFrequency).toBeCloseTo(5_032.9212104, 7);
    }
  });

  it.each([
    [1, "H", 1, "nF"],
    [1, "mH", 1, "µF"],
    [1, "µH", 1, "mF"],
    [1, "nH", 1, "F"],
    [1_000, "H", 1, "pF"],
  ] as const)(
    "supports %s %s with %s %s",
    (inductance, inductanceUnit, capacitance, capacitanceUnit) => {
      const result = calculateRlcResonance({
        inductance: { value: inductance, unit: inductanceUnit },
        capacitance: { value: capacitance, unit: capacitanceUnit },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.resonantFrequency).toBeCloseTo(5_032.9212104, 7);
      }
    },
  );

  it("rejects zero and negative inductance or capacitance", () => {
    expectError(
      calculateRlcResonanceSI({ inductance: 0, capacitance: 1e-6 }),
      "inductance",
      "NON_POSITIVE_VALUE",
    );
    expectError(
      calculateRlcResonanceSI({ inductance: 1e-3, capacitance: 0 }),
      "capacitance",
      "NON_POSITIVE_VALUE",
    );
    expectError(
      calculateRlcResonanceSI({ inductance: -1e-3, capacitance: -1e-6 }),
      "inductance",
      "NON_POSITIVE_VALUE",
    );
    expectError(
      calculateRlcResonanceSI({ inductance: -1e-3, capacitance: -1e-6 }),
      "capacitance",
      "NON_POSITIVE_VALUE",
    );
  });

  it("rejects empty, invalid, non-finite, and unsupported input", () => {
    expectError(
      calculateRlcResonance({
        inductance: { value: "", unit: "H" },
        capacitance: { value: "", unit: "nF" },
      }),
      "inductance",
      "EMPTY_VALUE",
    );
    expectError(
      calculateRlcResonance({
        inductance: { value: "", unit: "H" },
        capacitance: { value: "", unit: "nF" },
      }),
      "capacitance",
      "EMPTY_VALUE",
    );
    expectError(
      calculateRlcResonance({
        inductance: { value: "not-a-number", unit: "H" },
        capacitance: { value: "not-a-number", unit: "F" },
      }),
      "inductance",
      "INVALID_NUMBER",
    );
    expectError(
      calculateRlcResonance({
        inductance: { value: "not-a-number", unit: "H" },
        capacitance: { value: "not-a-number", unit: "F" },
      }),
      "capacitance",
      "INVALID_NUMBER",
    );
    expectError(
      calculateRlcResonanceSI({
        inductance: Number.POSITIVE_INFINITY,
        capacitance: Number.NaN,
      }),
      "inductance",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateRlcResonanceSI({
        inductance: Number.POSITIVE_INFINITY,
        capacitance: Number.NaN,
      }),
      "capacitance",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateRlcResonance({
        inductance: { value: 10, unit: "kH" as InductanceUnit },
        capacitance: { value: 100, unit: "nF" },
      }),
      "inductance",
      "INVALID_UNIT",
    );
    expectError(
      calculateRlcResonance({
        inductance: { value: 10, unit: "mH" },
        capacitance: { value: 100, unit: "fF" as CapacitanceUnit },
      }),
      "capacitance",
      "INVALID_UNIT",
    );
  });

  it("rejects calculations outside the finite numeric range", () => {
    expectError(
      calculateRlcResonanceSI({
        inductance: Number.MIN_VALUE,
        capacitance: Number.MIN_VALUE,
      }),
      "inductance",
      "CALCULATION_RANGE",
    );
    expectError(
      calculateRlcResonanceSI({
        inductance: Number.MAX_VALUE,
        capacitance: Number.MAX_VALUE,
      }),
      "inductance",
      "CALCULATION_RANGE",
    );
  });
});
