-- Daily reflection: check-in periods on entries, follow-up prompts, context cache

CREATE TYPE public.reflection_period AS ENUM ('ochtend', 'avond');

ALTER TABLE public.entries
    ADD COLUMN reflection_period public.reflection_period;

CREATE INDEX entries_user_reflection_created_idx
    ON public.entries (user_id, reflection_period, created_at DESC);

-- Follow-up reflection prompts (bookmarked + daily)
CREATE TABLE public.reflection_prompts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    topic text NOT NULL,
    question text NOT NULL,
    is_bookmarked boolean NOT NULL DEFAULT false,
    prompt_date date,
    entry_id uuid REFERENCES public.entries (id) ON DELETE SET NULL,
    bookmarked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reflection_prompts_user_bookmarked_idx
    ON public.reflection_prompts (user_id, is_bookmarked, bookmarked_at DESC);

CREATE INDEX reflection_prompts_user_date_idx
    ON public.reflection_prompts (user_id, prompt_date);

-- Cache for ochtend/avond check-in context strings
CREATE TABLE public.dashboard_reflection_cache (
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    cache_date date NOT NULL,
    cache_key text NOT NULL,
    payload jsonb NOT NULL,
    generated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, cache_date, cache_key)
);

ALTER TABLE public.reflection_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_reflection_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflection prompts"
    ON public.reflection_prompts FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reflection prompts"
    ON public.reflection_prompts FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reflection prompts"
    ON public.reflection_prompts FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reflection prompts"
    ON public.reflection_prompts FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "Users can view own reflection cache"
    ON public.dashboard_reflection_cache FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reflection cache"
    ON public.dashboard_reflection_cache FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reflection cache"
    ON public.dashboard_reflection_cache FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reflection cache"
    ON public.dashboard_reflection_cache FOR DELETE
    USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflection_prompts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboard_reflection_cache TO authenticated;
GRANT USAGE ON TYPE public.reflection_period TO anon, authenticated, service_role;
