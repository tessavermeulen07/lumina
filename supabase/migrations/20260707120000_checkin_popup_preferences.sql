CREATE TYPE public.checkin_popup_type AS ENUM ('goals', 'ochtend_reflectie', 'avond_reflectie');

ALTER TABLE public.profiles
    ADD COLUMN goals_checkin_time time NOT NULL DEFAULT '09:00',
    ADD COLUMN morning_reflection_time time NOT NULL DEFAULT '08:00',
    ADD COLUMN evening_reflection_time time NOT NULL DEFAULT '20:00';

CREATE TABLE public.checkin_popup_state (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    popup_type public.checkin_popup_type NOT NULL,
    popup_date date NOT NULL,
    shown_at timestamptz NOT NULL DEFAULT now(),
    dismissed_at timestamptz,
    completed_at timestamptz,
    UNIQUE (user_id, popup_type, popup_date)
);

CREATE INDEX checkin_popup_state_user_date_idx
    ON public.checkin_popup_state (user_id, popup_date DESC);

ALTER TABLE public.checkin_popup_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own popup state"
    ON public.checkin_popup_state FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own popup state"
    ON public.checkin_popup_state FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own popup state"
    ON public.checkin_popup_state FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

GRANT USAGE ON TYPE public.checkin_popup_type TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.checkin_popup_state TO authenticated;
