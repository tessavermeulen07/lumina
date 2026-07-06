"use server";

import { getEntryErrorMessage } from "@/lib/entries/errors";
import { getAuthenticatedUser } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_ENTRY_IMAGE_TYPES,
  ENTRY_IMAGES_BUCKET,
  buildEntryImagePath,
  getEntryImageServeUrl,
  getExtensionForMimeType,
  MAX_ENTRY_IMAGE_BYTES,
} from "@/lib/utils/entry-images";

export async function uploadEntryImage(
  entryId: string,
  formData: FormData,
): Promise<
  | { storagePath: string; serveUrl: string }
  | { error: string }
> {
  const user = await getAuthenticatedUser();
  const supabase = await createClient();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "Kies een afbeelding om te uploaden." };
  }

  if (!ALLOWED_ENTRY_IMAGE_TYPES.has(file.type)) {
    return { error: "Alleen afbeeldingen (JPEG, PNG, WebP of GIF) zijn toegestaan." };
  }

  if (file.size > MAX_ENTRY_IMAGE_BYTES) {
    return { error: "Bestand is te groot. Maximaal 5 MB." };
  }

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .select("id")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (entryError) {
    return { error: getEntryErrorMessage(entryError.message) };
  }

  if (!entry) {
    return { error: "Entry niet gevonden." };
  }

  const extension = getExtensionForMimeType(file.type);

  if (!extension) {
    return { error: "Dit bestandstype wordt niet ondersteund." };
  }

  const filename = `${crypto.randomUUID()}.${extension}`;
  const storagePath = buildEntryImagePath(user.id, entryId, filename);
  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(ENTRY_IMAGES_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Entry image upload failed:", uploadError.message);
    return { error: "Afbeelding kon niet worden geüpload." };
  }

  return {
    storagePath,
    serveUrl: getEntryImageServeUrl(storagePath),
  };
}
