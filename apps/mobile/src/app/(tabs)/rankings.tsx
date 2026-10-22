// Your two ranked lists. Edit mode moves places up and down within a band.
import type { Band, Experience } from '@tastesync/core';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Chip, ErrorText, Row, Screen, Score } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { EXPERIENCES, FEELINGS } from '@/lib/labels';

type Ranked = {
  placeId: string;
  name: string;
  areaName: string | null;
  cuisines: string[];
  status: string;
  band: Band;
  position: number | null;
  score: number | null;
};

export default function Rankings() {
  const theme = useTheme();
  const [experience, setExperience] = useState<Experience>('dine_in');
  const [places, setPlaces] = useState<Ranked[]>([]);
  const [area, setArea] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ places: Ranked[] }>(`/me/rankings?experience=${experience}`);
      setPlaces(res.places);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load');
    } finally {
      setLoading(false);
    }
  }, [experience]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const areas = useMemo(() => [...new Set(places.map((p) => p.areaName).filter((a): a is string => !!a))].sort(), [places]);
  const cuisines = useMemo(() => [...new Set(places.flatMap((p) => p.cuisines))].sort(), [places]);
  const shown = places.filter((p) => (!area || p.areaName === area) && (!cuisine || p.cuisines.includes(cuisine)));
  const filtered = area !== null || cuisine !== null;

  async function move(band: Band, index: number, delta: -1 | 1) {
    const inBand = places.filter((p) => p.band === band).map((p) => p.placeId);
    const target = index + delta;
    if (target < 0 || target >= inBand.length) return;
    [inBand[index], inBand[target]] = [inBand[target]!, inBand[index]!];
    try {
      await api('/me/rankings/order', { method: 'PATCH', body: { experience, band, placeIds: inBand } });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reorder');
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <Row>
          <ThemedText type="subtitle" style={{ flex: 1 }}>
            Rankings
          </ThemedText>
          {places.length > 1 && !filtered ? (
            <Chip label={editing ? 'Done' : 'Reorder'} selected={editing} onPress={() => setEditing(!editing)} />
          ) : null}
        </Row>
        <Row>
          {EXPERIENCES.map((e) => (
            <Chip
              key={e.value}
              label={e.label}
              selected={experience === e.value}
              onPress={() => {
                setExperience(e.value);
                setEditing(false);
              }}
            />
          ))}
        </Row>
        {areas.length > 1 || cuisines.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {areas.map((a) => (
              <Chip key={a} label={a} selected={area === a} onPress={() => setArea(area === a ? null : a)} />
            ))}
            {cuisines.map((c) => (
              <Chip key={c} label={c} selected={cuisine === c} onPress={() => setCuisine(cuisine === c ? null : c)} />
            ))}
          </ScrollView>
        ) : null}
        <ErrorText error={error} />

        {places.length === 0 && !loading ? (
          <ThemedText themeColor="textSecondary">
            Nothing here yet. Log a {experience === 'dine_in' ? 'meal out' : 'delivery or takeaway'} to start this list.
          </ThemedText>
        ) : null}

        {FEELINGS.map(({ value: band, label }) => {
          const rows = shown.filter((p) => p.band === band);
          if (rows.length === 0) return null;
          return (
            <View key={band} style={{ gap: Spacing.one }}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                {label}
              </ThemedText>
              {rows.map((p, i) => (
                <Pressable
                  key={p.placeId}
                  onPress={() => router.push({ pathname: '/place/[id]', params: { id: p.placeId } })}
                  style={[styles.row, { borderColor: theme.backgroundSelected }]}>
                  <ThemedText style={styles.position} themeColor="textSecondary">
                    {p.position ?? '·'}
                  </ThemedText>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontWeight: 700 }}>{p.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {[p.areaName, p.status === 'closed' ? 'closed' : null].filter(Boolean).join(' · ')}
                    </ThemedText>
                  </View>
                  {editing ? (
                    <Row>
                      <Chip label="↑" selected={false} onPress={() => move(band, i, -1)} />
                      <Chip label="↓" selected={false} onPress={() => move(band, i, 1)} />
                    </Row>
                  ) : p.position === null ? (
                    <Button
                      label="Rank"
                      kind="secondary"
                      onPress={() =>
                        router.push({
                          pathname: '/rank/[placeId]',
                          params: { placeId: p.placeId, name: p.name, experience, band },
                        })
                      }
                    />
                  ) : (
                    <Score score={p.score} />
                  )}
                </Pressable>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, paddingVertical: Spacing.three },
  filters: { gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two, borderBottomWidth: StyleSheet.hairlineWidth },
  position: { width: 24, textAlign: 'right' },
});
