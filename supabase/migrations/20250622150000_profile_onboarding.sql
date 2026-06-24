-- Onboarding preferences on profiles for AI personalisation

ALTER TABLE public.profiles
    ADD COLUMN onboarding_main_goal text,
    ADD COLUMN onboarding_priorities jsonb NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN onboarding_experience text,
    ADD COLUMN onboarding_completed_at timestamptz;

-- Existing users with a coach style: treat onboarding as complete
UPDATE public.profiles
SET onboarding_completed_at = updated_at
WHERE ai_persona_preference IS NOT NULL
  AND onboarding_completed_at IS NULL;
