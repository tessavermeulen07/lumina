import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  getRegisterErrorMessage,
  parseRegisterRequestBody,
} from "@/lib/auth/register";

export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "Registratie is tijdelijk niet beschikbaar." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };
  const parsed = parseRegisterRequestBody(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await supabase.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password,
    email_confirm: true,
    user_metadata: {
      username: parsed.name,
      name: parsed.name,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: getRegisterErrorMessage(error.message) },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
