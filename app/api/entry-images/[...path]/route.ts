import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ENTRY_IMAGES_BUCKET,
  isValidEntryImagePath,
} from "@/lib/utils/entry-images";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  const storagePath = path.join("/");

  if (!isValidEntryImagePath(storagePath)) {
    return NextResponse.json({ error: "Ongeldig pad." }, { status: 400 });
  }

  const [userId, entryId] = storagePath.split("/");

  if (!userId || !entryId) {
    return NextResponse.json({ error: "Ongeldig pad." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const { data: entry } = await supabase
    .from("entries")
    .select("id")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!entry) {
    return NextResponse.json({ error: "Entry niet gevonden." }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(ENTRY_IMAGES_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: "Afbeelding kon niet worden geladen." },
      { status: 404 },
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
