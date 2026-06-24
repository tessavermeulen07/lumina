-- Inline journal flow: user blocks interleaved with AI responses

CREATE TABLE public.entry_user_blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id uuid NOT NULL REFERENCES public.entries (id) ON DELETE CASCADE,
    content text NOT NULL DEFAULT '',
    sort_order int NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (entry_id, sort_order)
);

CREATE INDEX entry_user_blocks_entry_id_sort_order_idx
    ON public.entry_user_blocks (entry_id, sort_order ASC);

ALTER TABLE public.entry_user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entry user blocks"
    ON public.entry_user_blocks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = entry_user_blocks.entry_id
              AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own entry user blocks"
    ON public.entry_user_blocks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = entry_user_blocks.entry_id
              AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own entry user blocks"
    ON public.entry_user_blocks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = entry_user_blocks.entry_id
              AND entries.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = entry_user_blocks.entry_id
              AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own entry user blocks"
    ON public.entry_user_blocks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.entries
            WHERE entries.id = entry_user_blocks.entry_id
              AND entries.user_id = auth.uid()
        )
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.entry_user_blocks TO authenticated;

-- sort_order on AI responses for interleaving
ALTER TABLE public.entry_ai_responses
    ADD COLUMN IF NOT EXISTS sort_order int;

-- Migrate existing entries to user blocks
INSERT INTO public.entry_user_blocks (entry_id, content, sort_order)
SELECT e.id, e.content, 0
FROM public.entries e
WHERE NOT EXISTS (
    SELECT 1 FROM public.entry_user_blocks ub WHERE ub.entry_id = e.id
);

-- Backfill sort_order on existing AI responses (after user block at 0)
WITH numbered AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY entry_id ORDER BY created_at ASC
        ) AS rn
    FROM public.entry_ai_responses
    WHERE sort_order IS NULL
)
UPDATE public.entry_ai_responses AS r
SET sort_order = numbered.rn
FROM numbered
WHERE r.id = numbered.id;

ALTER TABLE public.entry_ai_responses
    ALTER COLUMN sort_order SET NOT NULL;
