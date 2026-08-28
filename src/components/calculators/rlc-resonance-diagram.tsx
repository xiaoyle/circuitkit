const lineProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2,
  vectorEffect: "non-scaling-stroke" as const,
};

function Ground({ x, y }: { x: number; y: number }) {
  return (
    <g {...lineProps}>
      <path d={`M ${x} ${y - 18} V ${y}`} />
      <path d={`M ${x - 18} ${y} H ${x + 18}`} />
      <path d={`M ${x - 11} ${y + 8} H ${x + 11}`} />
      <path d={`M ${x - 5} ${y + 16} H ${x + 5}`} />
    </g>
  );
}

function Resistor({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const lead = 14;
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

export function RlcResonanceDiagram() {
  return (
    <svg
      viewBox="0 0 600 290"
      role="img"
      aria-labelledby="rlc-diagram-title rlc-diagram-description"
      className="h-auto w-full text-ink"
    >
      <title id="rlc-diagram-title">Simplified RLC resonance network</title>
      <desc id="rlc-diagram-description">
        An excitation signal passes through a small loss resistance and an inductor
        before reaching a capacitor connected to ground. L and C set the ideal natural
        frequency, while R represents real circuit loss.
      </desc>

      <path d="M 44 108 H 92" className="text-accent" {...lineProps} />
      <path d="M 80 100 L 92 108 L 80 116" className="text-accent" {...lineProps} />
      <text x="44" y="140" className="fill-current font-mono text-[18px] font-semibold">
        Excitation
      </text>

      <g className="text-muted-ink">
        <Resistor x1={92} x2={218} y={108} />
        <text x="155" y="80" textAnchor="middle" className="fill-current font-mono text-[17px]">
          R (loss)
        </text>
      </g>

      <path d="M 218 108 H 244" className="text-accent" {...lineProps} />
      <path
        d="M 244 108 C 244 82, 278 82, 278 108 C 278 82, 312 82, 312 108 C 312 82, 346 82, 346 108 C 346 82, 380 82, 380 108"
        className="text-accent"
        {...lineProps}
      />
      <path d="M 380 108 H 470" className="text-accent" {...lineProps} />
      <text x="312" y="49" textAnchor="middle" className="fill-current font-mono text-[20px] font-semibold">
        L
      </text>
      <text x="312" y="72" textAnchor="middle" className="fill-current text-[17px] text-muted-ink">
        magnetic energy
      </text>

      <circle cx="470" cy="108" r="4" className="fill-accent" />
      <path d="M 470 108 V 164" className="text-accent" {...lineProps} />
      <path d="M 440 164 H 500" {...lineProps} />
      <path d="M 440 182 H 500" {...lineProps} />
      <path d="M 470 182 V 236" {...lineProps} />
      <Ground x={470} y={254} />
      <text x="520" y="178" className="fill-current font-mono text-[20px] font-semibold">
        C
      </text>
      <text x="585" y="203" textAnchor="end" className="fill-current text-[17px] text-muted-ink">
        electric energy
      </text>
      <text x="497" y="273" className="fill-current font-mono text-[17px] text-muted-ink">
        GND
      </text>

      <path d="M 430 126 C 402 150, 402 190, 430 214" className="text-muted-ink" {...lineProps} strokeDasharray="5 7" />
      <path d="M 422 204 L 430 214 L 417 215" className="text-muted-ink" {...lineProps} />
      <text x="326" y="184" className="fill-current text-[17px] text-muted-ink">
        energy exchange
      </text>
    </svg>
  );
}
