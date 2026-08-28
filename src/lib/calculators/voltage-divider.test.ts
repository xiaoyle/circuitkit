import { describe, expect, it } from "vitest";

import type { VoltageUnit } from "../units";
import {
  calculateVoltageDivider,
  calculateVoltageDividerSI,
  type VoltageDividerField,
  type VoltageDividerResult,
} from "./voltage-divider";

function expectError(
  result: VoltageDividerResult,
  field: VoltageDividerField,
  code: string,
) {
  expect(result.ok).toBe(false);

  if (!result.ok) {
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field, code })]),
    );
  }
}

describe("voltage divider calculation", () => {
  it("calculates the reference 5 V, 10 kΩ, 20 kΩ divider", () => {
    const result = calculateVoltageDivider({
      vin: { value: 5, unit: "V" },
      r1: { value: 10, unit: "kΩ" },
      r2: { value: 20, unit: "kΩ" },
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.inputSI).toEqual({
        inputVoltage: 5,
        upperResistance: 10_000,
        lowerResistance: 20_000,
      });
      expect(result.outputVoltage).toBeCloseTo(3.333333333, 9);
      expect(result.dividerCurrent).toBeCloseTo(0.0001666667, 10);
    }
  });

  it("accepts millivolt input through the shared unit system", () => {
    const result = calculateVoltageDivider({
      vin: { value: 5_000, unit: "mV" },
      r1: { value: 10_000, unit: "Ω" },
      r2: { value: 0.02, unit: "MΩ" },
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.outputVoltage).toBeCloseTo(10 / 3, 12);
      expect(result.dividerCurrent).toBeCloseTo(1 / 6_000, 12);
    }
  });

  it("rejects empty and non-numeric form values", () => {
    expectError(
      calculateVoltageDivider({
        vin: { value: "", unit: "V" },
        r1: { value: 10, unit: "kΩ" },
        r2: { value: 20, unit: "kΩ" },
      }),
      "vin",
      "EMPTY_VALUE",
    );

    expectError(
      calculateVoltageDivider({
        vin: { value: "not-a-number", unit: "V" },
        r1: { value: 10, unit: "kΩ" },
        r2: { value: 20, unit: "kΩ" },
      }),
      "vin",
      "INVALID_NUMBER",
    );
  });

  it("rejects negative voltage and non-positive resistance", () => {
    expectError(
      calculateVoltageDividerSI({
        inputVoltage: -1,
        upperResistance: 10_000,
        lowerResistance: 20_000,
      }),
      "vin",
      "NEGATIVE_VOLTAGE",
    );
    expectError(
      calculateVoltageDividerSI({
        inputVoltage: 5,
        upperResistance: 0,
        lowerResistance: -1,
      }),
      "r1",
      "NON_POSITIVE_RESISTANCE",
    );
    expectError(
      calculateVoltageDividerSI({
        inputVoltage: 5,
        upperResistance: 0,
        lowerResistance: -1,
      }),
      "r2",
      "NON_POSITIVE_RESISTANCE",
    );
  });

  it("rejects NaN, Infinity, and unsupported units", () => {
    expectError(
      calculateVoltageDividerSI({
        inputVoltage: Number.NaN,
        upperResistance: 10_000,
        lowerResistance: 20_000,
      }),
      "vin",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateVoltageDividerSI({
        inputVoltage: 5,
        upperResistance: Number.POSITIVE_INFINITY,
        lowerResistance: 20_000,
      }),
      "r1",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateVoltageDivider({
        vin: { value: 5, unit: "kV" as VoltageUnit },
        r1: { value: 10, unit: "kΩ" },
        r2: { value: 20, unit: "kΩ" },
      }),
      "vin",
      "INVALID_UNIT",
    );
  });
});

