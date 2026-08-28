import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/api';
import { Empty, Loading } from '@/components/UI';
import { Avatar, CircleButton, PageTitleBar } from '@/components/SocialUI';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { formatDate } from '@/utils/format';
import { supabase } from '@/lib/supabase';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { isPhone } = useBreakpoint();
  const router = useRouter();
  const queryClient = useQueryClient();
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: getNotifications });
  const refresh = () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); queryClient.invalidateQueries({ queryKey: ['notifications-unread'] }); };
  const read = useMutation({ mutationFn: markNotificationRead, onSuccess: refresh });
  const readAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: refresh });

  useEffect(() => {
    const channel = supabase.channel('notifications-screen').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, refresh).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openNotification = (item: NonNullable<typeof notifications.data>[number]) => {
    if (!item.read_at) read.mutate(item.id);
    if (item.type === 'friend_request') router.push('/community' as never);
    else if (item.entity_type === 'conversation') router.push('/messages' as never);
  };

  return <View style={{ flex: 1, backgroundColor: theme.surface }}>
    <PageTitleBar title="Notifications" subtitle="Account and civic activity" left={isPhone ? <CircleButton icon="‹" label="Back" onPress={() => router.back()} /> : undefined} right={<View style={{ flexDirection: 'row', gap: 7 }}><CircleButton icon="✓" label="Mark all read" onPress={() => readAll.mutate()} /><CircleButton icon="⌕" label="Search notifications" /></View>} />
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ width: '100%', maxWidth: 760, alignSelf: 'center', paddingVertical: 14, paddingBottom: 80 }}>
      {notifications.isLoading ? <Loading label="Loading notifications…" /> : notifications.error ? <Empty title="Notifications unavailable" description={(notifications.error as Error).message} /> : notifications.data?.length ? <View>
        <Text style={{ color: theme.text, fontSize: 17, fontWeight: '900', paddingHorizontal: 16, paddingVertical: 10 }}>Earlier</Text>
        {notifications.data.map((item) => <Pressable key={item.id} onPress={() => openNotification(item)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 13, backgroundColor: item.read_at ? theme.surface : `${theme.info}12`, opacity: pressed ? .72 : 1 })}>
          <Avatar name={item.title} size={58} />
          <View style={{ flex: 1, paddingTop: 2 }}><Text style={{ color: theme.text, fontSize: 14, lineHeight: 19, fontWeight: item.read_at ? '600' : '900' }}>{item.title}</Text>{item.body ? <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 2 }}>{item.body}</Text> : null}<Text style={{ color: item.read_at ? theme.mutedFg : theme.info, fontSize: 11, fontWeight: '700', marginTop: 5 }}>{formatDate(item.created_at)}</Text></View>
          <Text style={{ color: theme.mutedFg, fontWeight: '900', paddingTop: 4 }}>•••</Text>
        </Pressable>)}
      </View> : <View style={{ padding: 16 }}><Empty title="You’re all caught up" description="Notifications from your real account activity will appear here." /></View>}
    </ScrollView>
  </View>;
}
