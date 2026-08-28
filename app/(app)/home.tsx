import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { createPost, getEvents, getMyProfile, getPolls, getPosts } from '@/services/api';
import { pickAndUpload, removeStoredFile } from '@/services/storage';
import { Button, Card, Empty, Field, Loading, Muted, Title } from '@/components/UI';
import { Avatar, SidebarItem } from '@/components/SocialUI';
import { PostCard } from '@/components/PostCard';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { civicModules } from '@/constants/modules';
import { formatDate } from '@/utils/format';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { isPhone, isDesktop } = useBreakpoint();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [media, setMedia] = useState<{ path: string; type: 'image'|'video'; name?: string | null } | null>(null);
  const posts = useQuery({ queryKey: ['posts'], queryFn: getPosts });
  const events = useQuery({ queryKey: ['events'], queryFn: getEvents });
  const polls = useQuery({ queryKey: ['polls'], queryFn: getPolls });
  const profile = useQuery({ queryKey: ['my-profile'], queryFn: getMyProfile });
  const create = useMutation({ mutationFn: () => createPost(body, media?.type === 'video' ? 'media' : 'civic', media), onSuccess: () => { setBody(''); setMedia(null); setExpanded(false); queryClient.invalidateQueries({ queryKey: ['posts'] }); } });
  const attach = async () => { const uploaded = await pickAndUpload('post-media', ['image/*', 'video/mp4']); if (uploaded) { const type = uploaded.mimeType?.startsWith('video/') ? 'video' : 'image'; setMedia({ path: uploaded.path, type, name: uploaded.name }); setExpanded(true); } };
  const discardMedia = async () => { if (media) await removeStoredFile('post-media', media.path); setMedia(null); };
  const closeComposer = async () => { await discardMedia(); setExpanded(false); };

  useEffect(() => {
    const channel = supabase.channel('home-feed').on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => queryClient.invalidateQueries({ queryKey: ['posts'] })).on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => queryClient.invalidateQueries({ queryKey: ['posts'] })).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const quick = civicModules.filter((item) => ['community', 'messages', 'events', 'saved', 'governance', 'polls', 'jobs', 'disaster'].includes(item.slug));
  return <View style={{ flex: 1, backgroundColor: theme.background, flexDirection: 'row' }}>
    {isDesktop ? <ScrollView style={{ width: 310, backgroundColor: theme.background }} contentContainerStyle={{ padding: 14, gap: 3 }}>
      <SidebarItem icon={(profile.data?.full_name || 'K').slice(0, 1)} label={profile.data?.full_name || 'My civic identity'} detail={profile.data?.barangay || profile.data?.city || 'View profile'} onPress={() => router.push('/profile' as never)} />
      {quick.map((item) => <SidebarItem key={item.slug} icon={item.emoji} label={item.title} detail={item.subtitle} onPress={() => router.push((item.route || `/module/${item.slug}`) as never)} />)}
      <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} /><Muted size={10}>Kayumanggi connects residents, communities, and accountable public services.</Muted>
    </ScrollView> : null}

    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: isPhone ? 8 : 16, paddingBottom: 90, alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 680, gap: isPhone ? 8 : 12 }}>
        <Card style={{ borderRadius: isPhone ? 0 : 14, borderLeftWidth: isPhone ? 0 : 1, borderRightWidth: isPhone ? 0 : 1, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><Avatar name={profile.data?.full_name} uri={profile.data?.avatar_url} online size={42} /><Pressable onPress={() => setExpanded(true)} style={{ flex: 1, minHeight: 42, borderRadius: 22, paddingHorizontal: 15, justifyContent: 'center', backgroundColor: theme.surfaceHover }}><Text style={{ color: theme.mutedFg, fontSize: 13 }}>What’s happening in your community?</Text></Pressable><Pressable onPress={attach} style={{ alignItems: 'center', paddingHorizontal: 5 }}><Text style={{ color: theme.active, fontSize: 21 }}>▣</Text><Text style={{ color: theme.mutedFg, fontSize: 9 }}>Photo</Text></Pressable></View>
          {expanded ? <View style={{ gap: 9 }}><Field multiline autoFocus value={body} onChangeText={setBody} placeholder="Share an update, question, public concern, or community activity…" maxLength={10000} style={{ minHeight: 92, textAlignVertical: 'top', borderWidth: 0, backgroundColor: theme.surfaceHover }} />{media ? <View style={{ padding: 10, borderRadius: 10, backgroundColor: theme.surfaceHover, flexDirection: 'row', justifyContent: 'space-between' }}><Muted>Attached: {media.name || media.type}</Muted><Pressable onPress={discardMedia}><Text style={{ color: theme.danger, fontWeight: '900' }}>Remove</Text></Pressable></View> : null}{create.error ? <Text style={{ color: theme.danger, fontSize: 11 }}>{(create.error as Error).message}</Text> : null}<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Muted size={10}>Public · Civic standards apply</Muted><View style={{ flexDirection: 'row', gap: 7 }}><Button variant="ghost" onPress={closeComposer}>Close</Button><Button disabled={!body.trim() || create.isPending} onPress={() => create.mutate()}>{create.isPending ? 'Posting…' : 'Post'}</Button></View></View></View> : null}
        </Card>

        {events.data?.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: isPhone ? 10 : 0, gap: 8 }}>
          {events.data.slice(0, 8).map((event) => <Pressable key={event.id} onPress={() => router.push('/events' as never)} style={{ width: 132, height: 170, borderRadius: 14, overflow: 'hidden', backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border, padding: 11, justifyContent: 'flex-end' }}><View style={{ position: 'absolute', left: 10, top: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: theme.purple, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontWeight: '900' }}>□</Text></View><Text numberOfLines={3} style={{ color: theme.text, fontSize: 12, lineHeight: 16, fontWeight: '900' }}>{event.title}</Text><Muted size={9}>{formatDate(event.starts_at)}</Muted></Pressable>)}
        </ScrollView> : null}

        {posts.isLoading ? <Loading label="Loading your civic feed…" /> : posts.error ? <Empty title="Feed unavailable" description={(posts.error as Error).message} /> : posts.data?.length ? posts.data.map((post) => <PostCard key={post.id} post={post} />) : <Empty title="Your feed is ready" description="Posts created by real Kayumanggi users will appear here. Create the first community update above." />}
      </View>
    </ScrollView>

    {isDesktop ? <ScrollView style={{ width: 320, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Title size={15}>Civic pulse</Title><Text style={{ color: theme.info, fontSize: 11, fontWeight: '800' }}>See all</Text></View>
      {polls.data?.length ? <Card style={{ gap: 11 }}><Text style={{ color: theme.mutedFg, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>ACTIVE POLLS</Text>{polls.data.slice(0, 4).map((poll) => <Pressable key={poll.id} onPress={() => router.push('/polls' as never)}><Text style={{ color: theme.text, fontSize: 12, lineHeight: 17, fontWeight: '800' }}>{poll.question}</Text><Text style={{ color: theme.info, fontSize: 10, marginTop: 2 }}>Vote now</Text></Pressable>)}</Card> : null}
      {events.data?.length ? <Card style={{ gap: 11 }}><Text style={{ color: theme.mutedFg, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>UPCOMING</Text>{events.data.slice(0, 4).map((event) => <Pressable key={event.id} onPress={() => router.push('/events' as never)}><Text style={{ color: theme.text, fontSize: 12, fontWeight: '800' }}>{event.title}</Text><Muted size={9}>{formatDate(event.starts_at)}</Muted></Pressable>)}</Card> : null}
      {!polls.data?.length && !events.data?.length ? <Muted>Polls and events from your Supabase project will appear here.</Muted> : null}
    </ScrollView> : null}
  </View>;
}
