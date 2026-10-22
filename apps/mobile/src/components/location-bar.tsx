// "📍 Home · Jubilee Hills ▾" plus the Eat out / Order in switch.
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Chip, Row } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { locationLabel, useLocation } from '@/lib/location';

export function LocationBar() {
  const { current, mode, setMode } = useLocation();
  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" accessibilityLabel="Change location" onPress={() => router.push('/location')}>
        <ThemedText style={styles.label} numberOfLines={1}>
          📍 {locationLabel(current)} ▾
        </ThemedText>
      </Pressable>
      {current?.outside ? (
        <ThemedText type="small" themeColor="textSecondary">
          TasteSync is Hyderabad-only for now.
        </ThemedText>
      ) : null}
      <Row>
        <Chip label="Eat out" selected={mode === 'eat_out'} onPress={() => setMode('eat_out')} />
        <Chip label="Order in" selected={mode === 'order_in'} onPress={() => setMode('order_in')} />
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  label: { fontWeight: 700 },
});
