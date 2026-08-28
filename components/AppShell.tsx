import { PropsWithChildren, useEffect } from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { CircleButton, SearchBox } from '@/components/SocialUI';
import { getUnreadNotificationCount } from '@/services/api';
import { supabase } from '@/lib/supabase';

const nav = [
  { route: '/home', label: 'Home', icon: '⌂' },
  { route: '/community', label: 'Community', icon: '◎' },
  { route: '/messages', label: 'Messages', icon: '✉' },
  { route: '/reels', label: 'Reels', icon: '▶' },
  { route: '/notifications', label: 'Notifications', icon: '♢' },
  { route: '/marketplace', label: 'Marketplace', icon: '▦' },
];

export function AppShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, mode, toggleTheme } = useTheme();
  const { isPhone } = useBreakpoint();
  const queryClient = useQueryClient();
  const unread = useQuery({ queryKey: ['notifications-unread'], queryFn: getUnreadNotificationCount });

  useEffect(() => {
    const channel = supabase.channel('shell-notifications').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const go = (route: string) => router.push(route as never);
  const navRow = <View style={{ flex: 1, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center' }}>
    {nav.map((item) => {
      const active = pathname === item.route || pathname.startsWith(`${item.route}/`);
      const badge = item.route === '/notifications' ? unread.data : undefined;
      return <Pressable key={item.route} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: active }} onPress={() => go(item.route)} style={({ pressed }) => ({ flex: isPhone ? 1 : undefined, width: isPhone ? undefined : 105, minWidth: 48, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: active ? theme.info : 'transparent', opacity: pressed ? .7 : 1 })}>
        <View><Text style={{ color: active ? theme.info : theme.mutedFg, fontSize: isPhone ? 20 : 21, fontWeight: '800' }}>{item.icon}</Text>{badge ? <View style={{ position: 'absolute', right: -14, top: -9, minWidth: 17, height: 17, paddingHorizontal: 3, borderRadius: 9, backgroundColor: theme.danger, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>{badge > 99 ? '99+' : badge}</Text></View> : null}</View>
        {!isPhone ? <Text style={{ color: active ? theme.info : theme.mutedFg, fontSize: 8, fontWeight: '800', marginTop: 2 }}>{item.label}</Text> : null}
      </Pressable>;
    })}
  </View>;

  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.surface }}>
    {isPhone ? <View style={{ height: 104, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, zIndex: 20 }}>
      <View style={{ height: 52, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable onPress={() => go('/home')} style={{ flex: 1 }}><Text style={{ color: theme.info, fontSize: 24, fontWeight: '900', letterSpacing: -.8 }}>kayumanggi</Text></Pressable>
        <CircleButton icon="＋" label="Create post" onPress={() => go('/home?compose=1')} />
        <CircleButton icon="⌕" label="Search" onPress={() => go('/services')} />
        <CircleButton icon="☰" label="Menu" onPress={() => go('/services')} />
      </View>
      <View style={{ height: 52 }}>{navRow}</View>
    </View> : <View style={{ height: 58, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: 'row', alignItems: 'stretch', paddingHorizontal: 14, zIndex: 20 }}>
      <View style={{ width: 330, flexDirection: 'row', alignItems: 'center', gap: 9 }}><Pressable onPress={() => go('/home')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.info, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>K</Text></Pressable><View style={{ width: 250 }}><SearchBox onSubmit={(value) => go(`/services?search=${encodeURIComponent(value)}`)} /></View></View>
      {navRow}
      <View style={{ width: 330, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 7 }}><CircleButton icon="⊞" label="All services" onPress={() => go('/services')} /><CircleButton icon={mode === 'dark' ? '☾' : '☀'} label="Toggle theme" onPress={toggleTheme} /><CircleButton icon="●" label="Profile" onPress={() => go('/profile')} /></View>
    </View>}
    <View style={{ flex: 1, backgroundColor: theme.background }}>{children}</View>
  </SafeAreaView>;
}
