"use server";

import { cookies } from "next/headers";
import { verifyEntryPassword } from "@/lib/auth/entry-password";
import {
  createEntryUnlockToken,
  ENTRY_UNLOCK_MAX_AGE_SECONDS,
  getUnlockCookieName,
} from "@/lib/auth/entry-unlock-token";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { listEntryBlocks } from "@/lib/entries/entry-blocks";
import { getEntryAnalysis } from "@/lib/entries/finalize-entry";
import { createClient } from "@/lib/supabase/server";
import type { Entry, EntryAnalysis } from "@/types/database";
import type { EntryBlock } from "@/types/entry-blocks";

type UnlockResult =
  | {
      entry: Entry;
      blocks: EntryBlock[];
      analysis: EntryAnalysis | null;
    }
  | { error: string };

export async function unlockPrivateEntry(
  entryId: string,
  password: string,
): Promise<UnlockResult> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !entry) {
    return { error: "Entry niet gevonden." };
  }

  if (!entry.is_private) {
    const [blocks, analysis] = await Promise.all([
      listEntryBlocks(entryId),
      getEntryAnalysis(entryId),
    ]);

    return { entry, blocks, analysis };
  }

  if (!entry.private_password_hash) {
    return { error: "Deze entry kan niet worden ontgrendeld." };
  }

  const isValid = await verifyEntryPassword(
    password,
    entry.private_password_hash,
  );

  if (!isValid) {
    return { error: "Onjuist wachtwoord." };
  }

  const token = createEntryUnlockToken(entryId, user.id);
  const cookieStore = await cookies();

  cookieStore.set(getUnlockCookieName(entryId), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ENTRY_UNLOCK_MAX_AGE_SECONDS,
    path: "/",
  });

  const [blocks, analysis] = await Promise.all([
    listEntryBlocks(entryId),
    getEntryAnalysis(entryId),
  ]);

  return { entry, blocks, analysis };
}
