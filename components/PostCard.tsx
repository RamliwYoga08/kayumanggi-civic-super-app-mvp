import { Image, Pressable, Share, Text, View } from 'react-native';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addComment, saveEntity, togglePostLike } from '@/services/api';
import { signedUrl } from '@/services/storage';
import type { Post } from '@/types/domain';
import { Card, Field, Muted } from '@/components/UI';
import { Avatar } from '@/components/SocialUI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/features/auth/AuthProvider';
import { formatDate } from '@/utils/format';

export function PostCard({ post }: { post: Post }) {
  const { theme } = useTheme();
  const { isPhone } = useBreakpoint();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['posts'] });
  const like = useMutation({ mutationFn: () => togglePostLike(post.id), onSuccess: refresh });
  const save = useMutation({ mutationFn: () => saveEntity('post', post.id) });
  const commentMutation = useMutation({ mutationFn: () => addComment(post.id, comment), onSuccess: () => { setComment(''); refresh(); } });
  const media = useQuery({ queryKey: ['post-media-url', post.media_path], queryFn: () => signedUrl('post-media', post.media_path!, 3600), enabled: Boolean(post.media_path) });
  const reactions = post.post_reactions || [];
  const liked = reactions.some((reaction) => reaction.user_id === user?.id && reaction.reaction === 'like');
  const profile = Array.isArray(post.profile) ? post.profile[0] : post.profile;

  return <Card style={{ gap: 11, borderRadius: isPhone ? 0 : 14, borderLeftWidth: isPhone ? 0 : 1, borderRightWidth: isPhone ? 0 : 1, paddingHorizontal: isPhone ? 14 : 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Avatar name={profile?.full_name} uri={profile?.avatar_url} size={42} /><View style={{ flex: 1 }}><Text style={{ color: theme.text, fontWeight: '900', fontSize: 13 }}>{profile?.full_name || 'Kayumanggi Civic Desk'} {profile?.is_verified ? <Text style={{ color: theme.info }}>●</Text> : null}</Text><Muted size={10}>{formatDate(post.created_at)} · {post.kind} · Public</Muted></View><Pressable accessibilityLabel="Post options" style={{ padding: 8 }}><Text style={{ color: theme.mutedFg, fontWeight: '900' }}>•••</Text></Pressable></View>
    <Text style={{ color: theme.text, fontSize: 14, lineHeight: 20 }}>{post.body}</Text>
    {post.media_path ? post.media_type === 'image' && media.data ? <Image source={{ uri: media.data }} resizeMode="cover" style={{ width: '100%', aspectRatio: 1.1, backgroundColor: theme.muted, borderRadius: isPhone ? 0 : 10 }} /> : <View style={{ width: '100%', aspectRatio: 1.5, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}><Text style={{ color: '#fff', fontSize: 34 }}>▶</Text><Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', marginTop: 8 }}>{media.isLoading ? 'Loading media…' : 'Video attachment'}</Text></View> : null}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}><Muted size={10}>{reactions.length ? `● ${reactions.length} reaction${reactions.length === 1 ? '' : 's'}` : 'Be the first to react'}</Muted><Muted size={10}>{post.comments?.length || 0} comments</Muted></View>
    <View style={{ height: 1, backgroundColor: theme.border }} />
    <View style={{ flexDirection: 'row' }}>
      <PostAction label="Like" icon={liked ? '●' : '♡'} active={liked} onPress={() => like.mutate()} />
      <PostAction label="Comment" icon="○" onPress={() => undefined} />
      <PostAction label="Share" icon="↗" onPress={() => Share.share({ message: post.body })} />
      <PostAction label="Save" icon="☆" onPress={() => save.mutate()} />
    </View>
    {(post.comments || []).slice(-3).map((item) => { const author = Array.isArray(item.profile) ? item.profile[0] : item.profile; return <View key={item.id} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}><Avatar name={author?.full_name} uri={author?.avatar_url} size={30} /><View style={{ maxWidth: '86%', backgroundColor: theme.surfaceHover, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 8 }}><Text style={{ color: theme.text, fontSize: 11, fontWeight: '900' }}>{author?.full_name || 'Citizen'}</Text><Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 1 }}>{item.body}</Text></View></View>; })}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Avatar name="You" size={30} /><Field value={comment} onChangeText={setComment} onSubmitEditing={() => comment.trim() && commentMutation.mutate()} placeholder="Write a comment…" style={{ flex: 1, minHeight: 38, borderWidth: 0, borderRadius: 20, backgroundColor: theme.surfaceHover }} /><Pressable disabled={!comment.trim() || commentMutation.isPending} onPress={() => commentMutation.mutate()} style={{ padding: 8, opacity: comment.trim() ? 1 : .35 }}><Text style={{ color: theme.info, fontWeight: '900' }}>➤</Text></Pressable></View>
  </Card>;
}

function PostAction({ label, icon, active = false, onPress }: { label: string; icon: string; active?: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, minHeight: 38, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: pressed ? theme.surfaceHover : 'transparent' })}><Text style={{ color: active ? theme.info : theme.mutedFg, fontWeight: '900' }}>{icon}</Text><Text style={{ color: active ? theme.info : theme.mutedFg, fontSize: 11, fontWeight: '800' }}>{label}</Text></Pressable>;
}
