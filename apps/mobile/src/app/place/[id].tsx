// Place page, personal view for now. Friends', circle and city scores arrive in M3-M5.
import type { Band, Experience, VisitMode } from '@tastesync/core';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Row, Screen, Score } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { EXPERIENCES, FEELINGS, label, MODES } from '@/lib/labels';

type PlacePage = {
  place: { id: string; name: string; areaName: string | null; landmark: string | null; cuisines: string[]; status: string };
  myRankings: { experience: Experience; band: Band; position: number | null; score: number | null }[];
  myVisits: { id: string; visitedOn: string; mode: VisitMode; feeling: Band }[];
};

export default function Place() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<PlacePage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      api<PlacePage>(`/places/${id}`).then(setData).catch((e) => setError(e.message));
    }, [id]),
  );

  if (!data) return <Screen><ErrorText error={error} /></Screen>;
  const { place, myRankings, myVisits } = data;

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: place.name }} />
      <ScrollView contentContainerStyle={styles.body}>
        <ThemedText themeColor="textSecondary">
          {[place.areaName, place.landmark, place.cuisines.join(', ') || null, place.status !== 'open' ? place.status : null]
            .filter(Boolean)
            .join(' · ')}
        </ThemedText>

        {EXPERIENCES.map((e) => {
          const r = myRankings.find((x) => x.experience === e.value);
          if (!r) return null;
          return (
            <Row key={e.value}>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: 700 }}>Your {e.label.toLowerCase()} score</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {r.position === null ? `Not ranked yet · ${label(FEELINGS, r.band)}` : `#${r.position} in ${label(FEELINGS, r.band)}`}
                </ThemedText>
              </View>
              <Score score={r.score} />
            </Row>
          );
        })}

        <Button
          label="Log a visit"
          onPress={() => router.push({ pathname: '/log/[placeId]', params: { placeId: place.id, name: place.name } })}
        />

        {myVisits.length > 0 ? (
          <ThemedText type="smallBold" themeColor="textSecondary">
            Your visits
          </ThemedText>
        ) : null}
        {myVisits.map((v) => (
          <Pressable
            key={v.id}
            onPress={() => router.push({ pathname: '/visit/[id]', params: { id: v.id } })}
            style={[styles.row, { borderColor: theme.backgroundSelected }]}>
            <ThemedText>
              {v.visitedOn} · {label(MODES, v.mode)} · {label(FEELINGS, v.feeling)}
            </ThemedText>
          </Pressable>
        ))}
        <ErrorText error={error} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, paddingVertical: Spacing.three },
  row: { paddingVertical: Spacing.two, borderBottomWidth: StyleSheet.hairlineWidth },
});
