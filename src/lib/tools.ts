export const toolSlugs = [
  "voltage-divider",
  "led-resistor",
  "rc-filter",
  "op-amp-gain",
  "rlc-resonance",
] as const;

export type ToolSlug = (typeof toolSlugs)[number];

export type ToolDefinition = {
  slug: ToolSlug;
  index: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  inputs: string[];
  output: string;
  formula: string;
  note: string;
  icon: "split" | "led" | "filter" | "amplifier" | "resonance";
};

export const tools: ToolDefinition[] = [
  {
    slug: "voltage-divider",
    index: "01",
    name: "Voltage Divider Calculator",
    shortName: "Voltage Divider",
    description:
      "Find the unloaded output voltage across the lower resistor in a two-resistor divider.",
    category: "DC circuits",
    inputs: ["Input voltage (Vin)", "Upper resistance (R1)", "Lower resistance (R2)"],
    output: "Output voltage (Vout)",
    formula: "Vout = Vin × R2 / (R1 + R2)",
    note: "Voltage dividers are suitable for signal scaling and high-impedance inputs. They should generally not be used to directly power a load.",
    icon: "split",
  },
  {
    slug: "led-resistor",
    index: "02",
    name: "LED Resistor Calculator",
    shortName: "LED Resistor",
    description:
      "Size a series resistor for an LED and estimate the power the resistor must dissipate.",
    category: "Components",
    inputs: ["Supply voltage", "LED forward voltage", "Target LED current"],
    output: "Resistance and resistor power",
    formula: "R = (Vs − Vf) / I",
    note: "The calculated resistance is a theoretical target. Choose a nearby standard value and a sufficient resistor power rating.",
    icon: "led",
  },
  {
    slug: "rc-filter",
    index: "03",
    name: "RC Filter Calculator",
    shortName: "RC Filter",
    description:
      "Calculate the cutoff frequency of a first-order RC low-pass or high-pass filter.",
    category: "Signals",
    inputs: ["Resistance (R)", "Capacitance (C)", "Filter type"],
    output: "Cutoff frequency (fc)",
    formula: "fc = 1 / (2πRC)",
    note: "At the cutoff frequency, the magnitude is approximately 0.707 of the passband value (−3 dB).",
    icon: "filter",
  },
  {
    slug: "op-amp-gain",
    index: "04",
    name: "Op-Amp Gain Calculator",
    shortName: "Op-Amp Gain",
    description:
      "Calculate ideal closed-loop gain for inverting and non-inverting amplifier configurations.",
    category: "Analog",
    inputs: [
      "Amplifier configuration",
      "Feedback resistance (Rf)",
      "Gain or input resistance",
      "Optional input voltage (Vin)",
    ],
    output: "Closed-loop gain and ideal output voltage",
    formula: "Av = 1 + Rf / Rg  or  Av = −Rf / Rin",
    note: "The ideal gain equation does not include bandwidth, slew rate, input limits, or output swing.",
    icon: "amplifier",
  },
  {
    slug: "rlc-resonance",
    index: "05",
    name: "RLC Resonance Calculator",
    shortName: "RLC Resonance",
    description:
      "Find the ideal resonant frequency set by an inductor and capacitor.",
    category: "Resonance",
    inputs: ["Inductance (L)", "Capacitance (C)"],
    output: "Resonant frequency (f₀)",
    formula: "f₀ = 1 / (2π√LC)",
    note: "Real component resistance and parasitics affect the resonant peak and quality factor.",
    icon: "resonance",
  },
];

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
