import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createConversationWithUser, getConversations, getMessages, getPeople, sendMessage } from '@/services/api';
import { Button, Empty, Field, Loading, Muted, Title } from '@/components/UI';
import { Avatar, CircleButton, PageTitleBar, SearchBox } from '@/components/SocialUI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/format';
import type { Conversation } from '@/types/domain';

function conversationIdentity(conversation: Conversation, me?: string) {
  const member = conversation.members?.find((item) => item.user_id !== me);
  const profile = Array.isArray(member?.profile) ? member?.profile[0] : member?.profile;
  return { name: conversation.title || profile?.full_name || (conversation.kind === 'group' ? 'Group conversation' : 'Direct conversation'), avatar: profile?.avatar_url || null };
}

export default function MessagesScreen() {
  const { theme } = useTheme();
  const { isPhone, isDesktop } = useBreakpoint();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [search, setSearch] = useState('');
  const [showPeople, setShowPeople] = useState(false);
  const conversations = useQuery({ queryKey: ['conversations'], queryFn: getConversations });
  const people = useQuery({ queryKey: ['people'], queryFn: getPeople });
  const selectedConversation = conversations.data?.find((item) => item.id === selected);
  const identity = selectedConversation ? conversationIdentity(selectedConversation, user?.id) : null;
  const filtered = useMemo(() => (conversations.data || []).filter((item) => conversationIdentity(item, user?.id).name.toLowerCase().includes(search.trim().toLowerCase())), [conversations.data, search, user?.id]);
  const messages = useQuery({ queryKey: ['messages', selected], queryFn: () => getMessages(selected!), enabled: Boolean(selected) });
  const send = useMutation({ mutationFn: () => sendMessage(selected!, body), onSuccess: () => { setBody(''); queryClient.invalidateQueries({ queryKey: ['messages', selected] }); queryClient.invalidateQueries({ queryKey: ['conversations'] }); } });
  const start = useMutation({ mutationFn: createConversationWithUser, onSuccess: (id) => { queryClient.invalidateQueries({ queryKey: ['conversations'] }); setSelected(id); setShowPeople(false); } });

  useEffect(() => { if (!isPhone && !selected && conversations.data?.[0]) setSelected(conversations.data[0].id); }, [conversations.data, isPhone, selected]);
  useEffect(() => { if (!selected) return; const channel = supabase.channel(`messages:${selected}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selected}` }, () => queryClient.invalidateQueries({ queryKey: ['messages', selected] })).subscribe(); return () => { supabase.removeChannel(channel); }; }, [selected, queryClient]);

  const list = <View style={{ flex: 1, backgroundColor: theme.surface }}>
    <PageTitleBar title="Chats" right={<View style={{ flexDirection: 'row', gap: 7 }}><CircleButton icon="•••" label="Chat settings" /><CircleButton icon="✎" label="New message" onPress={() => setShowPeople((value) => !value)} /></View>} />
    <View style={{ padding: 12 }}><SearchBox value={search} onChangeText={setSearch} placeholder="Search messages" /></View>
    {showPeople ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 13, paddingHorizontal: 12, paddingBottom: 12 }}>{(people.data || []).filter((profile) => profile.id !== user?.id).map((profile) => <Pressable key={profile.id} onPress={() => start.mutate(profile.id)} style={{ width: 60, alignItems: 'center', gap: 5 }}><Avatar name={profile.full_name} uri={profile.avatar_url} size={50} /><Text numberOfLines={1} style={{ color: theme.text, fontSize: 9, width: 60, textAlign: 'center' }}>{profile.full_name}</Text></Pressable>)}</ScrollView> : null}
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 50 }}>
      {conversations.isLoading ? <Loading /> : filtered.length ? filtered.map((conversation) => { const item = conversationIdentity(conversation, user?.id); return <Pressable key={conversation.id} onPress={() => setSelected(conversation.id)} style={({ pressed }) => ({ padding: 9, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: selected === conversation.id ? `${theme.info}18` : pressed ? theme.surfaceHover : 'transparent' })}><Avatar name={item.name} uri={item.avatar} size={50} online /><View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: theme.text, fontSize: 13, fontWeight: '800' }}>{item.name}</Text><Muted size={10}>{formatDate(conversation.updated_at)}</Muted></View></Pressable>; }) : <View style={{ padding: 12 }}><Empty title={search ? 'No matching chats' : 'No conversations yet'} description={search ? 'Try another name.' : 'Tap the compose button to message a registered user.'} /></View>}
    </ScrollView>
  </View>;

  const chat = <View style={{ flex: 1, backgroundColor: theme.surfaceElevated }}>
    <PageTitleBar title={identity?.name || 'Conversation'} subtitle="Private conversation" left={isPhone ? <CircleButton icon="‹" label="Back to chats" onPress={() => setSelected(null)} /> : identity ? <Avatar name={identity.name} uri={identity.avatar} size={38} /> : undefined} right={<View style={{ flexDirection: 'row', gap: 7 }}><CircleButton icon="⌕" label="Search conversation" /><CircleButton icon="ⓘ" label="Conversation info" /></View>} />
    {!selected ? <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}><Empty title="Select a conversation" description="Choose a chat or start a new private conversation." /></View> : messages.isLoading ? <Loading /> : <><ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 8, justifyContent: 'flex-end' }}>
      {!messages.data?.length ? <View style={{ alignItems: 'center', paddingVertical: 30 }}><Avatar name={identity?.name} uri={identity?.avatar} size={72} /><Title size={17}>{identity?.name || 'New conversation'}</Title><Muted>Messages are visible only to conversation members.</Muted></View> : null}
      {(messages.data || []).map((message) => { const mine = message.sender_id === user?.id; return <View key={message.id} style={{ flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}><Avatar name={mine ? 'You' : identity?.name} uri={mine ? null : identity?.avatar} size={26} /><View style={{ maxWidth: '72%', backgroundColor: mine ? theme.info : theme.surfaceHover, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 }}><Text style={{ color: mine ? '#fff' : theme.text, fontSize: 13, lineHeight: 18 }}>{message.body}</Text></View></View>; })}
    </ScrollView><View style={{ minHeight: 64, padding: 10, borderTopWidth: 1, borderTopColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 7 }}><CircleButton icon="＋" label="Add attachment" /><Field value={body} onChangeText={setBody} onSubmitEditing={() => body.trim() && send.mutate()} placeholder="Aa" style={{ flex: 1, borderWidth: 0, borderRadius: 20, backgroundColor: theme.surfaceHover }} /><Button disabled={!body.trim() || send.isPending} onPress={() => send.mutate()}>Send</Button></View></>}
  </View>;

  return <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.background }}>
    {(!isPhone || !selected) ? <View style={{ width: isPhone ? '100%' : 350, borderRightWidth: isPhone ? 0 : 1, borderRightColor: theme.border }}>{list}</View> : null}
    {(!isPhone || selected) ? chat : null}
    {isDesktop && selectedConversation ? <View style={{ width: 300, borderLeftWidth: 1, borderLeftColor: theme.border, backgroundColor: theme.surface, padding: 22, alignItems: 'center', gap: 10 }}><Avatar name={identity?.name} uri={identity?.avatar} size={78} /><Title size={17}>{identity?.name || 'Conversation'}</Title><Muted>Private · Supabase RLS protected</Muted><View style={{ width: '100%', height: 1, backgroundColor: theme.border, marginVertical: 12 }} /><Text style={{ color: theme.text, fontWeight: '800', alignSelf: 'flex-start' }}>Chat information</Text><Muted>Media and file attachments can be added without exposing other conversations.</Muted></View> : null}
  </View>;
}
