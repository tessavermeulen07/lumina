"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { hashEntryPassword, verifyEntryPassword } from "@/lib/auth/entry-password";
import {
  createEntryUnlockToken,
  ENTRY_UNLOCK_MAX_AGE_SECONDS,
  getUnlockCookieName,
} from "@/lib/auth/entry-unlock-token";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { passwordsMatch, validatePassword } from "@/lib/auth/password";
import { getEntryErrorMessage } from "@/lib/entries/errors";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

const REVALIDATE_PATHS = ["/geschiedenis", "/bewaard", "/schrijf", "/inzichten"];

function revalidateEntryPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

async function getOwnedEntry(entryId: string) {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("entries")
    .select("id, user_id, is_bookmarked, is_private, private_password_hash")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !entry) {
    return null;
  }

  return { entry, userId: user.id };
}

export async function toggleEntryBookmark(
  entryId: string,
): Promise<ActionResult> {
  const owned = await getOwnedEntry(entryId);

  if (!owned) {
    return { error: "Entry niet gevonden." };
  }

  const willBookmark = !owned.entry.is_bookmarked;
  const supabase = await createClient();

  const { error } = await supabase
    .from("entries")
    .update({
      is_bookmarked: willBookmark,
      bookmarked_at: willBookmark ? new Date().toISOString() : null,
    })
    .eq("id", entryId)
    .eq("user_id", owned.userId);

  if (error) {
    return { error: getEntryErrorMessage(error.message) };
  }

  revalidateEntryPaths();
  return { success: true };
}

export async function makeEntryPrivate(
  entryId: string,
  password: string,
  confirmPassword: string,
): Promise<ActionResult> {
  const passwordError = validatePassword(password);

  if (passwordError) {
    return { error: passwordError };
  }

  if (!passwordsMatch(password, confirmPassword)) {
    return { error: "Wachtwoorden komen niet overeen." };
  }

  const owned = await getOwnedEntry(entryId);

  if (!owned) {
    return { error: "Entry niet gevonden." };
  }

  const passwordHash = await hashEntryPassword(password);
  const supabase = await createClient();

  const { error } = await supabase
    .from("entries")
    .update({
      is_private: true,
      private_password_hash: passwordHash,
    })
    .eq("id", entryId)
    .eq("user_id", owned.userId);

  if (error) {
    return { error: getEntryErrorMessage(error.message) };
  }

  revalidateEntryPaths();
  return { success: true };
}

export async function removeEntryPrivate(
  entryId: string,
  password: string,
): Promise<ActionResult> {
  const owned = await getOwnedEntry(entryId);

  if (!owned) {
    return { error: "Entry niet gevonden." };
  }

  if (!owned.entry.is_private || !owned.entry.private_password_hash) {
    return { error: "Deze entry is niet privé." };
  }

  const isValid = await verifyEntryPassword(
    password,
    owned.entry.private_password_hash,
  );

  if (!isValid) {
    return { error: "Onjuist wachtwoord." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("entries")
    .update({
      is_private: false,
      private_password_hash: null,
    })
    .eq("id", entryId)
    .eq("user_id", owned.userId);

  if (error) {
    return { error: getEntryErrorMessage(error.message) };
  }

  const cookieStore = await cookies();
  cookieStore.delete(getUnlockCookieName(entryId));

  revalidateEntryPaths();
  return { success: true };
}
