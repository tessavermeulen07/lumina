"use client";

import { useMutation } from "@tanstack/react-query";
import { finishOnboarding, saveProfile } from "@/lib/queries/profile-actions";

type SaveProfileInput = Parameters<typeof saveProfile>[0];
type FinishOnboardingInput = {
  answers: Parameters<typeof finishOnboarding>[0];
  timezone?: string;
};

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: SaveProfileInput) => saveProfile(input),
  });
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: ({ answers, timezone }: FinishOnboardingInput) =>
      finishOnboarding(answers, timezone),
  });
}
