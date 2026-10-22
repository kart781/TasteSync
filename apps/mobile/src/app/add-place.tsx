// Adds a missing place at the person's current location. It is usable at once and
// shown to others only after review.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Chip, ErrorText, Field, Row, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { api, ApiError } from '@/lib/api';
import { currentPosition } from '@/lib/location';

type Similar = { id: string; name: string };

export default function AddPlace() {
  const params = useLocalSearchParams<{ name?: string }>();
  const [name, setName] = useState(params.name ?? '');
  const [landmark, setLandmark] = useState('');
  const [cuisines, setCuisines] = useState('');
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [similar, setSimilar] = useState<Similar[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logAt = (id: string, placeName: string) =>
    router.replace({ pathname: '/log/[placeId]', params: { placeId: id, name: placeName } });

  async function submit(confirm: boolean) {
    setBusy(true);
    setError(null);
    try {
      const pos = await currentPosition();
      if (!pos) throw new Error('Location is needed to pin the place. Allow it in Settings.');
      const res = await api<{ place: { id: string; name: string } }>(`/places${confirm ? '?confirm=true' : ''}`, {
        method: 'POST',
        body: {
          name: name.trim(),
          lat: pos.lat,
          lng: pos.lng,
          landmark: landmark.trim() || undefined,
          cuisines: cuisines.split(',').map((c) => c.trim()).filter(Boolean),
          isDeliveryOnly: deliveryOnly,
        },
      });
      logAt(res.place.id, res.place.name);
    } catch (e) {
      if (e instanceof ApiError && Array.isArray(e.body.similar)) setSimilar(e.body.similar as Similar[]);
      else setError(e instanceof Error ? e.message : 'Could not add the place');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <ThemedText themeColor="textSecondary">Add it where you are now. You can log it right away.</ThemedText>
        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Landmark (optional)" placeholder="Opposite the bus stop" value={landmark} onChangeText={setLandmark} />
        <Field label="Cuisines (optional)" placeholder="Biryani, Irani" value={cuisines} onChangeText={setCuisines} />
        <Row>
          <Chip label="Delivery only" selected={deliveryOnly} onPress={() => setDeliveryOnly(!deliveryOnly)} />
        </Row>

        {similar.length > 0 ? (
          <>
            <ThemedText style={{ fontWeight: 700 }}>Is it one of these?</ThemedText>
            {similar.map((s) => (
              <Button key={s.id} label={s.name} kind="secondary" onPress={() => logAt(s.id, s.name)} />
            ))}
            <Button label="No, add it anyway" onPress={() => submit(true)} busy={busy} />
          </>
        ) : (
          <Button label="Add and log" onPress={() => submit(false)} disabled={name.trim().length < 2} busy={busy} />
        )}
        <ErrorText error={error} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, paddingVertical: Spacing.three },
});
