import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment, saveEntity, togglePostLike } from '@/services/api';
import type { Post } from '@/types/domain';
import { Card, Field, Muted } from '@/components/UI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { formatDate } from '@/utils/format';

export function PostCard({ post }: { post: Post }) {
  const { theme } = useTheme(); const { user } = useAuth(); const qc = useQueryClient(); const [comment,setComment]=useState('');
  const refresh=()=>qc.invalidateQueries({queryKey:['posts']});
  const like=useMutation({mutationFn:()=>togglePostLike(post.id),onSuccess:refresh});
  const save=useMutation({mutationFn:()=>saveEntity('post',post.id)});
  const commentMutation=useMutation({mutationFn:()=>addComment(post.id,comment),onSuccess:()=>{setComment('');refresh();}});
  const reactions=post.post_reactions||[]; const liked=reactions.some((r)=>r.user_id===user?.id&&r.reaction==='like');
  const profile = Array.isArray(post.profile) ? post.profile[0] : post.profile;
  return <Card style={{ gap: 12 }}>
    <View style={{ flexDirection:'row',alignItems:'center',gap:10 }}><View style={{width:40,height:40,borderRadius:20,backgroundColor:theme.muted,alignItems:'center',justifyContent:'center'}}><Text style={{color:theme.text,fontWeight:'900'}}>{(profile?.full_name||'K').slice(0,1).toUpperCase()}</Text></View><View style={{flex:1}}><Text style={{color:theme.text,fontWeight:'800',fontSize:13}}>{profile?.full_name||'Kayumanggi Civic Desk'} {profile?.is_verified?'✓':''}</Text><Muted size={10}>{formatDate(post.created_at)} · {post.kind}</Muted></View><Text style={{color:theme.mutedFg}}>•••</Text></View>
    <Text style={{color:theme.text,fontSize:14,lineHeight:21}}>{post.body}</Text>
    <View style={{flexDirection:'row',justifyContent:'space-between'}}><Muted size={10}>{reactions.length} reactions</Muted><Muted size={10}>{post.comments?.length||0} comments</Muted></View>
    <View style={{height:1,backgroundColor:theme.border}}/>
    <View style={{flexDirection:'row',gap:8}}><Pressable onPress={()=>like.mutate()} style={{flex:1,padding:10,alignItems:'center',borderRadius:10,backgroundColor:liked?`${theme.info}22`:theme.background}}><Text style={{color:liked?theme.info:theme.mutedFg,fontWeight:'800',fontSize:12}}>♡ Like</Text></Pressable><Pressable onPress={()=>save.mutate()} style={{flex:1,padding:10,alignItems:'center',borderRadius:10}}><Text style={{color:theme.mutedFg,fontWeight:'800',fontSize:12}}>★ Save</Text></Pressable></View>
    {(post.comments||[]).slice(-2).map((c)=><View key={c.id} style={{backgroundColor:theme.background,borderRadius:12,padding:10}}><Text style={{color:theme.text,fontSize:11,fontWeight:'800'}}>{(Array.isArray(c.profile)?c.profile[0]:c.profile)?.full_name||'Citizen'}</Text><Text style={{color:theme.textSecondary,fontSize:12,marginTop:2}}>{c.body}</Text></View>)}
    <View style={{flexDirection:'row',gap:8}}><Field value={comment} onChangeText={setComment} placeholder="Write a comment…" style={{flex:1,minHeight:38}}/><Pressable disabled={!comment.trim()||commentMutation.isPending} onPress={()=>commentMutation.mutate()} style={{paddingHorizontal:14,alignItems:'center',justifyContent:'center',borderRadius:10,backgroundColor:theme.info,opacity:!comment.trim()?0.4:1}}><Text style={{color:'#fff',fontWeight:'900'}}>Send</Text></Pressable></View>
  </Card>;
}
