export const unitDefinitions = {
  voltage: {
    baseUnit: "V",
    displayMinimum: 0.1,
    units: {
      V: 1,
      mV: 1e-3,
    },
  },
  resistance: {
    baseUnit: "Ω",
    displayMinimum: 1,
    units: {
      Ω: 1,
      kΩ: 1e3,
      MΩ: 1e6,
    },
  },
  current: {
    baseUnit: "A",
    displayMinimum: 0.1,
    units: {
      A: 1,
      mA: 1e-3,
      µA: 1e-6,
    },
  },
  power: {
    baseUnit: "W",
    displayMinimum: 0.1,
    units: {
      W: 1,
      mW: 1e-3,
      µW: 1e-6,
    },
  },
  capacitance: {
    baseUnit: "F",
    displayMinimum: 1,
    units: {
      F: 1,
      mF: 1e-3,
      µF: 1e-6,
      nF: 1e-9,
      pF: 1e-12,
    },
  },
  inductance: {
    baseUnit: "H",
    displayMinimum: 1,
    units: {
      H: 1,
      mH: 1e-3,
      µH: 1e-6,
      nH: 1e-9,
    },
  },
  frequency: {
    baseUnit: "Hz",
    displayMinimum: 1,
    units: {
      Hz: 1,
      kHz: 1e3,
      MHz: 1e6,
    },
  },
  time: {
    baseUnit: "s",
    displayMinimum: 1,
    units: {
      s: 1,
      ms: 1e-3,
      µs: 1e-6,
      ns: 1e-9,
    },
  },
} as const;

export type UnitDefinitions = typeof unitDefinitions;
export type Quantity = keyof UnitDefinitions;
export type UnitFor<Q extends Quantity> = keyof UnitDefinitions[Q]["units"] & string;
export type VoltageUnit = UnitFor<"voltage">;
export type ResistanceUnit = UnitFor<"resistance">;
export type CurrentUnit = UnitFor<"current">;
export type PowerUnit = UnitFor<"power">;
export type CapacitanceUnit = UnitFor<"capacitance">;
export type InductanceUnit = UnitFor<"inductance">;
export type FrequencyUnit = UnitFor<"frequency">;
export type TimeUnit = UnitFor<"time">;

export const voltageUnits = Object.keys(unitDefinitions.voltage.units) as VoltageUnit[];
export const resistanceUnits = Object.keys(
  unitDefinitions.resistance.units,
) as ResistanceUnit[];
export const currentUnits = Object.keys(unitDefinitions.current.units) as CurrentUnit[];
export const powerUnits = Object.keys(unitDefinitions.power.units) as PowerUnit[];
export const capacitanceUnits = Object.keys(
  unitDefinitions.capacitance.units,
) as CapacitanceUnit[];
export const inductanceUnits = Object.keys(
  unitDefinitions.inductance.units,
) as InductanceUnit[];
export const frequencyUnits = Object.keys(
  unitDefinitions.frequency.units,
) as FrequencyUnit[];
export const timeUnits = Object.keys(unitDefinitions.time.units) as TimeUnit[];
