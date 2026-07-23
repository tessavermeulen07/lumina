"use client";

import { useState } from "react";
import { useLuminaStream } from "@/hooks/use-lumina-stream";
import {
  hasPersonalizedQuestions,
  type LuminaDashboardQuestion,
} from "@/lib/ai/lumina-dashboard-question";

interface AskLuminaSectionProps {
  questions: LuminaDashboardQuestion[];
}

export function AskLuminaSection({
  questions,
}: Readonly<AskLuminaSectionProps>) {
  const {
    streamLumina,
    streamingText,
    isStreaming,
    error,
    resetStream,
  } = useLuminaStream();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [completedAnswer, setCompletedAnswer] = useState<string | null>(null);

  const activeQuestion = selectedQuestion ?? customQuestion.trim();
  const isPersonalized = hasPersonalizedQuestions(questions);
  const isPending = isStreaming;
  const displayedAnswer = isStreaming ? streamingText : completedAnswer;

  async function handleAsk(question: string) {
    resetStream();
    setCompletedAnswer(null);

    const result = await streamLumina({
      mode: "dashboard",
      question,
    });

    if (result.ok) {
      setCompletedAnswer(result.result.text);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground md:text-xl">Vraag het Lumina</h2>

      <article className="rounded-2xl border border-lumina-500/25 bg-surface p-6">
        <p className="text-muted">
          {isPersonalized
            ? "Stel een vraag over je eerdere entries — of kies een suggestie op basis van wat Lumina al heeft opgemerkt."
            : "Stel een vraag over je eerdere entries en ontdek patronen."}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-2">
          {questions.map((question) => (
            <button
              key={question.id}
              className={`flex h-[4.5rem] w-full items-center rounded-xl border px-4 text-left text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500 ${
                selectedQuestion === question.question_text
                  ? "border-lumina-500 bg-lumina-500/10 text-foreground"
                  : "border-lumina-500/25 bg-background text-muted hover:border-lumina-500 hover:text-foreground"
              }`}
              disabled={isPending}
              onClick={() => {
                setSelectedQuestion(question.question_text);
                setCustomQuestion("");
                void handleAsk(question.question_text);
              }}
              title={question.question_text}
              type="button"
            >
              <span className="line-clamp-2">{question.question_text}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="flex-1 rounded-xl border border-lumina-500/25 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-lumina-500 focus:outline-none focus:ring-2 focus:ring-lumina-100/50"
            disabled={isPending}
            onChange={(event) => {
              setCustomQuestion(event.target.value);
              setSelectedQuestion(null);
            }}
            placeholder="Of stel je eigen vraag…"
            type="text"
            value={customQuestion}
          />
          <button
            className="rounded-xl bg-lumina-500 px-4 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-lumina-700 disabled:opacity-50"
            disabled={isPending || !activeQuestion}
            onClick={() => {
              void handleAsk(activeQuestion);
            }}
            type="button"
          >
            {isPending ? "Bezig…" : "Vraag"}
          </button>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {displayedAnswer ? (
          <div className="mt-4 rounded-xl border border-lumina-500/15 bg-background p-4">
            <p className="text-sm font-medium text-lumina-500">Antwoord</p>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-foreground">
              {displayedAnswer}
              {isStreaming ? (
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-lumina-500 align-text-bottom"
                />
              ) : null}
            </p>
          </div>
        ) : null}
      </article>
    </section>
  );
}
