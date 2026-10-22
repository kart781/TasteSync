// Asks "which was better?" with binary insertion from @tastesync/core.
// The answers go to the API, which replays them with the same code.
import { applyAnswer, nextQuestion, startSearch, type Answer, type Band, type Experience, type Outcome, type Search } from '@tastesync/core';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Row } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, track } from '@/lib/api';

type BandPlace = { placeId: string; name: string; position: number | null; lastVisitedOn: string | null };

export function Compare({
  placeId,
  placeName,
  experience,
  band,
  onDone,
}: {
  placeId: string;
  placeName: string;
  experience: Experience;
  band: Band;
  onDone: (result: { answers: Answer[] } | 'skip') => void;
}) {
  const theme = useTheme();
  const [places, setPlaces] = useState<BandPlace[] | null>(null);
  const [search, setSearch] = useState<Search | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ places: BandPlace[] }>(`/me/rankings?experience=${experience}&band=${band}`)
      .then((res) => {
        // The place being ranked is never compared with itself.
        const ranked = res.places.filter((p) => p.position !== null && p.placeId !== placeId);
        setPlaces(ranked);
        setSearch(startSearch(ranked.length));
      })
      .catch((e) => setError(e.message));
  }, [placeId, experience, band]);

  const question = search ? nextQuestion(search) : null;
  const done = question?.kind === 'done';

  useEffect(() => {
    if (done) onDone({ answers });
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <ErrorText error={error} />;
  if (!places || !search || !question || done) return <ActivityIndicator style={{ marginTop: Spacing.five }} />;

  const other = places[question.position - 1]!;
  const answer = (outcome: Outcome) => {
    setAnswers((a) => [...a, { otherPlaceId: other.placeId, outcome }]);
    setSearch(applyAnswer(search, question.position, outcome));
    track('comparison_answered', { outcome, question: search.asked + 1 });
  };

  return (
    <View style={styles.body}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        Question {search.asked + 1} of up to 4
      </ThemedText>
      <ThemedText style={styles.prompt}>Which was better?</ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={() => answer('better')}
        style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          This visit
        </ThemedText>
        <ThemedText style={styles.cardTitle}>{placeName}</ThemedText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => answer('worse')}
        style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText style={styles.cardTitle}>{other.name}</ThemedText>
        {other.lastVisitedOn ? (
          <ThemedText type="small" themeColor="textSecondary">
            Last visit {other.lastVisitedOn}
          </ThemedText>
        ) : null}
      </Pressable>
      <Row>
        <View style={{ flex: 1 }}>
          <Button label="Too close to call" kind="secondary" onPress={() => answer('tie')} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Don't remember" kind="secondary" onPress={() => answer('skip')} />
        </View>
      </Row>
      <Button
        label="Skip for now"
        kind="secondary"
        onPress={() => {
          track('comparison_skipped', { answered: answers.length });
          onDone('skip');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three },
  prompt: { fontSize: 24, lineHeight: 30, fontWeight: 700 },
  card: { borderRadius: 16, padding: Spacing.four, gap: Spacing.one, minHeight: 110, justifyContent: 'center' },
  cardTitle: { fontSize: 20, lineHeight: 26, fontWeight: 700 },
});
