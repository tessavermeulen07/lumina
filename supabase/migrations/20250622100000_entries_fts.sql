-- Full-text search on journal entries for AI journal history search

ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('dutch', content)) STORED;

CREATE INDEX IF NOT EXISTS entries_search_vector_idx
  ON public.entries USING GIN (search_vector);
