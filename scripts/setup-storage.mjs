import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY. Use a server-only sb_secret_ key for this one-time setup.');
  process.exit(1);
}
if (!secret.startsWith('sb_secret_')) {
  console.error('SUPABASE_SECRET_KEY must be a modern server-only sb_secret_ key.');
  process.exit(1);
}
const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const buckets = [
  ['avatars', 5 * 1024 * 1024, ['image/png','image/jpeg','image/webp']],
  ['post-media', 20 * 1024 * 1024, ['image/png','image/jpeg','image/webp','video/mp4']],
  ['marketplace-media', 15 * 1024 * 1024, ['image/png','image/jpeg','image/webp']],
  ['message-attachments', 20 * 1024 * 1024, ['image/png','image/jpeg','image/webp','application/pdf','text/plain']],
  ['civic-evidence', 25 * 1024 * 1024, ['image/png','image/jpeg','image/webp','application/pdf']],
];
for (const [id, fileSizeLimit, allowedMimeTypes] of buckets) {
  const { data: existing, error: lookupError } = await supabase.storage.getBucket(id);
  if (lookupError && !String(lookupError.message).toLowerCase().includes('not found')) console.warn(`${id}: ${lookupError.message}`);
  if (existing) {
    const { error } = await supabase.storage.updateBucket(id, { public: false, fileSizeLimit, allowedMimeTypes });
    if (error) throw error;
    console.log(`Updated ${id}`);
  } else {
    const { error } = await supabase.storage.createBucket(id, { public: false, fileSizeLimit, allowedMimeTypes });
    if (error) throw error;
    console.log(`Created ${id}`);
  }
}
console.log('All Kayumanggi buckets are private and restricted by size/MIME type.');
