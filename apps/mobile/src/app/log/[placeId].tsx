// The logging flow: how you ate and how you felt, comparisons, audience, save.
// Only place, feeling and comparisons are required (PRD target: under 45 seconds).
import { experienceOf, type Answer, type Audience, type Band, type VisitMode } from '@tastesync/core';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Compare } from '@/components/compare';
import { ThemedText } from '@/components/themed-text';
import { Button, Chip, ErrorText, Field, Row, Screen, Score } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { api, track } from '@/lib/api';
import { AUDIENCES, FEELINGS, label, MODES } from '@/lib/labels';

type Place = { place: { id: string; name: string }; myRankings: { experience: string; band: Band; position: number | null }[] };
type Step = 'feeling' | 'revisit' | 'compare' | 'details' | 'done';
type Saved = { position: number | null; score: number | null; experience: string };

export default function LogVisit() {
  const { placeId, name, mode: startMode } = useLocalSearchParams<{ placeId: string; name?: string; mode?: VisitMode }>();
  const startedAt = useRef(new Date().toISOString());
  const [place, setPlace] = useState<Place | null>(null);
  const [step, setStep] = useState<Step>('feeling');
  const [mode, setMode] = useState<VisitMode>(startMode ?? 'dine_in'); // Order in starts as delivery
  const [feeling, setFeeling] = useState<Band | null>(null);
  const [ranking, setRanking] = useState<{ answers: Answer[]; skip: boolean; keep: boolean }>({ answers: [], skip: false, keep: false });
  const [audience, setAudience] = useState<Audience>('friends');
  const [dishes, setDishes] = useState('');
  const [note, setNote] = useState('');
  const [price, setPrice] = useState('');
  const [saved, setSaved] = useState<Saved | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track('log_started', { placeId });
    api<Place>(`/places/${placeId}`).then(setPlace).catch((e) => setError(e.message));
  }, [placeId]);

  const placeName = place?.place.name ?? name ?? '';
  const experience = experienceOf(mode);

  function pickFeeling(band: Band) {
    setFeeling(band);
    const existing = place?.myRankings.find((r) => r.experience === experience);
    // Same place, same way, same feeling: offer to keep its spot (PRD edge case).
    setStep(existing && existing.band === band && existing.position !== null ? 'revisit' : 'compare');
  }

  async function save() {
    if (!feeling) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api<Saved>('/visits', {
        method: 'POST',
        body: {
          placeId,
          mode,
          feeling,
          comparisons: ranking.answers,
          skipComparisons: ranking.skip,
          keepPosition: ranking.keep,
          audience,
          dishes: dishes
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean)
            .map((d) => ({ name: d })),
          note: note.trim() || undefined,
          pricePerPerson: price ? Number(price) : undefined,
          logStartedAt: startedAt.current,
        },
      });
      setSaved(result);
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: placeName }} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {step === 'feeling' && (
          <>
            <ThemedText type="smallBold" themeColor="textSecondary">
              How did you eat?
            </ThemedText>
            <Row>
              {MODES.map((m) => (
                <Chip key={m.value} label={m.label} selected={mode === m.value} onPress={() => setMode(m.value)} />
              ))}
            </Row>
            <ThemedText style={styles.prompt}>How was it?</ThemedText>
            {FEELINGS.map((f) => (
              <Button key={f.value} label={f.label} kind="secondary" disabled={!place} onPress={() => pickFeeling(f.value)} />
            ))}
          </>
        )}

        {step === 'revisit' && feeling && (
          <>
            <ThemedText style={styles.prompt}>Still where it was?</ThemedText>
            <ThemedText themeColor="textSecondary">
              {placeName} is already in your {label(FEELINGS, feeling).toLowerCase()} list.
            </ThemedText>
            <Button
              label="Yes, keep its spot"
              onPress={() => {
                setRanking({ answers: [], skip: false, keep: true });
                setStep('details');
              }}
            />
            <Button label="Compare again" kind="secondary" onPress={() => setStep('compare')} />
          </>
        )}

        {step === 'compare' && feeling && (
          <Compare
            placeId={placeId}
            placeName={placeName}
            experience={experience}
            band={feeling}
            onDone={(result) => {
              setRanking(result === 'skip' ? { answers: [], skip: true, keep: false } : { answers: result.answers, skip: false, keep: false });
              setStep('details');
            }}
          />
        )}

        {step === 'details' && (
          <>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Who can see this?
            </ThemedText>
            <Row>
              {AUDIENCES.map((a) => (
                <Chip key={a.value} label={a.label} selected={audience === a.value} onPress={() => setAudience(a.value)} />
              ))}
            </Row>
            <Button label="Save" onPress={save} busy={busy} />
            <ThemedText type="smallBold" themeColor="textSecondary" style={{ marginTop: Spacing.three }}>
              Optional
            </ThemedText>
            <Field label="What you had" placeholder="Mutton biryani, Irani chai" value={dishes} onChangeText={setDishes} />
            <Field label="Note" placeholder="Anything to remember" value={note} onChangeText={setNote} multiline maxLength={1000} />
            <Field label="Price per person (₹)" keyboardType="number-pad" value={price} onChangeText={(t) => setPrice(t.replace(/\D/g, ''))} />
          </>
        )}

        {step === 'done' && saved && feeling && (
          <View style={styles.done}>
            <Score score={saved.score} />
            <ThemedText style={styles.prompt}>
              {saved.position === null ? 'Saved. Rank it later from your list.' : `#${saved.position} in ${label(FEELINGS, feeling)}`}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              {saved.experience === 'delivery' ? 'In your delivery ranking' : 'In your dine-in ranking'}
            </ThemedText>
            <Button label="Done" onPress={() => router.dismissTo('/')} />
          </View>
        )}
        <ErrorText error={error} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, paddingVertical: Spacing.three },
  prompt: { fontSize: 24, lineHeight: 30, fontWeight: 700 },
  done: { gap: Spacing.three, alignItems: 'center', paddingTop: Spacing.five },
});
