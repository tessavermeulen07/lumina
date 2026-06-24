-- Entry-bound AI responses (toolbar actions while writing)

CREATE TABLE public.entry_ai_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id uuid NOT NULL REFERENCES public.entries (id) ON DELETE CASCADE,
    action text NOT NULL,
    response_text text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX entry_ai_responses_entry_id_created_at_idx
    ON public.entry_ai_responses (entry_id, created_at ASC);

ALTER TABLE public.entry_ai_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entry ai responses"
    ON public.entry_ai_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.entries
            WHERE entries.id = entry_ai_responses.entry_id
              AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own entry ai responses"
    ON public.entry_ai_responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.entries
            WHERE entries.id = entry_ai_responses.entry_id
              AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own entry ai responses"
    ON public.entry_ai_responses FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.entries
            WHERE entries.id = entry_ai_responses.entry_id
              AND entries.user_id = auth.uid()
        )
    );

GRANT SELECT, INSERT, DELETE ON public.entry_ai_responses TO authenticated;
