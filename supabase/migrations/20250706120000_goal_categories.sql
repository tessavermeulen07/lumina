-- Goal categories: built-in slugs in app code; custom rows per user.

CREATE TABLE public.goal_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    name varchar(100) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, name)
);

CREATE INDEX goal_categories_user_id_idx
    ON public.goal_categories (user_id);

ALTER TABLE public.habits_and_intentions
    ADD COLUMN category varchar(100) NOT NULL DEFAULT 'persoonlijk';

ALTER TABLE public.goal_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal categories"
    ON public.goal_categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal categories"
    ON public.goal_categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goal categories"
    ON public.goal_categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goal categories"
    ON public.goal_categories FOR DELETE
    USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_categories TO authenticated;
