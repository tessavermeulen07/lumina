import {
  insightsCardClass,
  insightsHeadingClass,
  insightsPrimaryThemeClass,
  insightsTagClass,
} from "@/components/features/insights/insights-styles";
import type { ThemeWithCount } from "@/lib/insights/get-weekly-insights";

interface ThemesGridProps {
  primaryTheme: ThemeWithCount | null;
  subThemes: ThemeWithCount[];
}

export function ThemesGrid({
  primaryTheme,
  subThemes,
}: Readonly<ThemesGridProps>) {
  if (!primaryTheme && subThemes.length === 0) {
    return null;
  }

  return (
    <section className={insightsCardClass}>
      <h2 className={insightsHeadingClass}>Thema&apos;s</h2>

      {primaryTheme ? (
        <p className={`mt-4 ${insightsPrimaryThemeClass}`}>
          {primaryTheme.name}
        </p>
      ) : null}

      {subThemes.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {subThemes.map((theme) => (
            <li className={insightsTagClass} key={theme.name}>
              {theme.name}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
