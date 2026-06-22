function niceCeil(value: number): number {
  if (value <= 0) return 10;

  const exponent = Math.floor(Math.log10(value));
  const magnitude = 10 ** exponent;
  const fraction = value / magnitude;

  if (fraction <= 1) return magnitude;
  if (fraction <= 2) return 2 * magnitude;
  if (fraction <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function getWordChartAxis(maxWordCount: number): {
  axisMax: number;
  ticks: number[];
} {
  const axisMax = niceCeil(maxWordCount);
  const stepCount = 4;
  const step = axisMax / stepCount;
  const ticks = Array.from({ length: stepCount + 1 }, (_, index) =>
    Math.round(index * step),
  );

  return { axisMax, ticks };
}
