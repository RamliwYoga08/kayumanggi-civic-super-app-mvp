import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Button, Card, Field, Muted, Title } from '@/components/UI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (session) return <Redirect href="/home" />;

  const login = async () => {
    setBusy(true); setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError(authError.message);
    setBusy(false);
  };

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: 18 }}>
    <View style={{ width: '100%', maxWidth: 430, alignSelf: 'center', gap: 14 }}>
      <View style={{ alignItems: 'center', gap: 8, marginBottom: 4 }}><View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.info, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontWeight: '900', fontSize: 28 }}>K</Text></View><Title size={28}>Kayumanggi</Title><Muted>Civic Super App · Social + governance + services</Muted></View>
      {!hasSupabaseConfig ? <Card style={{ borderColor: theme.warning }}><Text style={{ color: theme.warning, fontWeight: '800', marginBottom: 5 }}>Supabase setup required</Text><Muted>Copy .env.example to .env and paste your Project URL and publishable key. The included SUPABASE_SETUP.md walks through the database, RLS, Auth, Storage, and seed setup.</Muted></Card> : null}
      <Card style={{ gap: 12 }}><Field autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail} /><Field secureTextEntry placeholder="Password" value={password} onChangeText={setPassword} />{error ? <Text style={{ color: theme.danger, fontSize: 12 }}>{error}</Text> : null}<Button disabled={!hasSupabaseConfig || busy || !email || !password} onPress={login}>{busy ? 'Signing in…' : 'Sign in'}</Button><Button variant="secondary" onPress={() => router.push('/signup')}>Create account</Button><Button variant="ghost" onPress={() => router.push('/forgot-password')}>Forgot password</Button></Card>
    </View>
  </KeyboardAvoidingView>;
}
