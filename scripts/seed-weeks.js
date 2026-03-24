#!/usr/bin/env node
/**
 * Seeds the weeks table from 24-week-program.json.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-weeks.js
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=representation',
};

async function main() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', '24-week-program.json'), 'utf8'));

  // Get programs
  const progRes = await fetch(`${SUPABASE_URL}/rest/v1/programs?select=id,title`, { headers });
  const programs = await progRes.json();
  const programMap = {};
  for (const p of programs) {
    if (p.title.includes('Frenectomy') && !p.title.includes('Non')) programMap.frenectomy = p.id;
    else programMap.standard = p.id;
  }
  console.log('Programs:', programMap);

  // Build week rows
  const rows = data.map(entry => ({
    program_id: programMap[entry.program_variant] || programMap.frenectomy,
    number: entry.week,
    title: entry.title,
    requires_bolt: entry.tracking?.bolt_score === true,
  }));

  // Upsert
  const res = await fetch(`${SUPABASE_URL}/rest/v1/weeks`, {
    method: 'POST',
    headers,
    body: JSON.stringify(rows),
  });
  const result = await res.json();
  if (Array.isArray(result)) {
    console.log(`Upserted ${result.length} week rows`);
  } else {
    console.error('Error:', result);
  }
}

main().catch(console.error);
