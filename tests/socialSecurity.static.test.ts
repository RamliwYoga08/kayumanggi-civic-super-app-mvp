import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const migration = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/005_social_experience.sql'), 'utf8');

test('friend acceptance is addressee-bound and transactional', () => {
  assert.match(migration, /addressee_id\s*=\s*auth\.uid\(\)/i);
  assert.match(migration, /for update/i);
  assert.match(migration, /insert into public\.friendships/i);
});

test('security definer social functions are not public executable', () => {
  assert.match(migration, /revoke all on function public\.respond_to_friend_request\(uuid, boolean\) from public/i);
  assert.match(migration, /revoke all on function public\.notify_friend_request\(\) from public/i);
});

test('legacy broad friend request update policy is removed', () => {
  assert.match(migration, /drop policy if exists friend_requests_participants_update/i);
  assert.match(migration, /status\s*=\s*'cancelled'/i);
});
