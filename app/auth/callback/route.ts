import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function resolveRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/vandaag";
  }

  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const next = resolveRedirectPath(searchParams.get("next"));

  if (error) {
    return NextResponse.redirect(`${origin}/wachtwoord-vergeten?fout=verlopen`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/wachtwoord-vergeten?fout=verlopen`,
      );
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
