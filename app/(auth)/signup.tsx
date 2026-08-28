import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Field, Muted, Title } from '@/components/UI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const router = useRouter(); const { theme } = useTheme();
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [error,setError]=useState(''); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
  const signup = async () => {
    setBusy(true); setError(''); setMessage('');
    const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } });
    if (authError) setError(authError.message); else if (!data.session) setMessage('Account created. Check your email to confirm the account, then sign in.');
    setBusy(false);
  };
  return <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{ flex:1,backgroundColor:theme.background,justifyContent:'center',padding:18 }}><View style={{ width:'100%',maxWidth:430,alignSelf:'center',gap:14 }}><Title>Create civic account</Title><Muted>Your profile is private by default except for fields you choose to publish.</Muted><Card style={{gap:12}}><Field placeholder="Full name" value={name} onChangeText={setName}/><Field autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail}/><Field secureTextEntry placeholder="Password (8+ characters)" value={password} onChangeText={setPassword}/>{error?<Text style={{color:theme.danger,fontSize:12}}>{error}</Text>:null}{message?<Text style={{color:theme.active,fontSize:12}}>{message}</Text>:null}<Button disabled={busy||!name||!email||password.length<8} onPress={signup}>{busy?'Creating…':'Create account'}</Button><Button variant="ghost" onPress={()=>router.back()}>Back to sign in</Button></Card></View></KeyboardAvoidingView>;
}
