import { Session, User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import * as Linking from 'expo-linking';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';
import { handleSupabaseAuthUrl } from '@/lib/authDeepLink';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }
    const establishInitialSession = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        try {
          await handleSupabaseAuthUrl(initialUrl);
        } catch {
          // Expired or malformed auth links must not prevent a normal session restore.
        }
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } finally {
        setLoading(false);
      }
    };
    establishInitialSession().catch(() => setLoading(false));

    const authUrlSubscription = Linking.addEventListener('url', ({ url }) => {
      handleSupabaseAuthUrl(url).catch(() => undefined);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      authUrlSubscription.remove();
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    signOut: async () => { await supabase.auth.signOut(); },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
