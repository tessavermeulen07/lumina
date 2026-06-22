import { getWordChartAxis } from "@/lib/insights/chart-axis";
import type { WordsPerDay } from "@/lib/insights/get-weekly-insights";

interface WordsPerDayChartProps {
  data: WordsPerDay[];
}

const CHART_HEIGHT_PX = 128;

function formatTick(value: number): string {
  return value.toLocaleString("nl-NL");
}

function YAxisLabels({ ticks }: Readonly<{ ticks: number[] }>) {
  const orderedTicks = [...ticks].reverse();

  return (
    <div
      className="flex w-8 shrink-0 flex-col justify-between text-right text-xs text-muted"
      style={{ height: `${CHART_HEIGHT_PX}px` }}
    >
      {orderedTicks.map((tick) => (
        <span key={tick}>{formatTick(tick)}</span>
      ))}
    </div>
  );
}

export function WordsPerDayChart({ data }: Readonly<WordsPerDayChartProps>) {
  const dataMax = Math.max(...data.map((day) => day.wordCount), 0);
  const { axisMax, ticks } = getWordChartAxis(dataMax);

  return (
    <div className="mt-5 flex items-start gap-2">
      <YAxisLabels ticks={ticks} />

      <div className="min-w-0 flex-1">
        <div
          className="flex items-end justify-between gap-1 sm:gap-2"
          style={{ height: `${CHART_HEIGHT_PX}px` }}
        >
          {data.map((day) => {
            const heightPercent =
              day.wordCount > 0
                ? Math.max((day.wordCount / axisMax) * 100, 4)
                : 0;

            return (
              <div
                className="flex h-full flex-1 items-end justify-center"
                key={day.date}
              >
                <div
                  className="w-full max-w-8 rounded-t-md bg-lumina-500 transition-all"
                  style={{ height: `${heightPercent}%` }}
                  title={`${day.wordCount} woorden`}
                />
              </div>
            );
          })}
        </div>

        <div
          aria-hidden="true"
          className="border-t border-neutral-300 dark:border-neutral-600"
        />

        <div className="mt-3 flex justify-between gap-1 sm:gap-2">
          {data.map((day) => (
            <span
              className="flex-1 text-center text-xs text-muted"
              key={`${day.date}-label`}
            >
              {day.label}
            </span>
          ))}
        </div>
      </div>

      <div
        className="flex w-8 shrink-0 flex-col justify-between text-left text-xs text-muted"
        style={{ height: `${CHART_HEIGHT_PX}px` }}
      >
        {[...ticks].reverse().map((tick) => (
          <span key={tick}>{formatTick(tick)}</span>
        ))}
      </div>
    </div>
  );
}
