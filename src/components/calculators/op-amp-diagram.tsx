import type { OpAmpMode } from "@/lib/calculators/op-amp-gain";

type OpAmpDiagramProps = {
  mode: OpAmpMode;
};

const lineProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2,
  vectorEffect: "non-scaling-stroke" as const,
};

function Resistor({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const lead = 16;
  const segment = (x2 - x1 - lead * 2) / 6;
  const points = [
    `${x1},${y}`,
    `${x1 + lead},${y}`,
    `${x1 + lead + segment},${y - 9}`,
    `${x1 + lead + segment * 2},${y + 9}`,
    `${x1 + lead + segment * 3},${y - 9}`,
    `${x1 + lead + segment * 4},${y + 9}`,
    `${x1 + lead + segment * 5},${y - 9}`,
    `${x2 - lead},${y}`,
    `${x2},${y}`,
  ].join(" ");

  return <polyline points={points} {...lineProps} />;
}

function Ground({ x, y }: { x: number; y: number }) {
  return (
    <g {...lineProps}>
      <path d={`M ${x} ${y - 18} V ${y}`} />
      <path d={`M ${x - 15} ${y} H ${x + 15}`} />
      <path d={`M ${x - 10} ${y + 7} H ${x + 10}`} />
      <path d={`M ${x - 5} ${y + 14} H ${x + 5}`} />
    </g>
  );
}

export function OpAmpDiagram({ mode }: OpAmpDiagramProps) {
  const nonInverting = mode === "non-inverting";
  const titleId = `op-amp-${mode}-title`;
  const descriptionId = `op-amp-${mode}-description`;

  return (
    <svg
      viewBox="0 0 600 300"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
      className="h-auto w-full text-ink"
    >
      <title id={titleId}>
        {nonInverting ? "Non-inverting op-amp circuit" : "Inverting op-amp circuit"}
      </title>
      <desc id={descriptionId}>
        {nonInverting
          ? "Vin connects to the positive input. Rf feeds the output back to the negative input, and Rg connects that node to ground."
          : "Vin reaches the negative input through Rin. Rf feeds the output back to the same node, while the positive input connects to ground."}
      </desc>

      <path d="M 280 82 L 280 218 L 430 150 Z" {...lineProps} fill="var(--color-accent-soft)" />
      <text x="302" y="124" className="fill-current font-mono text-[18px] font-semibold">
        −
      </text>
      <text x="302" y="190" className="fill-current font-mono text-[18px] font-semibold">
        +
      </text>
      <path d="M 430 150 H 555" className="text-accent" {...lineProps} />
      <circle cx="430" cy="150" r="4" className="fill-accent" />
      <text x="510" y="136" className="fill-current font-mono text-[15px] font-semibold">
        Vout
      </text>

      {nonInverting ? (
        <>
          <path d="M 50 184 H 280" className="text-accent" {...lineProps} />
          <circle cx="280" cy="184" r="4" className="fill-accent" />
          <text x="48" y="169" className="fill-current font-mono text-[15px] font-semibold">
            Vin
          </text>

          <path d="M 280 116 H 232 V 48 H 308" {...lineProps} />
          <Resistor x1={308} x2={440} y={48} />
          <path d="M 440 48 H 500 V 150" {...lineProps} />
          <circle cx="232" cy="116" r="4" className="fill-ink" />
          <text x="359" y="31" textAnchor="middle" className="fill-current font-mono text-[14px] font-semibold">
            Rf
          </text>

          <path d="M 232 116 V 158" {...lineProps} />
          <g transform="rotate(90 232 208)">
            <Resistor x1={182} x2={282} y={208} />
          </g>
          <path d="M 232 258 V 268" {...lineProps} />
          <Ground x={232} y={268} />
          <text x="251" y="214" className="fill-current font-mono text-[14px] font-semibold">
            Rg
          </text>
          <text x="251" y="286" className="fill-current font-mono text-[13px] text-muted-ink">
            GND
          </text>
        </>
      ) : (
        <>
          <path d="M 45 116 H 80" className="text-accent" {...lineProps} />
          <Resistor x1={80} x2={220} y={116} />
          <path d="M 220 116 H 280" className="text-accent" {...lineProps} />
          <circle cx="220" cy="116" r="4" className="fill-accent" />
          <text x="43" y="101" className="fill-current font-mono text-[15px] font-semibold">
            Vin
          </text>
          <text x="150" y="98" textAnchor="middle" className="fill-current font-mono text-[14px] font-semibold">
            Rin
          </text>

          <path d="M 220 116 V 48 H 308" {...lineProps} />
          <Resistor x1={308} x2={440} y={48} />
          <path d="M 440 48 H 500 V 150" {...lineProps} />
          <text x="374" y="31" textAnchor="middle" className="fill-current font-mono text-[14px] font-semibold">
            Rf
          </text>

          <path d="M 280 184 H 245 V 242" {...lineProps} />
          <Ground x={245} y={260} />
          <text x="264" y="278" className="fill-current font-mono text-[13px] text-muted-ink">
            GND
          </text>
        </>
      )}
    </svg>
  );
}
