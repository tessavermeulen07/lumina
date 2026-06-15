-- Lumina initial schema: profiles, entries, emotion_analyses,
-- habits_and_intentions, habit_logs, ai_insights

-- Enums
CREATE TYPE public.habit_type AS ENUM ('habit', 'intention');
CREATE TYPE public.habit_log_status AS ENUM ('completed', 'skipped', 'failed');

-- Profiles (1:1 with auth.users)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    username text NOT NULL,
    ai_persona_preference text,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Journal entries
CREATE TABLE public.entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    content text NOT NULL,
    summary text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX entries_user_id_created_at_idx
    ON public.entries (user_id, created_at DESC);

-- Emotion analyses (1:1 with entries)
CREATE TABLE public.emotion_analyses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id uuid NOT NULL UNIQUE REFERENCES public.entries (id) ON DELETE CASCADE,
    scores jsonb NOT NULL,
    dominant_emotion varchar(100) NOT NULL,
    analyzed_at timestamptz NOT NULL DEFAULT now()
);

-- Habits and intentions
CREATE TABLE public.habits_and_intentions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    description text,
    type public.habit_type NOT NULL,
    frequency varchar(50) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX habits_and_intentions_user_id_idx
    ON public.habits_and_intentions (user_id);

-- Habit check-in logs
CREATE TABLE public.habit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id uuid NOT NULL REFERENCES public.habits_and_intentions (id) ON DELETE CASCADE,
    status public.habit_log_status NOT NULL,
    ai_checkin_prompt text,
    logged_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX habit_logs_habit_id_logged_at_idx
    ON public.habit_logs (habit_id, logged_at DESC);

-- AI insights (weekly/monthly pattern recognition)
CREATE TABLE public.ai_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    insight_text text NOT NULL,
    patterns_detected jsonb,
    date_from date NOT NULL,
    date_to date NOT NULL,
    CONSTRAINT ai_insights_date_range CHECK (date_from <= date_to)
);

CREATE INDEX ai_insights_user_id_idx
    ON public.ai_insights (user_id);

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data ->> 'username',
            NEW.raw_user_meta_data ->> 'name',
            split_part(NEW.email, '@', 1)
        )
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits_and_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- entries
CREATE POLICY "Users can view own entries"
    ON public.entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
    ON public.entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
    ON public.entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
    ON public.entries FOR DELETE
    USING (auth.uid() = user_id);

-- emotion_analyses (via entry ownership)
CREATE POLICY "Users can view own emotion analyses"
    ON public.emotion_analyses FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.entries
            WHERE entries.id = emotion_analyses.entry_id
              AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own emotion analyses"
    ON public.emotion_analyses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.entries
            WHERE entries.id = emotion_analyses.entry_id
              AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own emotion analyses"
    ON public.emotion_analyses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.entries
            WHERE entries.id = emotion_analyses.entry_id
              AND entries.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.entries
            WHERE entries.id = emotion_analyses.entry_id
              AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own emotion analyses"
    ON public.emotion_analyses FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.entries
            WHERE entries.id = emotion_analyses.entry_id
              AND entries.user_id = auth.uid()
        )
    );

-- habits_and_intentions
CREATE POLICY "Users can view own habits and intentions"
    ON public.habits_and_intentions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits and intentions"
    ON public.habits_and_intentions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits and intentions"
    ON public.habits_and_intentions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits and intentions"
    ON public.habits_and_intentions FOR DELETE
    USING (auth.uid() = user_id);

-- habit_logs (via habit ownership)
CREATE POLICY "Users can view own habit logs"
    ON public.habit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.habits_and_intentions
            WHERE habits_and_intentions.id = habit_logs.habit_id
              AND habits_and_intentions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own habit logs"
    ON public.habit_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.habits_and_intentions
            WHERE habits_and_intentions.id = habit_logs.habit_id
              AND habits_and_intentions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own habit logs"
    ON public.habit_logs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.habits_and_intentions
            WHERE habits_and_intentions.id = habit_logs.habit_id
              AND habits_and_intentions.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.habits_and_intentions
            WHERE habits_and_intentions.id = habit_logs.habit_id
              AND habits_and_intentions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own habit logs"
    ON public.habit_logs FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.habits_and_intentions
            WHERE habits_and_intentions.id = habit_logs.habit_id
              AND habits_and_intentions.user_id = auth.uid()
        )
    );

-- ai_insights
CREATE POLICY "Users can view own ai insights"
    ON public.ai_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai insights"
    ON public.ai_insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai insights"
    ON public.ai_insights FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai insights"
    ON public.ai_insights FOR DELETE
    USING (auth.uid() = user_id);

-- API access for Supabase client roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT USAGE ON TYPE public.habit_type TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.habit_log_status TO anon, authenticated, service_role;
