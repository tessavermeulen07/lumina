-- Public contact form submissions (service role only)

CREATE TABLE public.contact_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    category text NOT NULL
        CHECK (category IN ('algemene_vraag', 'support', 'klacht')),
    message text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_submissions_created_at_idx
    ON public.contact_submissions (created_at DESC);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- No policies: only service role writes/reads from the API.

GRANT ALL ON TABLE public.contact_submissions TO postgres, service_role;
