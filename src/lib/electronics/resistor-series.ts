export const resistorSeriesValues = {
  E12: [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82],
  E24: [
    10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51,
    56, 62, 68, 75, 82, 91,
  ],
} as const;

export type ResistorSeries = keyof typeof resistorSeriesValues;

export const resistorSeries = Object.keys(
  resistorSeriesValues,
) as ResistorSeries[];

function isResistorSeries(series: unknown): series is ResistorSeries {
  return typeof series === "string" && series in resistorSeriesValues;
}

/**
 * Finds the closest nominal resistance in an IEC-style E-series across decades.
 * If two values are equally close, the larger resistor wins to reduce LED current.
 */
export function findNearestStandardResistor(
  targetResistance: number,
  series: ResistorSeries,
): number {
  if (!Number.isFinite(targetResistance) || targetResistance <= 0) {
    throw new RangeError("Target resistance must be a finite number greater than zero.");
  }

  if (!isResistorSeries(series)) {
    throw new RangeError(`Unsupported resistor series: ${String(series)}`);
  }

  const values = resistorSeriesValues[series];
  const targetDecade = Math.floor(Math.log10(targetResistance)) - 1;
  const candidates: number[] = [];

  for (let offset = -1; offset <= 1; offset += 1) {
    const multiplier = 10 ** (targetDecade + offset);

    for (const nominalValue of values) {
      const candidate = nominalValue * multiplier;

      if (Number.isFinite(candidate) && candidate > 0) {
        candidates.push(candidate);
      }
    }
  }

  if (candidates.length === 0) {
    throw new RangeError("Target resistance is outside the supported numeric range.");
  }

  return candidates.reduce((nearest, candidate) => {
    const nearestDistance = Math.abs(nearest - targetResistance);
    const candidateDistance = Math.abs(candidate - targetResistance);
    const tolerance =
      Number.EPSILON *
      Math.max(targetResistance, Math.abs(nearest), Math.abs(candidate)) *
      8;

    if (candidateDistance < nearestDistance - tolerance) {
      return candidate;
    }

    if (
      Math.abs(candidateDistance - nearestDistance) <= tolerance &&
      candidate > nearest
    ) {
      return candidate;
    }

    return nearest;
  });
}
