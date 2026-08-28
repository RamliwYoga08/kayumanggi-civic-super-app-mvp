import { Redirect, Slot } from 'expo-router';
import { AppShell } from '@/components/AppShell';
import { Loading } from '@/components/UI';
import { useAuth } from '@/features/auth/AuthProvider';
import { hasSupabaseConfig } from '@/lib/supabase';

export default function AppLayout() {
  const { session, loading } = useAuth();
  if (loading) return <Loading label="Restoring secure session…" />;
  if (!hasSupabaseConfig) return <Redirect href="/login" />;
  if (!session) return <Redirect href="/login" />;
  return <AppShell><Slot /></AppShell>;
}
