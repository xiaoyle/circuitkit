import {
  Activity,
  AudioWaveform,
  GitFork,
  Radio,
  Triangle,
} from "lucide-react";

import type { ToolDefinition } from "@/lib/tools";

const iconMap = {
  split: GitFork,
  led: Radio,
  filter: AudioWaveform,
  amplifier: Triangle,
  resonance: Activity,
};

export function ToolIcon({ icon }: Pick<ToolDefinition, "icon">) {
  const Icon = iconMap[icon];
  return <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />;
}
