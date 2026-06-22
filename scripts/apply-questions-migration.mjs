#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  try {
    const envPath = resolve(root, ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const value = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local is optional
  }
}

loadEnv();

const dbUrl = process.env.SUPABASE_DB_URL;
const expectedRef = "fihhvuqvplyllmpzyeoh";

if (!dbUrl) {
  const hasApiUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.error(
    "SUPABASE_DB_URL ontbreekt in .env.local.\n\n" +
      (hasApiUrl
        ? "Je hebt NEXT_PUBLIC_SUPABASE_URL staan — dat is de HTTP API voor Next.js, niet de Postgres-URL voor migraties.\n" +
          "Voeg ook SUPABASE_DB_URL toe (connection string URI, begint met postgresql://).\n\n"
        : "") +
      "Supabase Dashboard → Project Settings → Database → Connection string (URI)\n" +
      `Project ref moet ${expectedRef} zijn.\n\n` +
      "Of via CLI:\n" +
      "  npx supabase login\n" +
      `  npx supabase link --project-ref ${expectedRef}\n` +
      "  npx supabase db push",
  );
  process.exit(1);
}

if (!dbUrl.includes(expectedRef)) {
  console.error(
    `SUPABASE_DB_URL lijkt niet op het Lumina-project (${expectedRef}).`,
  );
  process.exit(1);
}

const sql = readFileSync(
  resolve(root, "supabase/migrations/20250622000000_questions.sql"),
  "utf8",
);

const { default: pg } = await import("pg");
const client = new pg.Client({ connectionString: dbUrl });

await client.connect();

try {
  const exists = await client.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'questions'
    ) AS exists`,
  );

  if (exists.rows[0]?.exists) {
    const count = await client.query("SELECT COUNT(*)::int AS n FROM public.questions");
    console.log(`questions bestaat al (${count.rows[0].n} rijen). Geen migratie nodig.`);
    process.exit(0);
  }

  await client.query(sql);

  const count = await client.query("SELECT COUNT(*)::int AS n FROM public.questions");
  console.log(`Migratie succesvol. questions bevat ${count.rows[0].n} rijen.`);
} finally {
  await client.end();
}
