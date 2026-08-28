import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Field, Muted, Title } from '@/components/UI';
import { useAuth } from '@/features/auth/AuthProvider';
import { useTheme } from '@/features/theme/ThemeProvider';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const { theme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const update = async () => {
    setError(''); setMessage('');
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) return setError(updateError.message);
    setMessage('Password updated successfully.');
    setTimeout(() => router.replace('/home'), 500);
  };

  return <View style={{flex:1,backgroundColor:theme.background,justifyContent:'center',padding:18}}>
    <View style={{width:'100%',maxWidth:430,alignSelf:'center',gap:14}}>
      <Title>Choose a new password</Title>
      <Muted>The recovery link establishes a temporary secure session, then this screen updates your password.</Muted>
      <Card style={{gap:12}}>
        {!loading && !session ? <Text style={{color:theme.warning,fontSize:12}}>Open this page from the recovery link in your email. If the link expired, request another reset email.</Text> : null}
        <Field secureTextEntry placeholder="New password" value={password} onChangeText={setPassword}/>
        <Field secureTextEntry placeholder="Confirm new password" value={confirm} onChangeText={setConfirm}/>
        {error ? <Text style={{color:theme.danger,fontSize:12}}>{error}</Text> : null}
        {message ? <Text style={{color:theme.active,fontSize:12}}>{message}</Text> : null}
        <Button disabled={busy || loading || !session || !password || !confirm} onPress={update}>{busy ? 'Updating…' : 'Update password'}</Button>
        <Button variant="ghost" onPress={() => router.replace('/login')}>Back to login</Button>
      </Card>
    </View>
  </View>;
}
