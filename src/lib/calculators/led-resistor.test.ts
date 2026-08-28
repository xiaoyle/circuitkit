import { describe, expect, it } from "vitest";

import type { CurrentUnit } from "../units";
import {
  calculateLedResistor,
  calculateLedResistorSI,
  type LedResistorField,
  type LedResistorResult,
} from "./led-resistor";

function expectError(result: LedResistorResult, field: LedResistorField, code: string) {
  expect(result.ok).toBe(false);

  if (!result.ok) {
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field, code })]),
    );
  }
}

describe("LED resistor calculation", () => {
  it("calculates the reference 5 V, 2 V, 10 mA circuit", () => {
    const result = calculateLedResistor({
      supplyVoltage: { value: 5, unit: "V" },
      forwardVoltage: { value: 2, unit: "V" },
      ledCurrent: { value: 10, unit: "mA" },
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.inputSI).toEqual({
        supplyVoltage: 5,
        forwardVoltage: 2,
        ledCurrent: 0.01,
      });
      expect(result.resistorVoltage).toBeCloseTo(3, 12);
      expect(result.requiredResistance).toBeCloseTo(300, 12);
      expect(result.resistorPower).toBeCloseTo(0.03, 12);
      expect(result.resistorPower).toBeCloseTo(
        result.inputSI.ledCurrent ** 2 * result.requiredResistance,
        12,
      );
      expect(result.resistorPower).toBeCloseTo(
        result.resistorVoltage * result.inputSI.ledCurrent,
        12,
      );
      expect(result.resistorSeries).toBe("E12");
      expect(result.recommendedResistance).toBe(330);
      expect(result.actualLedCurrent).toBeCloseTo(3 / 330, 12);
      expect(result.currentDeviationPercent).toBeCloseTo(-9.090909, 6);
    }
  });

  it("uses the selected E24 series for its recommendation", () => {
    const result = calculateLedResistor(
      {
        supplyVoltage: { value: 5, unit: "V" },
        forwardVoltage: { value: 2, unit: "V" },
        ledCurrent: { value: 10, unit: "mA" },
      },
      "E24",
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.resistorSeries).toBe("E24");
      expect(result.recommendedResistance).toBe(300);
      expect(result.actualLedCurrent).toBeCloseTo(0.01, 12);
      expect(result.currentDeviationPercent).toBeCloseTo(0, 12);
    }
  });

  it("calculates a 20 mA LED current", () => {
    const result = calculateLedResistor({
      supplyVoltage: { value: 5, unit: "V" },
      forwardVoltage: { value: 2, unit: "V" },
      ledCurrent: { value: 20, unit: "mA" },
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.requiredResistance).toBeCloseTo(150, 12);
      expect(result.resistorPower).toBeCloseTo(0.06, 12);
    }
  });

  it("accepts millivolt input", () => {
    const result = calculateLedResistor({
      supplyVoltage: { value: 5_000, unit: "mV" },
      forwardVoltage: { value: 2_000, unit: "mV" },
      ledCurrent: { value: 10, unit: "mA" },
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.requiredResistance).toBeCloseTo(300, 12);
      expect(result.resistorPower).toBeCloseTo(0.03, 12);
    }
  });

  it("accepts microamp input", () => {
    const result = calculateLedResistor({
      supplyVoltage: { value: 5, unit: "V" },
      forwardVoltage: { value: 2, unit: "V" },
      ledCurrent: { value: 500, unit: "µA" },
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.requiredResistance).toBeCloseTo(6_000, 12);
      expect(result.resistorPower).toBeCloseTo(0.0015, 12);
    }
  });

  it("rejects supply voltage at or below forward voltage", () => {
    for (const supplyVoltage of [2, 1.5]) {
      const result = calculateLedResistor({
        supplyVoltage: { value: supplyVoltage, unit: "V" },
        forwardVoltage: { value: 2, unit: "V" },
        ledCurrent: { value: 10, unit: "mA" },
      });

      expectError(result, "supplyVoltage", "INSUFFICIENT_SUPPLY_VOLTAGE");

      if (!result.ok) {
        expect(result.errors[0]?.message).toBe(
          "Supply voltage must be greater than the LED forward voltage.",
        );
      }
    }
  });

  it("rejects zero current and negative values", () => {
    expectError(
      calculateLedResistorSI({
        supplyVoltage: 5,
        forwardVoltage: 2,
        ledCurrent: 0,
      }),
      "ledCurrent",
      "NON_POSITIVE_CURRENT",
    );
    expectError(
      calculateLedResistorSI({
        supplyVoltage: -5,
        forwardVoltage: -2,
        ledCurrent: -0.01,
      }),
      "supplyVoltage",
      "NEGATIVE_VOLTAGE",
    );
    expectError(
      calculateLedResistorSI({
        supplyVoltage: -5,
        forwardVoltage: -2,
        ledCurrent: -0.01,
      }),
      "forwardVoltage",
      "NEGATIVE_VOLTAGE",
    );
    expectError(
      calculateLedResistorSI({
        supplyVoltage: -5,
        forwardVoltage: -2,
        ledCurrent: -0.01,
      }),
      "ledCurrent",
      "NON_POSITIVE_CURRENT",
    );
  });

  it("rejects non-numeric, non-finite, and unsupported unit input", () => {
    expectError(
      calculateLedResistor({
        supplyVoltage: { value: "not-a-number", unit: "V" },
        forwardVoltage: { value: 2, unit: "V" },
        ledCurrent: { value: 10, unit: "mA" },
      }),
      "supplyVoltage",
      "INVALID_NUMBER",
    );
    expectError(
      calculateLedResistorSI({
        supplyVoltage: Number.POSITIVE_INFINITY,
        forwardVoltage: 2,
        ledCurrent: Number.NaN,
      }),
      "supplyVoltage",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateLedResistorSI({
        supplyVoltage: Number.POSITIVE_INFINITY,
        forwardVoltage: 2,
        ledCurrent: Number.NaN,
      }),
      "ledCurrent",
      "NON_FINITE_VALUE",
    );
    expectError(
      calculateLedResistor({
        supplyVoltage: { value: 5, unit: "V" },
        forwardVoltage: { value: 2, unit: "V" },
        ledCurrent: { value: 10, unit: "kA" as CurrentUnit },
      }),
      "ledCurrent",
      "INVALID_UNIT",
    );
  });
});
