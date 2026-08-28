import { describe, expect, it } from "vitest";

import { formatEngineering, parseToSI, toSI } from "./index";

describe("engineering unit conversion", () => {
  it("converts resistance prefixes to ohms", () => {
    expect(toSI("resistance", 10, "kΩ")).toBe(10_000);
    expect(toSI("resistance", 1, "MΩ")).toBe(1_000_000);
  });

  it("converts millivolts to volts", () => {
    expect(toSI("voltage", 100, "mV")).toBeCloseTo(0.1, 12);
  });

  it("converts capacitance prefixes to farads", () => {
    expect(toSI("capacitance", 1, "F")).toBe(1);
    expect(toSI("capacitance", 1, "mF")).toBeCloseTo(1e-3, 15);
    expect(toSI("capacitance", 1, "µF")).toBeCloseTo(1e-6, 18);
    expect(toSI("capacitance", 100, "nF")).toBeCloseTo(1e-7, 18);
    expect(toSI("capacitance", 1, "pF")).toBeCloseTo(1e-12, 24);
  });

  it("converts inductance prefixes to henries", () => {
    expect(toSI("inductance", 1, "H")).toBe(1);
    expect(toSI("inductance", 10, "mH")).toBeCloseTo(0.01, 15);
    expect(toSI("inductance", 100, "µH")).toBeCloseTo(0.0001, 18);
    expect(toSI("inductance", 1, "nH")).toBeCloseTo(1e-9, 21);
  });

  it("converts frequency prefixes to hertz", () => {
    expect(toSI("frequency", 2.5, "kHz")).toBe(2_500);
    expect(toSI("frequency", 1, "MHz")).toBe(1_000_000);
  });

  it("rejects empty, non-numeric, non-finite, and unsupported input", () => {
    expect(parseToSI("voltage", "", "V")).toMatchObject({
      ok: false,
      error: { code: "EMPTY_VALUE" },
    });
    expect(parseToSI("voltage", Number.NaN, "V")).toMatchObject({
      ok: false,
      error: { code: "INVALID_NUMBER" },
    });
    expect(parseToSI("voltage", Number.POSITIVE_INFINITY, "V")).toMatchObject({
      ok: false,
      error: { code: "NON_FINITE_VALUE" },
    });
    expect(parseToSI("voltage", 5, "kV")).toMatchObject({
      ok: false,
      error: { code: "INVALID_UNIT" },
    });
  });

  it("formats engineering results without false precision", () => {
    expect(formatEngineering("voltage", 10 / 3).text).toBe("3.33 V");
    expect(formatEngineering("current", 1 / 6_000).text).toBe("0.167 mA");
    expect(formatEngineering("resistance", 300).text).toBe("300 Ω");
    expect(formatEngineering("resistance", 10_000).text).toBe("10 kΩ");
    expect(formatEngineering("power", 0.02).text).toBe("20 mW");
    expect(formatEngineering("frequency", 159.1549).text).toBe("159 Hz");
    expect(formatEngineering("frequency", 2_500).text).toBe("2.5 kHz");
    expect(formatEngineering("frequency", 2_500_000).text).toBe("2.5 MHz");
    expect(formatEngineering("frequency", 5_032.92121).text).toBe("5.03 kHz");
    expect(formatEngineering("time", 0.001).text).toBe("1 ms");
    expect(formatEngineering("inductance", 0.01).text).toBe("10 mH");
  });
});
