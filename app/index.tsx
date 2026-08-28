import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth/AuthProvider';
import { Loading } from '@/components/UI';

export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return <Loading label="Opening Kayumanggi…" />;
  return <Redirect href={session ? '/home' : '/login'} />;
}
