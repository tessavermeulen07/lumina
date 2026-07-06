import { cookies } from "next/headers";
import {
  getUnlockCookieName,
  verifyEntryUnlockToken,
} from "@/lib/auth/entry-unlock-token";

export async function isEntryUnlockedForUser(
  entryId: string,
  userId: string,
): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getUnlockCookieName(entryId))?.value;

  return verifyEntryUnlockToken(entryId, userId, token);
}
