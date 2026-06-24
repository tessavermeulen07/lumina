-- App-wide API usage tracking (Twinword monthly limits)

CREATE TABLE public.api_usage (
    service text NOT NULL,
    month text NOT NULL,
    count int NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (service, month)
);

ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- No policies: only service role / SECURITY DEFINER functions access this table.

CREATE OR REPLACE FUNCTION public.try_reserve_api_usage(
    p_service text,
    p_month text,
    p_limit int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count int;
BEGIN
    INSERT INTO public.api_usage (service, month, count)
    VALUES (p_service, p_month, 0)
    ON CONFLICT (service, month) DO NOTHING;

    SELECT count INTO current_count
    FROM public.api_usage
    WHERE service = p_service AND month = p_month
    FOR UPDATE;

    IF current_count >= p_limit THEN
        RETURN jsonb_build_object(
            'reserved', false,
            'count', current_count,
            'limit', p_limit
        );
    END IF;

    UPDATE public.api_usage
    SET count = count + 1, updated_at = now()
    WHERE service = p_service AND month = p_month;

    RETURN jsonb_build_object(
        'reserved', true,
        'count', current_count + 1,
        'limit', p_limit
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_api_usage_count(
    p_service text,
    p_month text
)
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT COALESCE(
        (SELECT count FROM public.api_usage WHERE service = p_service AND month = p_month),
        0
    );
$$;

-- Cache Twinword results by text hash to avoid duplicate API calls

CREATE TABLE public.twinword_text_cache (
    text_hash text PRIMARY KEY,
    scores jsonb NOT NULL,
    dominant_emotion text,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.twinword_text_cache ENABLE ROW LEVEL SECURITY;

GRANT EXECUTE ON FUNCTION public.try_reserve_api_usage(text, text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_api_usage_count(text, text) TO authenticated;
