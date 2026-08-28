import { Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { followPage, getGroups, getIncomingFriendRequests, getPages, getPeople, joinGroup, respondToFriendRequest, sendFriendRequest } from '@/services/api';
import { Empty, Loading, Muted, Title } from '@/components/UI';
import { ActionPill, Avatar, CircleButton, PageTitleBar, SidebarItem } from '@/components/SocialUI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/features/auth/AuthProvider';
import { formatDate } from '@/utils/format';

type CommunityTab = 'requests'|'suggestions'|'groups'|'pages';

export default function CommunityScreen() {
  const { theme } = useTheme();
  const { isPhone, isDesktop } = useBreakpoint();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ tab?: string }>();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<CommunityTab>('requests');
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const people = useQuery({ queryKey: ['people'], queryFn: getPeople });
  const requests = useQuery({ queryKey: ['friend-requests'], queryFn: getIncomingFriendRequests });
  const groups = useQuery({ queryKey: ['groups'], queryFn: getGroups });
  const pages = useQuery({ queryKey: ['pages'], queryFn: getPages });
  const refreshRequests = () => { queryClient.invalidateQueries({ queryKey: ['friend-requests'] }); queryClient.invalidateQueries({ queryKey: ['notifications'] }); queryClient.invalidateQueries({ queryKey: ['notifications-unread'] }); };
  const respond = useMutation({ mutationFn: ({ id, accept }: { id: string; accept: boolean }) => respondToFriendRequest(id, accept), onSuccess: refreshRequests });
  const send = useMutation({ mutationFn: sendFriendRequest, onSuccess: (_data, id) => setHidden((current) => new Set(current).add(id)) });
  const join = useMutation({ mutationFn: joinGroup });
  const follow = useMutation({ mutationFn: followPage });
  const suggestions = (people.data || []).filter((profile) => profile.id !== user?.id && !hidden.has(profile.id));
  const tabs: { id: CommunityTab; label: string; icon: string }[] = [{ id: 'requests', label: 'Friend requests', icon: '◉' }, { id: 'suggestions', label: 'Suggestions', icon: '＋' }, { id: 'groups', label: 'Groups', icon: '◎' }, { id: 'pages', label: 'Pages', icon: '▤' }];

  useEffect(() => { if (params.tab && tabs.some((item) => item.id === params.tab)) setTab(params.tab as CommunityTab); }, [params.tab]);

  return <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.background }}>
    <View style={{ flex: 1 }}>
      {!isDesktop ? <><PageTitleBar title="Community" right={<CircleButton icon="⌕" label="Search people" />} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, padding: 12 }}>{tabs.map((item) => <ActionPill key={item.id} label={item.label} primary={tab === item.id} onPress={() => setTab(item.id)} />)}</ScrollView></> : null}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isPhone ? 14 : 24, paddingBottom: 90, maxWidth: 1500, width: '100%', alignSelf: 'center' }}>
        {tab === 'requests' ? <Section title={`Friend requests${requests.data?.length ? ` (${requests.data.length})` : ''}`}>
          {requests.isLoading ? <Loading /> : requests.error ? <Empty title="Requests unavailable" description={(requests.error as Error).message} /> : requests.data?.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{requests.data.map((request) => { const profile = Array.isArray(request.requester) ? request.requester[0] : request.requester; return <PersonCard key={request.id} name={profile?.full_name || 'Kayumanggi citizen'} avatar={profile?.avatar_url} detail={`${profile?.city || profile?.barangay || 'Community member'} · ${formatDate(request.created_at)}`} wide={isPhone} actions={<><ActionPill label="Confirm" primary disabled={respond.isPending} onPress={() => respond.mutate({ id: request.id, accept: true })} /><ActionPill label="Delete" disabled={respond.isPending} onPress={() => respond.mutate({ id: request.id, accept: false })} /></>} />; })}</View> : <Empty title="No pending friend requests" description="Requests from real Kayumanggi users will appear here." />}
        </Section> : null}
        {tab === 'suggestions' ? <Section title="People you may know">
          {people.isLoading ? <Loading /> : people.error ? <Empty title="Suggestions unavailable" description={(people.error as Error).message} /> : suggestions.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{suggestions.map((profile) => <PersonCard key={profile.id} name={profile.full_name} avatar={profile.avatar_url} detail={profile.city || profile.barangay || profile.username || 'Kayumanggi citizen'} wide={isPhone} actions={<><ActionPill label={send.isPending ? 'Sending…' : 'Add friend'} primary disabled={send.isPending} onPress={() => send.mutate(profile.id)} /><ActionPill label="Remove" onPress={() => setHidden((current) => new Set(current).add(profile.id))} /></>} />)}</View> : <Empty title="No suggestions yet" description="Profiles from real registered users will appear here." />}
          {send.error ? <Text style={{ color: theme.danger, fontSize: 11, marginTop: 12 }}>{(send.error as Error).message}</Text> : null}
        </Section> : null}
        {tab === 'groups' ? <Section title="Discover groups">
          {groups.isLoading ? <Loading /> : groups.error ? <Empty title="Groups unavailable" description={(groups.error as Error).message} /> : groups.data?.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{groups.data.map((group) => <View key={group.id} style={{ width: (isPhone ? '100%' : '31.8%') as any, minHeight: 180, padding: 15, borderRadius: 14, backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border }}><View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: theme.muted, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.info, fontSize: 21, fontWeight: '900' }}>◎</Text></View><Text style={{ color: theme.text, fontSize: 15, fontWeight: '900', marginTop: 12 }}>{group.name}</Text><Muted>{group.visibility} group</Muted><Text numberOfLines={3} style={{ color: theme.textSecondary, fontSize: 11, lineHeight: 16, marginVertical: 9, flex: 1 }}>{group.description || 'Community group'}</Text><ActionPill label="Join group" primary disabled={join.isPending} onPress={() => join.mutate(group.id)} /></View>)}</View> : <Empty title="No groups yet" description="Groups created by real users will appear here." />}
        </Section> : null}
        {tab === 'pages' ? <Section title="Discover pages">
          {pages.isLoading ? <Loading /> : pages.error ? <Empty title="Pages unavailable" description={(pages.error as Error).message} /> : pages.data?.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{pages.data.map((page) => <View key={page.id} style={{ width: (isPhone ? '100%' : '31.8%') as any, minHeight: 180, padding: 15, borderRadius: 14, backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border }}><Avatar name={page.name} uri={page.logo_url} size={52} /><Text style={{ color: theme.text, fontSize: 15, fontWeight: '900', marginTop: 12 }}>{page.name} {page.verified ? <Text style={{ color: theme.info }}>●</Text> : null}</Text><Muted>{page.category || 'Community page'}</Muted><Text numberOfLines={3} style={{ color: theme.textSecondary, fontSize: 11, lineHeight: 16, marginVertical: 9, flex: 1 }}>{page.description || 'Follow this page for updates.'}</Text><ActionPill label={follow.isPending ? 'Following…' : 'Follow page'} primary disabled={follow.isPending} onPress={() => follow.mutate(page.id)} /></View>)}</View> : <Empty title="No pages yet" description="Pages created by real users will appear here." />}
        </Section> : null}
      </ScrollView>
    </View>
  </View>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { const { theme } = useTheme(); return <View style={{ gap: 14 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Title size={20}>{title}</Title><Text style={{ color: theme.info, fontSize: 12, fontWeight: '800' }}>See all</Text></View>{children}</View>; }

function PersonCard({ name, avatar, detail, actions, wide }: { name: string; avatar?: string | null; detail: string; actions: React.ReactNode; wide: boolean }) {
  const { theme } = useTheme();
  return <View style={{ width: (wide ? '100%' : 204) as any, padding: wide ? 0 : 12, borderRadius: 14, backgroundColor: theme.surfaceElevated, borderWidth: wide ? 0 : 1, borderColor: theme.border, flexDirection: wide ? 'row' : 'column', gap: 12 }}><Avatar name={name} uri={avatar} size={wide ? 92 : 110} /><View style={{ flex: 1, justifyContent: 'center' }}><Text numberOfLines={1} style={{ color: theme.text, fontSize: 14, fontWeight: '900' }}>{name}</Text><Muted size={10}>{detail}</Muted><View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>{actions}</View></View></View>;
}
