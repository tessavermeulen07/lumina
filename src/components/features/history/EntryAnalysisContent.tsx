import type { EntryAnalysis } from "@/types/database";
import { getEntryThemeLabel } from "@/types/entry-analysis";

interface EntryAnalysisContentProps {
  analysis: EntryAnalysis;
  frameReflection?: boolean;
}

const sectionFrameClass =
  "rounded-xl border border-lumina-500/25 bg-lumina-500/5 px-4 py-4";

const whiteTagClass =
  "inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 py-1.5 text-sm text-foreground dark:border-neutral-700 dark:bg-surface";

export function EntryAnalysisContent({
  analysis,
  frameReflection = false,
}: Readonly<EntryAnalysisContentProps>) {
  const reflectionHeader = (
    <>
      <h2 className="font-serif text-2xl text-foreground">{analysis.title}</h2>
      {analysis.reflection_text ? (
        <p className="mt-4 whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground">
          {analysis.reflection_text}
        </p>
      ) : null}
    </>
  );

  return (
    <div className="space-y-8">
      {frameReflection ? (
        <section className={sectionFrameClass}>{reflectionHeader}</section>
      ) : (
        <header>{reflectionHeader}</header>
      )}

      {analysis.key_insight ? (
        <section className={sectionFrameClass}>
          <h3 className="text-sm font-medium text-lumina-700 dark:text-lumina-300">
            Inzicht
          </h3>
          <p className="mt-2 font-serif text-lg leading-relaxed text-lumina-700 dark:text-lumina-300">
            {analysis.key_insight}
          </p>
        </section>
      ) : null}

      {analysis.feelings.length > 0 ? (
        <section className={sectionFrameClass}>
          <h3 className="text-sm font-medium text-lumina-700 dark:text-lumina-300">
            Gevoelens
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {analysis.feelings.map((feeling) => (
              <li className={whiteTagClass} key={feeling.key}>
                <span aria-hidden="true">{feeling.emoji}</span>
                <span>{feeling.label}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {analysis.persons.length > 0 ? (
        <section className={sectionFrameClass}>
          <h3 className="text-sm font-medium text-lumina-700 dark:text-lumina-300">
            Personen
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {analysis.persons.map((person) => (
              <li className={whiteTagClass} key={person.name}>
                {person.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {analysis.themes.length > 0 ? (
        <section className={sectionFrameClass}>
          <h3 className="text-sm font-medium text-lumina-700 dark:text-lumina-300">
            Thema&apos;s
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {analysis.themes.map((theme, index) => {
              const label = getEntryThemeLabel(theme);

              return (
                <li className={whiteTagClass} key={`${label}-${index}`}>
                  {label}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
