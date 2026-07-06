ALTER TABLE public.entries
    ADD COLUMN is_bookmarked boolean NOT NULL DEFAULT false,
    ADD COLUMN bookmarked_at timestamptz,
    ADD COLUMN is_private boolean NOT NULL DEFAULT false,
    ADD COLUMN private_password_hash text;

CREATE INDEX entries_user_bookmarked_idx
    ON public.entries (user_id, is_bookmarked, bookmarked_at DESC)
    WHERE is_bookmarked = true;
