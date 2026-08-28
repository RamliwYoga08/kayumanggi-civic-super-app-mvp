import { PropsWithChildren } from 'react';
import { Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/features/auth/AuthProvider';

const desktopNav = [
  { route: '/home', label: 'Home', icon: '⌂' },
  { route: '/community', label: 'Community', icon: '◎' },
  { route: '/marketplace', label: 'Marketplace', icon: '▦' },
  { route: '/governance', label: 'Governance', icon: '▥' },
  { route: '/elections', label: 'Elections', icon: '✓' },
];

const mobileNav = [
  { route: '/home', label: 'Home', icon: '⌂' },
  { route: '/community', label: 'Community', icon: '◎' },
  { route: '/marketplace', label: 'Market', icon: '▦' },
  { route: '/governance', label: 'Civic', icon: '▥' },
  { route: '/services', label: 'Menu', icon: '⊞' },
];

export function AppShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, mode, toggleTheme } = useTheme();
  const { isPhone } = useBreakpoint();
  const { signOut } = useAuth();

  const nav = isPhone ? mobileNav : desktopNav;
  const headerHeight = 56;

  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
    <View style={{ height: headerHeight, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: isPhone ? 10 : 16, gap: 10, zIndex: 20 }}>
      <Pressable onPress={() => router.push('/home' as never)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.info, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>K</Text></Pressable>
      {!isPhone ? <View style={{ width: 230, maxWidth: 280 }}><TextInput onSubmitEditing={(event) => router.push(`/services?search=${encodeURIComponent(event.nativeEvent.text)}` as never)} placeholder="Search Kayumanggi" placeholderTextColor={theme.mutedFg} style={{ height: 38, borderRadius: 20, backgroundColor: theme.surfaceHover, color: theme.text, paddingHorizontal: 15, fontSize: 13 }} /></View> : <Text style={{ color: theme.text, fontWeight: '900', fontSize: 17, flex: 1 }}>Kayumanggi</Text>}

      {!isPhone ? <View style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center', gap: 2 }}>
        {nav.map((item) => {
          const active = pathname.startsWith(item.route);
          return <Pressable key={item.route} accessibilityLabel={item.label} onPress={() => router.push(item.route as never)} style={{ width: 92, maxWidth: 110, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: active ? theme.info : 'transparent', backgroundColor: active ? `${theme.info}0A` : 'transparent' }}><Text style={{ color: active ? theme.info : theme.mutedFg, fontSize: 21 }}>{item.icon}</Text><Text style={{ color: active ? theme.info : theme.mutedFg, fontSize: 9, marginTop: 2, fontWeight: '700' }}>{item.label}</Text></Pressable>;
        })}
      </View> : null}

      <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Pressable onPress={() => router.push('/messages' as never)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surfaceHover, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.text }}>✉</Text></Pressable>
        <Pressable onPress={toggleTheme} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.surfaceHover, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.text }}>{mode === 'dark' ? '☾' : '☀'}</Text></Pressable>
        {!isPhone ? <Pressable onPress={() => router.push('/profile' as never)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.muted, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.text, fontWeight: '900' }}>U</Text></Pressable> : null}
        {!isPhone ? <Pressable onPress={() => signOut()} style={{ paddingHorizontal: 9, paddingVertical: 8 }}><Text style={{ color: theme.mutedFg, fontSize: 10, fontWeight: '700' }}>Sign out</Text></Pressable> : null}
      </View>
    </View>

    <View style={{ flex: 1 }}>{children}</View>

    {isPhone ? <View style={{ height: 64, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.surface, flexDirection: 'row', alignItems: 'stretch', paddingBottom: 4 }}>
      {nav.map((item) => {
        const active = pathname.startsWith(item.route);
        return <Pressable key={item.route} onPress={() => router.push(item.route as never)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}><Text style={{ color: active ? theme.info : theme.mutedFg, fontSize: 19 }}>{item.icon}</Text><Text style={{ color: active ? theme.info : theme.mutedFg, fontSize: 9, fontWeight: active ? '800' : '600' }}>{item.label}</Text></Pressable>;
      })}
    </View> : null}
  </SafeAreaView>;
}
