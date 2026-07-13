ALTER TABLE public.habits_and_intentions
    ADD COLUMN window_start_date date NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN window_end_date date NOT NULL DEFAULT CURRENT_DATE;

CREATE INDEX habits_and_intentions_user_window_idx
    ON public.habits_and_intentions (user_id, is_active, window_start_date, window_end_date);
