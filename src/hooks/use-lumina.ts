"use client";

import { useMutation } from "@tanstack/react-query";
import { askLumina } from "@/lib/ai/ask-lumina";

export function useAskLumina() {
  return useMutation({
    mutationFn: (question: string) => askLumina(question),
  });
}
