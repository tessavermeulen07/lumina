import { createHmac, timingSafeEqual } from "node:crypto";

const UNLOCK_TTL_MS = 24 * 60 * 60 * 1000;

function getUnlockSecret(): string {
  return (
    process.env.ENTRY_UNLOCK_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "lumina-dev-unlock-secret"
  );
}

export function createEntryUnlockToken(
  entryId: string,
  userId: string,
): string {
  const expiresAt = Date.now() + UNLOCK_TTL_MS;
  const payload = `${entryId}:${userId}:${expiresAt}`;
  const signature = createHmac("sha256", getUnlockSecret())
    .update(payload)
    .digest("hex");

  return `${expiresAt}.${signature}`;
}

export function verifyEntryUnlockToken(
  entryId: string,
  userId: string,
  token: string | undefined,
): boolean {
  if (!token) {
    return false;
  }

  const [expiresAtStr, signature] = token.split(".");

  if (!expiresAtStr || !signature) {
    return false;
  }

  const expiresAt = Number(expiresAtStr);

  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const payload = `${entryId}:${userId}:${expiresAt}`;
  const expected = createHmac("sha256", getUnlockSecret())
    .update(payload)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function getUnlockCookieName(entryId: string): string {
  return `lumina_unlock_${entryId}`;
}

export const ENTRY_UNLOCK_MAX_AGE_SECONDS = UNLOCK_TTL_MS / 1000;
