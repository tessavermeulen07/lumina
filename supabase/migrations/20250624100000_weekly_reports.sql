-- AI-generated weekly insight reports

CREATE TABLE public.weekly_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    week_start date NOT NULL,
    analysis_level smallint NOT NULL CHECK (analysis_level BETWEEN 1 AND 5),
    headline text NOT NULL,
    sections jsonb NOT NULL DEFAULT '[]',
    total_words int NOT NULL DEFAULT 0,
    generated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, week_start)
);

CREATE INDEX weekly_reports_user_id_week_start_idx
    ON public.weekly_reports (user_id, week_start DESC);

ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly reports"
    ON public.weekly_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reports"
    ON public.weekly_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reports"
    ON public.weekly_reports FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.weekly_reports TO authenticated;
