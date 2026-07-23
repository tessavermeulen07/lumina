"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteEntry } from "@/lib/entries/delete-entry";
import { finalizeEntry } from "@/lib/entries/finalize-entry";
import {
  makeEntryPrivate,
  removeEntryPrivate,
  toggleEntryBookmark,
} from "@/lib/entries/toggle-entry-flags";
import { unlockPrivateEntry } from "@/lib/entries/unlock-private-entry";
import { respondToEntryAction } from "@/lib/ai/respond-to-entry";
import {
  createDraftEntry,
  ensureDraftEntry,
  saveDraftUserBlock,
} from "@/lib/queries/entry-draft-actions";
import {
  fetchBookmarkedItems,
  fetchEntryWithMeta,
} from "@/lib/queries/entries-actions";
import { queryKeys } from "@/lib/queries/keys";
import { hasMutationError, invalidateAppData } from "@/lib/queries/utils";
import type { ReflectionPeriod } from "@/lib/types/database";

type FinalizeEntryInput = Parameters<typeof finalizeEntry>[0];
type MakeEntryPrivateInput = {
  entryId: string;
  password: string;
  confirmPassword: string;
};
type RemoveEntryPrivateInput = {
  entryId: string;
  password: string;
};
type UnlockPrivateEntryInput = {
  entryId: string;
  password: string;
};
type CreateDraftEntryInput = {
  content: string;
  reflectionPeriod?: ReflectionPeriod;
};
type SaveDraftBlockInput = {
  entryId: string;
  blockId: string;
  content: string;
};
type RespondToEntryInput = Parameters<typeof respondToEntryAction>[0];

export function useEntryWithMeta(entryId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.entries.detail(entryId),
    queryFn: () => fetchEntryWithMeta(entryId),
    enabled: enabled && entryId.length > 0,
  });
}

export function useBookmarkedItems() {
  return useQuery({
    queryKey: queryKeys.bookmarks.list(),
    queryFn: () => fetchBookmarkedItems(),
  });
}

export function useEntryMutations() {
  const queryClient = useQueryClient();

  function invalidateAll() {
    return invalidateAppData(queryClient);
  }

  const createDraft = useMutation({
    mutationFn: ({ content, reflectionPeriod }: CreateDraftEntryInput) =>
      createDraftEntry(content, { reflectionPeriod }),
  });

  const saveDraftBlock = useMutation({
    mutationFn: ({ entryId, blockId, content }: SaveDraftBlockInput) =>
      saveDraftUserBlock(entryId, blockId, content),
  });

  const ensureDraft = useMutation({
    mutationFn: (options?: { reflectionPeriod?: ReflectionPeriod }) =>
      ensureDraftEntry(options),
  });

  const respondToEntry = useMutation({
    mutationFn: (input: RespondToEntryInput) => respondToEntryAction(input),
    onSuccess: (result) => {
      if (hasMutationError(result)) return;
      void invalidateAll();
    },
  });

  const removeEntry = useMutation({
    mutationFn: (entryId: string) => deleteEntry(entryId),
    onSuccess: (result) => {
      if (hasMutationError(result)) return;
      void invalidateAll();
    },
  });

  const toggleBookmark = useMutation({
    mutationFn: (entryId: string) => toggleEntryBookmark(entryId),
    onSuccess: (result, entryId) => {
      if (hasMutationError(result)) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.entries.detail(entryId),
      });
      void invalidateAll();
    },
  });

  const setPrivate = useMutation({
    mutationFn: ({ entryId, password, confirmPassword }: MakeEntryPrivateInput) =>
      makeEntryPrivate(entryId, password, confirmPassword),
    onSuccess: (result, { entryId }) => {
      if (hasMutationError(result)) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.entries.detail(entryId),
      });
      void invalidateAll();
    },
  });

  const unsetPrivate = useMutation({
    mutationFn: ({ entryId, password }: RemoveEntryPrivateInput) =>
      removeEntryPrivate(entryId, password),
    onSuccess: (result, { entryId }) => {
      if (hasMutationError(result)) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.entries.detail(entryId),
      });
      void invalidateAll();
    },
  });

  const finalize = useMutation({
    mutationFn: (input: FinalizeEntryInput) => finalizeEntry(input),
    onSuccess: (result) => {
      if (hasMutationError(result)) return;
      void invalidateAll();
    },
  });

  const unlockPrivate = useMutation({
    mutationFn: ({ entryId, password }: UnlockPrivateEntryInput) =>
      unlockPrivateEntry(entryId, password),
    onSuccess: (result, { entryId }) => {
      if (hasMutationError(result)) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.entries.detail(entryId),
      });
      void invalidateAll();
    },
  });

  async function fetchEntryDetail(entryId: string) {
    return queryClient.fetchQuery({
      queryKey: queryKeys.entries.detail(entryId),
      queryFn: () => fetchEntryWithMeta(entryId),
    });
  }

  const isPending =
    createDraft.isPending ||
    saveDraftBlock.isPending ||
    ensureDraft.isPending ||
    respondToEntry.isPending ||
    removeEntry.isPending ||
    toggleBookmark.isPending ||
    setPrivate.isPending ||
    unsetPrivate.isPending ||
    finalize.isPending ||
    unlockPrivate.isPending;

  return {
    createDraft,
    saveDraftBlock,
    ensureDraft,
    respondToEntry,
    removeEntry,
    toggleBookmark,
    setPrivate,
    unsetPrivate,
    finalize,
    unlockPrivate,
    fetchEntryDetail,
    invalidateAll,
    isPending,
  };
}
