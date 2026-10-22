import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Screen({ children, edges }: { children: ReactNode; edges?: ('top' | 'bottom')[] }) {
  const theme = useTheme();
  return (
    <SafeAreaView edges={edges ?? ['top']} style={[styles.screen, { backgroundColor: theme.background }]}>
      {children}
    </SafeAreaView>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  busy,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  busy?: boolean;
}) {
  const theme = useTheme();
  const background = kind === 'primary' ? theme.accent : theme.backgroundElement;
  const color = kind === 'primary' ? theme.onAccent : kind === 'danger' ? theme.danger : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}>
      {busy ? <ActivityIndicator color={color} /> : <ThemedText style={{ color, fontWeight: 700 }}>{label}</ThemedText>}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? theme.accent : theme.backgroundElement }]}>
      <ThemedText type="small" style={{ color: selected ? theme.onAccent : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label?: string }) {
  const theme = useTheme();
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: Spacing.one }}>
      {label ? (
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[styles.field, { backgroundColor: theme.backgroundElement, color: theme.text }, style]}
        {...rest}
      />
    </View>
  );
}

export function Row({ children, wrap }: { children: ReactNode; wrap?: boolean }) {
  return <View style={[styles.row, wrap && { flexWrap: 'wrap' }]}>{children}</View>;
}

export function ErrorText({ error }: { error: string | null }) {
  const theme = useTheme();
  return error ? <ThemedText style={{ color: theme.danger }}>{error}</ThemedText> : null;
}

export function Score({ score }: { score: number | null }) {
  const theme = useTheme();
  return (
    <View style={[styles.score, { borderColor: theme.accent }]}>
      <ThemedText type="smallBold" style={{ color: theme.accent }}>
        {score === null ? '–' : score.toFixed(1)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: Spacing.three },
  button: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: Spacing.three, alignItems: 'center' },
  chip: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  field: { borderRadius: 12, paddingHorizontal: Spacing.three, paddingVertical: 12, fontSize: 16 },
  row: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  score: { borderWidth: 2, borderRadius: 999, minWidth: 44, paddingVertical: 4, alignItems: 'center' },
});
