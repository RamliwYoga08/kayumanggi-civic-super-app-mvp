import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/features/theme/ThemeProvider';

export function Avatar({ name, uri, size = 44, online = false }: { name?: string | null; uri?: string | null; size?: number; online?: boolean }) {
  const { theme } = useTheme();
  return <View style={{ width: size, height: size }}>
    {uri ? <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.muted }} /> : <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.muted, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.textSecondary, fontWeight: '900', fontSize: size * .34 }}>{(name || 'K').slice(0, 1).toUpperCase()}</Text></View>}
    {online ? <View style={{ position: 'absolute', right: 0, bottom: 1, width: Math.max(10, size * .25), height: Math.max(10, size * .25), borderRadius: 99, backgroundColor: theme.active, borderWidth: 2, borderColor: theme.surface }} /> : null}
  </View>;
}

export function CircleButton({ icon, label, onPress, active = false, badge }: { icon: string; label: string; onPress?: () => void; active?: boolean; badge?: number }) {
  const { theme } = useTheme();
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? `${theme.info}20` : theme.surfaceHover, opacity: pressed ? .72 : 1 })}>
    <Text style={{ color: active ? theme.info : theme.text, fontSize: 18, fontWeight: '800' }}>{icon}</Text>
    {badge ? <View style={{ position: 'absolute', right: -3, top: -4, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.danger, borderWidth: 2, borderColor: theme.surface }}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{badge > 99 ? '99+' : badge}</Text></View> : null}
  </Pressable>;
}

export function SearchBox({ value, onChangeText, placeholder = 'Search Kayumanggi', onSubmit }: { value?: string; onChangeText?: (value: string) => void; placeholder?: string; onSubmit?: (value: string) => void }) {
  const { theme } = useTheme();
  return <View style={{ height: 40, borderRadius: 20, backgroundColor: theme.surfaceHover, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 8 }}><Text style={{ color: theme.mutedFg, fontSize: 16 }}>⌕</Text><TextInput value={value} onChangeText={onChangeText} onSubmitEditing={(event) => onSubmit?.(event.nativeEvent.text)} placeholder={placeholder} placeholderTextColor={theme.mutedFg} style={{ flex: 1, color: theme.text, fontSize: 13, paddingVertical: 0 }} /></View>;
}

export function PageTitleBar({ title, subtitle, left, right }: { title: string; subtitle?: string; left?: ReactNode; right?: ReactNode }) {
  const { theme } = useTheme();
  return <View style={{ minHeight: 62, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border }}>
    {left}<View style={{ flex: 1 }}><Text style={{ color: theme.text, fontSize: 24, fontWeight: '900', letterSpacing: -.4 }}>{title}</Text>{subtitle ? <Text style={{ color: theme.mutedFg, fontSize: 11, marginTop: 1 }}>{subtitle}</Text> : null}</View>{right}
  </View>;
}

export function SidebarItem({ icon, label, active = false, onPress, detail }: { icon: string; label: string; active?: boolean; onPress?: () => void; detail?: string }) {
  const { theme } = useTheme();
  return <Pressable onPress={onPress} style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: active ? theme.surfaceHover : pressed ? theme.surfaceHover : 'transparent' })}>
    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: active ? theme.info : theme.muted, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: active ? '#fff' : theme.textSecondary, fontSize: 16, fontWeight: '900' }}>{icon}</Text></View>
    <View style={{ flex: 1 }}><Text style={{ color: theme.text, fontSize: 13, fontWeight: active ? '900' : '700' }}>{label}</Text>{detail ? <Text numberOfLines={1} style={{ color: theme.mutedFg, fontSize: 10, marginTop: 2 }}>{detail}</Text> : null}</View>
  </Pressable>;
}

export function ActionPill({ label, onPress, primary = false, disabled = false }: { label: string; onPress?: () => void; primary?: boolean; disabled?: boolean }) {
  const { theme } = useTheme();
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: 38, paddingHorizontal: 16, borderRadius: 10, backgroundColor: primary ? theme.info : theme.muted, alignItems: 'center', justifyContent: 'center', opacity: disabled ? .45 : pressed ? .75 : 1 })}><Text style={{ color: primary ? '#fff' : theme.text, fontSize: 12, fontWeight: '900' }}>{label}</Text></Pressable>;
}
