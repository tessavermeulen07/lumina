"use client";

import { useState } from "react";
import { aiPlaceholderMessage, sampleQuestions } from "@/lib/mock/dashboard";

export function AskLuminaSection() {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Vraag het Lumina</h2>

      <article className="rounded-2xl border border-lumina-500/25 bg-surface p-6">
        <p className="text-muted">
          Stel een vraag over je eerdere entries en ontdek patronen.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {sampleQuestions.map((question) => (
            <button
              key={question}
              className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lumina-500 ${
                selectedQuestion === question
                  ? "border-lumina-500 bg-lumina-500/10 text-foreground"
                  : "border-lumina-500/25 bg-background text-muted hover:border-lumina-500 hover:text-foreground"
              }`}
              onClick={() => setSelectedQuestion(question)}
              type="button"
            >
              {question}
            </button>
          ))}
        </div>

        {selectedQuestion ? (
          <div className="mt-4 rounded-xl border border-lumina-500/15 bg-background p-4">
            <p className="text-sm font-medium text-lumina-500">Jouw vraag</p>
            <p className="mt-2 text-foreground">{selectedQuestion}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {aiPlaceholderMessage}
            </p>
          </div>
        ) : null}
      </article>
    </section>
  );
}
