import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalculatorShell } from "@/components/calculator-shell";
import { LedResistorCalculator } from "@/components/calculators/led-resistor-calculator";
import { OpAmpGainCalculator } from "@/components/calculators/op-amp-gain-calculator";
import { RcFilterCalculator } from "@/components/calculators/rc-filter-calculator";
import { RlcResonanceCalculator } from "@/components/calculators/rlc-resonance-calculator";
import { VoltageDividerCalculator } from "@/components/calculators/voltage-divider-calculator";
import { getTool, toolSlugs } from "@/lib/tools";

type CalculatorPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return toolSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CalculatorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    return { title: "Calculator not found" };
  }

  return {
    title: tool.name,
    description: tool.description,
  };
}

export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

  const calculator =
    tool.slug === "voltage-divider" ? (
      <VoltageDividerCalculator />
    ) : tool.slug === "led-resistor" ? (
      <LedResistorCalculator />
    ) : tool.slug === "rc-filter" ? (
      <RcFilterCalculator />
    ) : tool.slug === "op-amp-gain" ? (
      <OpAmpGainCalculator />
    ) : tool.slug === "rlc-resonance" ? (
      <RlcResonanceCalculator />
    ) : undefined;

  return <CalculatorShell tool={tool}>{calculator}</CalculatorShell>;
}
