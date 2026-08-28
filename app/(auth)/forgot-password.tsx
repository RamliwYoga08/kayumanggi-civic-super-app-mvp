import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Button, Card, Field, Muted, Title } from '@/components/UI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const router=useRouter(); const {theme}=useTheme(); const [email,setEmail]=useState(''); const [message,setMessage]=useState(''); const [error,setError]=useState('');
  const send=async()=>{ setMessage('');setError(''); const {error:e}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:Linking.createURL('/reset-password')}); if(e)setError(e.message);else setMessage('Reset email sent. Follow the secure link from your inbox.'); };
  return <View style={{flex:1,backgroundColor:theme.background,justifyContent:'center',padding:18}}><View style={{width:'100%',maxWidth:430,alignSelf:'center',gap:14}}><Title>Reset password</Title><Muted>Supabase will email a recovery link to the account.</Muted><Card style={{gap:12}}><Field autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail}/>{error?<Text style={{color:theme.danger,fontSize:12}}>{error}</Text>:null}{message?<Text style={{color:theme.active,fontSize:12}}>{message}</Text>:null}<Button disabled={!email} onPress={send}>Send reset link</Button><Button variant="ghost" onPress={()=>router.back()}>Back</Button></Card></View></View>;
}
