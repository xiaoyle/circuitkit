import { describe, expect, it } from "vitest";

import {
  findNearestStandardResistor,
  type ResistorSeries,
} from "./resistor-series";

describe("standard resistor series", () => {
  it("recommends 330 Ω for a 300 Ω E12 target", () => {
    expect(findNearestStandardResistor(300, "E12")).toBe(330);
  });

  it("finds the exact 300 Ω value in E24", () => {
    expect(findNearestStandardResistor(300, "E24")).toBe(300);
  });

  it("supports very small and very large resistances", () => {
    expect(findNearestStandardResistor(0.33, "E12")).toBeCloseTo(0.33, 12);
    expect(findNearestStandardResistor(3_300_000, "E12")).toBe(3_300_000);
  });

  it("searches across decade boundaries", () => {
    expect(findNearestStandardResistor(960, "E24")).toBe(1_000);
  });

  it("prefers the larger resistor when distances tie", () => {
    expect(findNearestStandardResistor(955, "E24")).toBe(1_000);
  });

  it("rejects invalid targets and unsupported series", () => {
    for (const target of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => findNearestStandardResistor(target, "E12")).toThrow(RangeError);
    }

    expect(() =>
      findNearestStandardResistor(300, "E48" as ResistorSeries),
    ).toThrow("Unsupported resistor series");
  });
});
