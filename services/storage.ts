import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { supabase } from '@/lib/supabase';

const SAFE_NAME = /[^a-zA-Z0-9._-]+/g;

export async function pickAndUpload(bucket: 'avatars'|'post-media'|'marketplace-media'|'message-attachments'|'civic-evidence', mimeTypes?: string[]) {
  const result = await DocumentPicker.getDocumentAsync({ type: mimeTypes?.length ? mimeTypes : '*/*', copyToCacheDirectory: true, multiple: false });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error('You must be signed in.');
  const file = new File(asset.uri);
  const bytes = await file.arrayBuffer();
  const safeName = (asset.name || `upload-${Date.now()}`).replace(SAFE_NAME, '-');
  const path = `${auth.user.id}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType: asset.mimeType || undefined, upsert: false });
  if (error) throw error;
  return { bucket, path, name: asset.name, mimeType: asset.mimeType, size: asset.size };
}

export async function signedUrl(bucket: string, path: string, expiresIn = 900) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeStoredFile(bucket: 'avatars'|'post-media'|'marketplace-media'|'message-attachments'|'civic-evidence', path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
