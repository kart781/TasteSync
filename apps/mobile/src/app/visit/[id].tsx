// Edit or delete a visit. A new feeling moves the place to that band, then asks for comparisons.
import type { Audience, Band, Experience, VisitMode } from '@tastesync/core';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Chip, ErrorText, Field, Row, Screen, Score } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { AUDIENCES, FEELINGS, label, MODES } from '@/lib/labels';

type Visit = {
  id: string;
  placeId: string;
  placeName: string;
  visitedOn: string;
  mode: VisitMode;
  experience: Experience;
  feeling: Band;
  audience: Audience;
  note: string | null;
  score: number | null;
  dishes: { name: string; standout: boolean }[];
};

export default function EditVisit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [feeling, setFeeling] = useState<Band>('loved');
  const [audience, setAudience] = useState<Audience>('friends');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ visit: Visit }>(`/visits/${id}`)
      .then(({ visit }) => {
        setVisit(visit);
        setFeeling(visit.feeling);
        setAudience(visit.audience === 'circle' ? 'friends' : visit.audience);
        setNote(visit.note ?? '');
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (!visit) return <Screen><ErrorText error={error} /></Screen>;

  async function save() {
    if (!visit) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ needsRanking: boolean }>(`/visits/${id}`, {
        method: 'PATCH',
        body: { feeling, audience, note: note.trim() || null },
      });
      if (res.needsRanking) {
        router.replace({
          pathname: '/rank/[placeId]',
          params: { placeId: visit.placeId, name: visit.placeName, experience: visit.experience, band: feeling },
        });
      } else router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert('Delete this visit?', 'If it is your only visit here, the place leaves your ranking.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api(`/visits/${id}`, { method: 'DELETE' });
            router.back();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not delete');
          }
        },
      },
    ]);
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: visit.placeName }} />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Row>
          <ThemedText style={{ flex: 1 }} themeColor="textSecondary">
            {visit.visitedOn} · {label(MODES, visit.mode)}
          </ThemedText>
          <Score score={visit.score} />
        </Row>
        {visit.dishes.length > 0 ? <ThemedText>{visit.dishes.map((d) => d.name).join(', ')}</ThemedText> : null}

        <ThemedText type="smallBold" themeColor="textSecondary">
          How was it?
        </ThemedText>
        <Row wrap>
          {FEELINGS.map((f) => (
            <Chip key={f.value} label={f.label} selected={feeling === f.value} onPress={() => setFeeling(f.value)} />
          ))}
        </Row>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Who can see this?
        </ThemedText>
        <Row>
          {AUDIENCES.map((a) => (
            <Chip key={a.value} label={a.label} selected={audience === a.value} onPress={() => setAudience(a.value)} />
          ))}
        </Row>
        <Field label="Note" value={note} onChangeText={setNote} multiline maxLength={1000} />
        <Button label="Save" onPress={save} busy={busy} />
        <Button label="Delete visit" kind="danger" onPress={confirmDelete} />
        <ErrorText error={error} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, paddingVertical: Spacing.three },
});
