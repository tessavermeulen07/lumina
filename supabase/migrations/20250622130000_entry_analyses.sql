-- AI-generated analysis per finalized entry

CREATE TABLE public.entry_analyses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id uuid NOT NULL UNIQUE REFERENCES public.entries (id) ON DELETE CASCADE,
    title text NOT NULL,
    summary text NOT NULL,
    reflection_text text NOT NULL,
    key_insight text NOT NULL,
    feelings jsonb NOT NULL DEFAULT '[]',
    persons jsonb NOT NULL DEFAULT '[]',
    themes jsonb NOT NULL DEFAULT '[]',
    word_count int NOT NULL DEFAULT 0,
    emotion_scores jsonb,
    analyzed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX entry_analyses_entry_id_idx ON public.entry_analyses (entry_id);

ALTER TABLE public.entry_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entry analyses"
    ON public.entry_analyses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = entry_analyses.entry_id
              AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own entry analyses"
    ON public.entry_analyses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = entry_analyses.entry_id
              AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own entry analyses"
    ON public.entry_analyses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = entry_analyses.entry_id
              AND entries.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = entry_analyses.entry_id
              AND entries.user_id = auth.uid()
        )
    );

GRANT SELECT, INSERT, UPDATE ON public.entry_analyses TO authenticated;
