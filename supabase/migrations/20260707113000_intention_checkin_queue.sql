CREATE TYPE public.checkin_queue_status AS ENUM ('pending', 'completed', 'skipped');

CREATE TABLE public.intention_checkin_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    intention_id uuid NOT NULL REFERENCES public.habits_and_intentions (id) ON DELETE CASCADE,
    due_for_date date NOT NULL,
    status public.checkin_queue_status NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    processed_at timestamptz,
    UNIQUE (user_id, intention_id, due_for_date)
);

CREATE INDEX intention_checkin_queue_user_status_due_idx
    ON public.intention_checkin_queue (user_id, status, due_for_date DESC);

ALTER TABLE public.intention_checkin_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own check-in queue"
    ON public.intention_checkin_queue FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-in queue"
    ON public.intention_checkin_queue FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-in queue"
    ON public.intention_checkin_queue FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-in queue"
    ON public.intention_checkin_queue FOR DELETE
    USING (auth.uid() = user_id);

GRANT USAGE ON TYPE public.checkin_queue_status TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.intention_checkin_queue TO authenticated;
