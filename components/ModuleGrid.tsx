import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { civicModules, CivicModule } from '@/constants/modules';
import { useTheme } from '@/features/theme/ThemeProvider';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export function ModuleGrid({ modules = civicModules }: { modules?: CivicModule[] }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { isPhone, isTablet } = useBreakpoint();
  const width = isPhone ? '48.4%' : isTablet ? '31.8%' : '23.6%';
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
    {modules.map((item) => <Pressable key={item.slug} onPress={() => router.push((item.route || `/module/${item.slug}`) as never)} style={({ pressed }) => ({ width: width as any, opacity: pressed ? 0.75 : 1, backgroundColor: theme.surfaceElevated, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 14, minHeight: 110 })}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: `${item.color}22`, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Text style={{ color: item.color, fontWeight: '900', fontSize: 17 }}>{item.emoji}</Text></View>
      <Text style={{ color: theme.text, fontWeight: '800', fontSize: 13 }}>{item.title}</Text>
      <Text style={{ color: theme.mutedFg, fontSize: 10, lineHeight: 14, marginTop: 3 }}>{item.subtitle}</Text>
    </Pressable>)}
  </View>;
}
