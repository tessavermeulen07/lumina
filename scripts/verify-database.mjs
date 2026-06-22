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
    // .env.local is optional for verify-only runs
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const dbUrl = process.env.SUPABASE_DB_URL;

const tables = [
  "profiles",
  "entries",
  "emotion_analyses",
  "habits_and_intentions",
  "habit_logs",
  "ai_insights",
  "questions",
];

async function checkTable(table) {
  const response = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  return response.status;
}

async function applyMigration() {
  if (!dbUrl) {
    const hasApiUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.error(
      "SUPABASE_DB_URL ontbreekt in .env.local.\n" +
        (hasApiUrl
          ? "Let op: NEXT_PUBLIC_SUPABASE_URL is de API-URL voor de app, niet de database-verbinding voor migraties.\n" +
            "Voeg apart SUPABASE_DB_URL toe (PostgreSQL connection string, begint met postgresql://).\n"
          : "") +
        "Supabase Dashboard → Project Settings → Database → Connection string (URI).\n\n" +
        "Of via CLI:\n" +
        "  npx supabase login\n" +
        "  npx supabase link --project-ref fihhvuqvplyllmpzyeoh\n" +
        "  npx supabase db push",
    );
    process.exit(1);
  }

  const { default: pg } = await import("pg");
  const sql = readFileSync(
    resolve(root, "supabase/migrations/20250615000000_initial_schema.sql"),
    "utf8",
  );

  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();

  try {
    await client.query(sql);
    console.log("Migratie succesvol uitgevoerd.");
  } finally {
    await client.end();
  }
}

async function verifySchema() {
  if (!url || !anonKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY zijn vereist.");
    process.exit(1);
  }

  const results = await Promise.all(
    tables.map(async (table) => ({ table, status: await checkTable(table) })),
  );

  const missing = results.filter((r) => r.status === 404);
  const ready = results.filter((r) => r.status !== 404);

  for (const { table, status } of results) {
    const ok = status !== 404;
    console.log(`${ok ? "✓" : "✗"} ${table} (HTTP ${status})`);
  }

  if (missing.length > 0) {
    console.error(
      `\n${missing.length} tabel(len) ontbreken nog. Run eerst: npm run db:migrate`,
    );
    process.exit(1);
  }

  console.log(`\nAlle ${ready.length} tabellen zijn bereikbaar via de API.`);
}

const command = process.argv[2] ?? "verify";

if (command === "migrate") {
  await applyMigration();
  await verifySchema();
} else {
  await verifySchema();
}
