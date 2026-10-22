// Location sheet: current location, saved places (on this phone only), launch areas.
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Chip, ErrorText, Field, Row, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { useLocation, type Area } from '@/lib/location';

const SUGGESTED_NAMES = ['Home', 'Work'];

export default function ChooseLocation() {
  const theme = useTheme();
  const { current, saved, requestGps, chooseArea, chooseSaved, saveCurrent, removeSaved } = useLocation();
  const [areas, setAreas] = useState<Area[]>([]);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const near = current ? `?lat=${current.lat}&lng=${current.lng}` : '';
    api<{ areas: Area[] }>(`/areas${near}`).then((r) => setAreas(r.areas)).catch((e) => setError(e.message));
  }, [current]);

  async function gps() {
    setBusy(true);
    setError(null);
    try {
      if (await requestGps()) router.back();
      else setError('Location is off for TasteSync. Allow it in Settings, or pick an area below.');
    } catch {
      setError('Could not get your location. Pick an area below.');
    } finally {
      setBusy(false);
    }
  }

  const row = { borderColor: theme.backgroundSelected };

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Button label="Use current location" onPress={gps} busy={busy} />
        <ErrorText error={error} />

        {saved.length > 0 ? (
          <ThemedText type="smallBold" themeColor="textSecondary">
            Saved on this phone
          </ThemedText>
        ) : null}
        {saved.map((p) => (
          <View key={p.name} style={[styles.row, row]}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => {
                chooseSaved(p);
                router.back();
              }}>
              <ThemedText style={{ fontWeight: 700 }}>{p.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {p.areaName}
              </ThemedText>
            </Pressable>
            <Chip label="Remove" selected={false} onPress={() => removeSaved(p.name)} />
          </View>
        ))}

        {current && current.source !== 'saved' ? (
          <View style={{ gap: Spacing.two }}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Save this location
            </ThemedText>
            <Row>
              {SUGGESTED_NAMES.map((n) => (
                <Chip key={n} label={n} selected={name === n} onPress={() => setName(n)} />
              ))}
            </Row>
            <Field placeholder="Or a name, like Gym" value={name} onChangeText={setName} maxLength={30} />
            <Button
              label="Save"
              kind="secondary"
              disabled={!name.trim()}
              onPress={() => {
                saveCurrent(name.trim());
                router.back();
              }}
            />
          </View>
        ) : null}

        <ThemedText type="smallBold" themeColor="textSecondary">
          Areas
        </ThemedText>
        {areas.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => {
              chooseArea(a);
              router.back();
            }}
            style={[styles.row, row]}>
            <ThemedText style={{ flex: 1 }}>{a.name}</ThemedText>
            {a.meters !== null ? (
              <ThemedText type="small" themeColor="textSecondary">
                {(a.meters / 1000).toFixed(1)} km
              </ThemedText>
            ) : null}
          </Pressable>
        ))}
        <ThemedText type="small" themeColor="textSecondary">
          Your location is used only to show places nearby. It is never stored.
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, paddingVertical: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two, borderBottomWidth: StyleSheet.hairlineWidth },
});
