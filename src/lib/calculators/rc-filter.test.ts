import { describe, expect, it } from "vitest";

import type { CapacitanceUnit, ResistanceUnit } from "../units";
import {
  calculateRcFilter,
  calculateRcFilterSI,
  type RcFilterField,
  type RcFilterResult,
  type RcFilterType,
} from "./rc-filter";

function expectError(result: RcFilterResult, field: RcFilterField, code: string) {
  expect(result.ok).toBe(false);

  if (!result.ok) {
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field, code })]),
    );
  }
}

describe("RC filter calculation", () => {
  it("calculates the reference 10 kΩ and 100 nF filter", () => {
    const result = calculateRcFilter({
      resistance: { value: 10, unit: "kΩ" },
      capacitance: { value: 100, unit: "nF" },
      filterType: "low-pass",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.inputSI.resistance).toBe(10_000);
      expect(result.inputSI.capacitance).toBeCloseTo(1e-7, 18);
      expect(result.inputSI.filterType).toBe("low-pass");
      expect(result.timeConstant).toBeCloseTo(0.001, 12);
      expect(result.cutoffFrequency).toBeCloseTo(159.1549431, 7);
    }
  });

  it("uses the same cutoff calculation for low-pass and high-pass", () => {
    const lowPass = calculateRcFilterSI({
      resistance: 10_000,
      capacitance: 1e-7,
      filterType: "low-pass",
    });
    const highPass = calculateRcFilterSI({
      resistance: 10_000,
      capacitance: 1e-7,
      filterType: "high-pass",
    });

    expect(lowPass.ok).toBe(true);
    expect(highPass.ok).toBe(true);

    if (lowPass.ok && highPass.ok) {
      expect(highPass.cutoffFrequency).toBeCloseTo(lowPass.cutoffFrequency, 12);
      expect(highPass.timeConstant).toBeCloseTo(lowPass.timeConstant, 12);
      expect(highPass.filterType).toBe("high-pass");
    }
  });

  it.each([
    [1_000, "Ω", 1e-6, "F"],
    [1, "kΩ", 1, "µF"],
    [1, "MΩ", 1, "nF"],
    [1, "Ω", 1, "mF"],
    [1, "MΩ", 1_000, "pF"],
  ] as const)(
    "supports %s %s with %s %s",
    (resistance, resistanceUnit, capacitance, capacitanceUnit) => {
      const result = calculateRcFilter({
        resistance: { value: resistance, unit: resistanceUnit },
        capacitance: { value: capacitance, unit: capacitanceUnit },
        filterType: "low-pass",
      });

      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.timeConstant).toBeCloseTo(0.001, 12);
        expect(result.cutoffFrequency).toBeCloseTo(159.1549431, 7);
      }
    },
  );

  it("rejects zero and negative resistance or capacitance", () => {
    expectError(
      calculateRcFilterSI({
        resistance: 0,
        capacitance: 1e-6,
        filterType: "low-pass",
      }),
      "resistance",
      "NON_POSITIVE_VALUE",
    );
    expectError(
      calculateRcFilterSI({
        resistance: 1_000,
        capacitance: 0,
        filterType: "low-pass",
      }),
      "capacitance",
      "NON_POSITIVE_VALUE",
    );
    expectError(
      calculateRcFilterSI({
        resistance: -1_000,
        capacitance: -1e-6,
        filterType: "high-pass",
      }),
      "resistance",
      "NON_POSITIVE_VALUE",
    );
    expectError(
      calculateRcFilterSI({
        resistance: -1_000,
        capacitance: -1e-6,
        filterType: "high-pass",
      }),
      "capacitance",
      "NON_POSITIVE_VALUE",
    );
  });

  it("rejects empty, invalid, non-finite, and unsupported input", () => {
    expectError(
      calculateRcFilter({
        resistance: { value: "", unit: "Ω" },
        capacitance: { value: 100, unit: "nF" },
        filterType: "low-pass",
      }),
      "resistance",
      "EMPTY_VALUE",
    );
    expectError(
      calculateRcFilter({
        resistance: { value: "not-a-number", unit: "Ω" },
        capacitance: { value: 100, unit: "nF" },
        filterType: "low-pass",
      }),
      "resistance",
      "INVALID_NUMBER",
    );
    expectError(
      calculateRcFilterSI({
        resistance: Number.POSITIVE_INFINITY,
        capacitance: Number.NaN,
        filterType: "low-pass",
      }),
      "resistance",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateRcFilterSI({
        resistance: Number.POSITIVE_INFINITY,
        capacitance: Number.NaN,
        filterType: "low-pass",
      }),
      "capacitance",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateRcFilter({
        resistance: { value: 10, unit: "GΩ" as ResistanceUnit },
        capacitance: { value: 100, unit: "nF" },
        filterType: "low-pass",
      }),
      "resistance",
      "INVALID_UNIT",
    );
    expectError(
      calculateRcFilter({
        resistance: { value: 10, unit: "kΩ" },
        capacitance: { value: 100, unit: "fF" as CapacitanceUnit },
        filterType: "low-pass",
      }),
      "capacitance",
      "INVALID_UNIT",
    );
    expectError(
      calculateRcFilter({
        resistance: { value: 10, unit: "kΩ" },
        capacitance: { value: 100, unit: "nF" },
        filterType: "band-pass" as RcFilterType,
      }),
      "filterType",
      "INVALID_FILTER_TYPE",
    );
  });
});
