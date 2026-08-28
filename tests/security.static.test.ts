import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const schema = fs.readFileSync(path.join(root, 'supabase/migrations/001_schema.sql'), 'utf8');
const rls = fs.readFileSync(path.join(root, 'supabase/migrations/002_rls.sql'), 'utf8');

test('every public application table enables RLS', () => {
  const tables = [...schema.matchAll(/create table if not exists public\.([a-z_]+)/gi)].map((m) => m[1]);
  assert.ok(tables.length >= 35);
  for (const table of tables) {
    assert.match(rls, new RegExp(`alter table public\\.${table} enable row level security`, 'i'), `RLS missing for ${table}`);
  }
});

test('client environment example contains no elevated secret', () => {
  const env = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
  assert.ok(env.includes('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'));
  assert.ok(!env.includes('sb_secret_'));
  assert.ok(!env.toLowerCase().includes('service_role'));
});
