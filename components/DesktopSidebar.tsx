import { Pressable, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '@/services/api';
import { Avatar } from '@/components/SocialUI';
import { useTheme } from '@/features/theme/ThemeProvider';

type NavItem = { label: string; icon: string; route: string; match?: string; detail?: string };

const socialItems: NavItem[] = [
  { label: 'Feed', icon: '▦', route: '/home' },
  { label: 'Messages', icon: '○', route: '/messages', detail: 'Private conversations' },
  { label: 'Friends', icon: '♧', route: '/community?tab=suggestions', match: '/community' },
  { label: 'Groups', icon: '△', route: '/community?tab=groups', match: '/community' },
  { label: 'Marketplace', icon: '▱', route: '/marketplace' },
  { label: 'Pages', icon: '▤', route: '/community?tab=pages', match: '/community' },
  { label: 'Civic Reels', icon: '▹', route: '/reels' },
  { label: 'Events', icon: '□', route: '/events' },
  { label: 'Saved', icon: '♡', route: '/saved' },
];

const civicItems: NavItem[] = [
  { label: 'Profiling', icon: '♙', route: '/module/profiling' },
  { label: 'Governance', icon: '▥', route: '/governance' },
  { label: 'Elections', icon: '☑', route: '/elections' },
  { label: 'Debates', icon: '⚔', route: '/module/debates' },
  { label: 'Polls & Surveys', icon: 'Ⅲ', route: '/polls' },
  { label: 'Charity', icon: '♡', route: '/module/charity' },
  { label: 'Jobs', icon: '▣', route: '/jobs' },
  { label: 'Lost & Found', icon: '⌕', route: '/lost-found' },
  { label: 'Environment', icon: '♧', route: '/environment' },
  { label: 'News', icon: '▤', route: '/news' },
  { label: 'Education', icon: '◇', route: '/module/education' },
  { label: 'Healthcare', icon: '♢', route: '/module/healthcare' },
  { label: 'Tourism', icon: '⌖', route: '/module/tourism' },
  { label: 'Agriculture', icon: '♨', route: '/module/agriculture' },
  { label: 'Disaster Mgmt', icon: '!', route: '/module/disaster' },
  { label: 'Volunteers', icon: '⌁', route: '/module/volunteer' },
  { label: 'Public Utility', icon: '⚙', route: '/module/public-services' },
  { label: 'Community Dev', icon: '⌘', route: '/module/community-development' },
  { label: 'Economic Dev', icon: '↗', route: '/module/economic-development' },
];

export function DesktopSidebar() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ tab?: string }>();
  const [collapsed, setCollapsed] = useState(false);
  const profile = useQuery({ queryKey: ['my-profile'], queryFn: getMyProfile });
  const width = collapsed ? 76 : 268;

  return <View style={{ width, flexShrink: 0, backgroundColor: theme.surface, borderRightWidth: 1, borderRightColor: theme.border }}>
    <View style={{ minHeight: 64, paddingHorizontal: collapsed ? 12 : 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <Pressable onPress={() => router.push('/profile' as never)}><Avatar name={profile.data?.full_name} uri={profile.data?.avatar_url} size={38} online /></Pressable>
      {!collapsed ? <Pressable onPress={() => router.push('/profile' as never)} style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: theme.text, fontSize: 13, fontWeight: '900' }}>{profile.data?.full_name || 'My profile'}</Text><Text style={{ color: theme.mutedFg, fontSize: 9, marginTop: 2 }}>View civic identity</Text></Pressable> : null}
      <Pressable accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onPress={() => setCollapsed((value) => !value)} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: theme.surfaceHover, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.textSecondary, fontWeight: '900' }}>{collapsed ? '›' : '‹'}</Text></Pressable>
    </View>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: collapsed ? 8 : 10, paddingVertical: 10, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
      {socialItems.map((item) => { const requestedTab = item.route.split('tab=')[1]; const active = item.match === '/community' ? pathname === '/community' && (requestedTab === 'suggestions' ? !params.tab || ['requests','suggestions'].includes(params.tab) : params.tab === requestedTab) : pathname === (item.match || item.route.split('?')[0]); return <NavRow key={item.label} item={item} collapsed={collapsed} active={active} onPress={() => router.push(item.route as never)} />; })}
      <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 13, marginHorizontal: collapsed ? 6 : 4 }} />
      {!collapsed ? <Text style={{ color: theme.mutedFg, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, paddingHorizontal: 12, paddingBottom: 8 }}>CIVIC HUB</Text> : <Text style={{ color: theme.mutedFg, textAlign: 'center', fontSize: 8, fontWeight: '900', paddingBottom: 8 }}>CIVIC</Text>}
      {civicItems.map((item) => <NavRow key={item.label} item={item} collapsed={collapsed} active={pathname === item.route || pathname.startsWith(`${item.route}/`)} onPress={() => router.push(item.route as never)} />)}
    </ScrollView>
  </View>;
}

function NavRow({ item, collapsed, active, onPress }: { item: NavItem; collapsed: boolean; active: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return <Pressable accessibilityLabel={item.label} onPress={onPress} style={({ pressed }) => ({ minHeight: 42, borderRadius: 8, paddingHorizontal: collapsed ? 0 : 10, flexDirection: 'row', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 11, backgroundColor: active ? theme.surfaceHover : pressed ? theme.surfaceHover : 'transparent' })}>
    <View style={{ width: 25, alignItems: 'center' }}><Text style={{ color: active ? theme.info : theme.mutedFg, fontSize: 16, fontWeight: '800' }}>{item.icon}</Text></View>
    {!collapsed ? <View style={{ flex: 1 }}><Text style={{ color: active ? theme.text : theme.textSecondary, fontSize: 12, fontWeight: active ? '900' : '600' }}>{item.label}</Text>{item.detail ? <Text numberOfLines={1} style={{ color: theme.mutedFg, fontSize: 8, marginTop: 1 }}>{item.detail}</Text> : null}</View> : null}
    {!collapsed && active ? <View style={{ width: 3, height: 22, borderRadius: 2, backgroundColor: theme.info }} /> : null}
  </Pressable>;
}
