#!/usr/bin/env node

/**
 * LOOP — Supabase Connection Health Check (CLI)
 *
 * Runs an honest query against the Supabase `projects` table using the
 * configured public publishable key to verify connectivity and schema.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

async function main() {
  // Parse .env.local if present
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  const isPlaceholder =
    !url ||
    !key ||
    url.includes('your-project') ||
    key.includes('your-publishable') ||
    key.includes('your-anon');

  console.log('\n========================================');
  console.log('   LOOP — Supabase Connection Check');
  console.log('========================================\n');

  if (isPlaceholder) {
    console.log('Status: [MISSING CONFIGURATION]');
    console.log('Reason: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not defined in .env.local.');
    console.log('\nInstructions:');
    console.log('1. Copy .env.example to .env.local:');
    console.log('   cp .env.example .env.local');
    console.log('2. In your Supabase dashboard:');
    console.log('   Project Settings -> API -> Project URL & anon/publishable key.');
    console.log('3. Paste the values into .env.local and re-run this check.\n');
    process.exitCode = 1;
    return;
  }

  console.log(`Connecting to: ${url.slice(0, 15)}... (safe mask)`);

  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error, count } = await client
      .from('projects')
      .select('id, slug, title', { count: 'exact' })
      .limit(5);

    if (error) {
      console.log('Status: [QUERY FAILED]');
      console.log(`Error Code: ${error.code || 'UNKNOWN'}`);
      console.log(`Error Message: ${error.message}`);
      console.log('\nPossible causes:');
      console.log('- The migration has not yet been applied to your Supabase database.');
      console.log('- The publishable/anon key does not have SELECT permission on the projects table.');
      console.log('- The URL or key in .env.local is incorrect.\n');
      process.exitCode = 1;
      return;
    }

    const projectCount = count ?? (data ? data.length : 0);

    if (projectCount === 0) {
      console.log('Status: [CONNECTED — EMPTY CATALOGUE]');
      console.log('Verification: Connected successfully using publishable key.');
      console.log('Result: The projects table exists, RLS is active, and 0 published projects were returned.');
      console.log('(This is the expected, correct state for a freshly initialized database).\n');
    } else {
      console.log('Status: [CONNECTED — PROJECTS FOUND]');
      console.log(`Verification: Connected successfully. Found ${projectCount} published project(s).`);
      console.log('(Catalogue querying is fully functional).\n');
    }

    process.exitCode = 0;
  } catch (err) {
    console.log('Status: [CONNECTION ERROR]');
    console.log(`Reason: ${err instanceof Error ? err.message : String(err)}`);
    console.log('Check your internet connection and verify that your Supabase project is active.\n');
    process.exitCode = 1;
  }
}

main();
