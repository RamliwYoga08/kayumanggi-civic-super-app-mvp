import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { createPost, getEvents, getPolls, getPosts } from '@/services/api';
import { Button, Card, Empty, Field, Loading, Muted, SectionHeader, Title } from '@/components/UI';
import { PostCard } from '@/components/PostCard';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { civicModules } from '@/constants/modules';
import { formatDate } from '@/utils/format';
import { supabase } from '@/lib/supabase';

export default function HomeScreen(){
 const {theme}=useTheme(); const {isPhone,isDesktop}=useBreakpoint(); const router=useRouter(); const qc=useQueryClient(); const [body,setBody]=useState('');
 const posts=useQuery({queryKey:['posts'],queryFn:getPosts}); const events=useQuery({queryKey:['events'],queryFn:getEvents}); const polls=useQuery({queryKey:['polls'],queryFn:getPolls});
 const create=useMutation({mutationFn:()=>createPost(body),onSuccess:()=>{setBody('');qc.invalidateQueries({queryKey:['posts']});}});
 useEffect(()=>{const channel=supabase.channel('home-feed').on('postgres_changes',{event:'*',schema:'public',table:'posts'},()=>qc.invalidateQueries({queryKey:['posts']})).on('postgres_changes',{event:'*',schema:'public',table:'comments'},()=>qc.invalidateQueries({queryKey:['posts']})).subscribe();return()=>{supabase.removeChannel(channel);};},[qc]);
 const quick=civicModules.filter((m)=>['messages','community','marketplace','events','saved','profiling','polls','jobs'].includes(m.slug));
 return <View style={{flex:1,backgroundColor:theme.background,flexDirection:'row'}}>
  {isDesktop?<ScrollView style={{width:250,borderRightWidth:1,borderRightColor:theme.border,backgroundColor:theme.surface}} contentContainerStyle={{padding:12,gap:4}}><Card style={{marginBottom:8}}><Text style={{color:theme.text,fontWeight:'900'}}>My Civic Identity</Text><Muted size={10}>Verified citizen workspace</Muted></Card>{quick.map((m)=><Pressable key={m.slug} onPress={()=>router.push((m.route||`/module/${m.slug}`) as never)} style={{flexDirection:'row',gap:10,padding:10,borderRadius:9}}><Text style={{color:m.color,width:20,textAlign:'center'}}>{m.emoji}</Text><Text style={{color:theme.mutedFg,fontSize:12,fontWeight:'700'}}>{m.title}</Text></Pressable>)}</ScrollView>:null}
  <ScrollView style={{flex:1}} contentContainerStyle={{padding:isPhone?10:16,paddingBottom:80,alignItems:'center'}}><View style={{width:'100%',maxWidth:700,gap:12}}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10,paddingVertical:2}}>{['Civic','Emergency','Image','Video','Govt'].map((label,i)=><View key={label} style={{alignItems:'center',gap:4}}><View style={{width:48,height:48,borderRadius:24,borderWidth:2,borderColor:[theme.info,theme.danger,theme.purple,theme.active,theme.warning][i],alignItems:'center',justifyContent:'center'}}><Text style={{color:theme.text,fontWeight:'900'}}>{label[0]}</Text></View><Muted size={9}>{label}</Muted></View>)}</ScrollView>
    <Card style={{gap:10}}><Text style={{color:theme.text,fontWeight:'800'}}>Create a civic post</Text><Field multiline value={body} onChangeText={setBody} placeholder="Share an update, question, public concern, or community activity…" style={{minHeight:74,textAlignVertical:'top'}}/><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Muted size={10}>Public · community standards apply</Muted><Button disabled={!body.trim()||create.isPending} onPress={()=>create.mutate()}>{create.isPending?'Posting…':'Post'}</Button></View></Card>
    {posts.isLoading?<Loading label="Loading civic feed…"/>:posts.error?<Empty title="Feed unavailable" description={(posts.error as Error).message}/>:posts.data?.length?posts.data.map((p)=><PostCard key={p.id} post={p}/>):<Empty title="No posts yet" description="Create the first post or run the included demo seed."/>}
  </View></ScrollView>
  {isDesktop?<ScrollView style={{width:300,borderLeftWidth:1,borderLeftColor:theme.border,backgroundColor:theme.surface}} contentContainerStyle={{padding:14,gap:12}}><SectionHeader title="Civic pulse" subtitle="Upcoming and active"/><Card><Title size={14}>Upcoming Events</Title><View style={{gap:10,marginTop:10}}>{(events.data||[]).slice(0,3).map(e=><Pressable key={e.id} onPress={()=>router.push('/events' as never)}><Text style={{color:theme.text,fontSize:12,fontWeight:'800'}}>{e.title}</Text><Muted size={9}>{formatDate(e.starts_at)}</Muted></Pressable>)}</View></Card><Card><Title size={14}>Active Polls</Title><View style={{gap:10,marginTop:10}}>{(polls.data||[]).slice(0,3).map(p=><Pressable key={p.id} onPress={()=>router.push('/polls' as never)}><Text style={{color:theme.text,fontSize:12,fontWeight:'800'}}>{p.question}</Text><Muted size={9}>Tap to vote</Muted></Pressable>)}</View></Card><Card><Title size={14}>Trending Topics</Title><Muted>#Transparency · #Barangay · #Jobs · #DisasterReady · #Environment</Muted></Card></ScrollView>:null}
 </View>;
}
