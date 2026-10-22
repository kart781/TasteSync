// Step 1 of logging: find the place by name, or browse what is near the location bar.
// Becomes the Discover screen's "All places near you" in M6.
import { RADIUS_KM } from '@tastesync/core';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { LocationBar } from '@/components/location-bar';
import { ThemedText } from '@/components/themed-text';
import { Button, Chip, ErrorText, Field, Row, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, track } from '@/lib/api';
import { useLocation } from '@/lib/location';

type Result = {
  id: string;
  name: string;
  areaName: string | null;
  landmark: string | null;
  meters: number | null;
  priceBand: number | null;
  status: string;
};

const RADII = [2, 5, 10, 0]; // km; 0 = all of Hyderabad

function distance(meters: number | null) {
  if (meters === null) return null;
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
}

export default function FindPlace() {
  const theme = useTheme();
  const { current, mode } = useLocation();
  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState<number | null>(null); // null = the mode's default
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const radius = radiusKm ?? RADIUS_KM[mode];

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 && !current) {
      setResults([]);
      return;
    }
    const params = new URLSearchParams({ mode, radiusKm: String(radius) });
    if (q.length >= 2) params.set('q', q);
    if (current) {
      params.set('lat', String(current.lat));
      params.set('lng', String(current.lng));
    }
    const timer = setTimeout(() => {
      api<{ places: Result[] }>(`/places/search?${params}`)
        .then((res) => {
          setResults(res.places);
          setError(null);
        })
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(timer);
  }, [query, current, mode, radius]);

  function pick(place: Result) {
    track('search_performed', { picked: true, query: query.trim() || null });
    router.push({
      pathname: '/log/[placeId]',
      params: { placeId: place.id, name: place.name, mode: mode === 'order_in' ? 'delivery' : 'dine_in' },
    });
  }

  const browsing = query.trim().length < 2;

  return (
    <Screen>
      <View style={styles.header}>
        <LocationBar />
        <Field placeholder="Search places" value={query} onChangeText={setQuery} autoCorrect={false} returnKeyType="search" />
        {browsing && current ? (
          <Row>
            {RADII.map((km) => (
              <Chip key={km} label={km === 0 ? 'All Hyderabad' : `${km} km`} selected={radius === km} onPress={() => setRadiusKm(km)} />
            ))}
          </Row>
        ) : null}
        {!current && browsing ? (
          <ThemedText themeColor="textSecondary">Set your location to see places nearby, or search by name.</ThemedText>
        ) : null}
        <ErrorText error={error} />
      </View>
      <FlatList
        data={results}
        keyExtractor={(p) => p.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => pick(item)} style={[styles.result, { borderColor: theme.backgroundSelected }]}>
            <ThemedText style={{ fontWeight: 700 }}>{item.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {[
                item.areaName ?? item.landmark,
                distance(item.meters),
                item.priceBand ? '₹'.repeat(item.priceBand) : null,
                item.status === 'pending' ? 'awaiting review' : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </ThemedText>
          </Pressable>
        )}
        ListEmptyComponent={
          browsing && current ? (
            <ThemedText themeColor="textSecondary" style={{ paddingVertical: Spacing.three }}>
              {radius === 0 ? 'No places here yet.' : `No places within ${radius} km yet. Try a wider radius.`}
            </ThemedText>
          ) : undefined
        }
        ListFooterComponent={
          !browsing || current ? (
            <View style={{ paddingVertical: Spacing.three }}>
              <Button
                label="Can't find it? Add it"
                kind="secondary"
                onPress={() => {
                  track('search_performed', { picked: false, query: query.trim() || null });
                  router.push({ pathname: '/add-place', params: { name: query.trim() } });
                }}
              />
            </View>
          ) : undefined
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.two },
  result: { paddingVertical: Spacing.three, borderBottomWidth: StyleSheet.hairlineWidth, gap: 2 },
});
