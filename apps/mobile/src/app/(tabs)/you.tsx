// Placeholder profile until M4 (top 4, stats, lists). For now: who you are and sign out.
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/lib/session';

export default function You() {
  const { user, signOut } = useSession();
  return (
    <Screen>
      <View style={styles.body}>
        <ThemedText type="subtitle">{user?.displayName}</ThemedText>
        <ThemedText themeColor="textSecondary">@{user?.username}</ThemedText>
        <Button label="Sign out" kind="secondary" onPress={signOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, paddingVertical: Spacing.three },
});
