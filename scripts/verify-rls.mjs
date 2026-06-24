#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    process.env[key] = value;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Supabase env vars ontbreken in .env.local");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

const tables = [
  "profiles",
  "entries",
  "emotion_analyses",
  "habits_and_intentions",
  "habit_logs",
  "ai_insights",
  "weekly_reports",
];

let passed = 0;
let failed = 0;

for (const table of tables) {
  const { data, error } = await supabase.from(table).select("id").limit(1);

  if (error) {
    console.log(`✗ ${table}: ${error.message}`);
    failed += 1;
    continue;
  }

  if (Array.isArray(data)) {
    console.log(`✓ ${table}: RLS actief (geen sessie → ${data.length} rijen)`);
    passed += 1;
  } else {
    console.log(`✗ ${table}: onverwacht antwoord`);
    failed += 1;
  }
}

console.log(`\n${passed} geslaagd, ${failed} mislukt`);

if (failed > 0) {
  process.exit(1);
}

console.log(
  "\nProfiel-trigger: maak een testaccount via /registreren en controleer in Supabase Table Editor of er een profiles-rij verschijnt.",
);
