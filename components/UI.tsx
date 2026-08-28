import { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleProp, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '@/features/theme/ThemeProvider';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const { theme } = useTheme();
  if (!scroll) return <View style={{ flex: 1, backgroundColor: theme.background }}>{children}</View>;
  return <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>{children}</ScrollView>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { theme } = useTheme();
  return <View style={[{ backgroundColor: theme.surfaceElevated, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 16 }, style]}>{children}</View>;
}

export function Title({ children, size = 22 }: PropsWithChildren<{ size?: number }>) {
  const { theme } = useTheme();
  return <Text style={{ color: theme.text, fontWeight: '800', fontSize: size }}>{children}</Text>;
}

export function Muted({ children, size = 12 }: PropsWithChildren<{ size?: number }>) {
  const { theme } = useTheme();
  return <Text style={{ color: theme.mutedFg, fontSize: size, lineHeight: size * 1.45 }}>{children}</Text>;
}

export function Divider() {
  const { theme } = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12 }} />;
}

export function Button({ children, onPress, variant = 'primary', disabled = false, style }: PropsWithChildren<{ onPress?: () => void; variant?: 'primary'|'secondary'|'danger'|'ghost'; disabled?: boolean; style?: StyleProp<ViewStyle> }>) {
  const { theme } = useTheme();
  const bg = variant === 'primary' ? theme.info : variant === 'danger' ? theme.danger : variant === 'secondary' ? theme.muted : 'transparent';
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [{ opacity: disabled ? 0.45 : pressed ? 0.78 : 1, backgroundColor: bg, borderColor: variant === 'ghost' ? theme.border : bg, borderWidth: variant === 'ghost' ? 1 : 0, borderRadius: 12, minHeight: 42, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }, style]}>
    <Text style={{ color: variant === 'secondary' || variant === 'ghost' ? theme.text : '#fff', fontWeight: '800', fontSize: 13 }}>{children}</Text>
  </Pressable>;
}

export function Field(props: TextInputProps) {
  const { theme } = useTheme();
  return <TextInput placeholderTextColor={theme.mutedFg} {...props} style={[{ minHeight: 44, borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.background, color: theme.text, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14 }, props.style]} />;
}

export function Badge({ children, tone = 'info' }: PropsWithChildren<{ tone?: 'info'|'success'|'warning'|'danger'|'neutral' }>) {
  const { theme } = useTheme();
  const color = tone === 'success' ? theme.active : tone === 'warning' ? theme.warning : tone === 'danger' ? theme.danger : tone === 'neutral' ? theme.mutedFg : theme.info;
  return <View style={{ borderColor: color, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' }}><Text style={{ color, fontSize: 10, fontWeight: '800' }}>{children}</Text></View>;
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  const { theme } = useTheme();
  return <View style={{ padding: 28, alignItems: 'center', gap: 10 }}><ActivityIndicator color={theme.info} /><Muted>{label}</Muted></View>;
}

export function Empty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <Card style={{ alignItems: 'center', paddingVertical: 30, gap: 8 }}><Title size={16}>{title}</Title><Muted>{description}</Muted>{action}</Card>;
}

export function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}><View style={{ flex: 1, gap: 3 }}><Title>{title}</Title>{subtitle ? <Muted>{subtitle}</Muted> : null}</View>{right}</View>;
}
