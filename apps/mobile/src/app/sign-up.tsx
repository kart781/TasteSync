import { isAdult, signUpBody } from '@tastesync/core';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Chip, ErrorText, Field, Row, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function SignUp() {
  const { signUp, signOut } = useSession();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [homeAreaId, setHomeAreaId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const parsed = signUpBody.safeParse({ username, displayName, birthDate, homeAreaId });

  useEffect(() => {
    api<{ areas: { id: string; name: string }[] }>('/areas').then((r) => setAreas(r.areas)).catch(() => {});
  }, []);

  async function submit() {
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check your details');
      return;
    }
    if (!isAdult(parsed.data.birthDate)) {
      setError('TasteSync is for people 18 and over.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signUp(parsed.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Field label="Your name" value={displayName} onChangeText={setDisplayName} autoComplete="name" />
        <Field
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="biryani_hunter"
        />
        <ThemedText type="small" themeColor="textSecondary">
          Date of birth (you must be 18 or over)
        </ThemedText>
        <Row>
          <Field placeholder="DD" value={day} onChangeText={setDay} keyboardType="number-pad" maxLength={2} style={styles.short} />
          <Field placeholder="MM" value={month} onChangeText={setMonth} keyboardType="number-pad" maxLength={2} style={styles.short} />
          <Field placeholder="YYYY" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} style={styles.year} />
        </Row>
        <ThemedText type="small" themeColor="textSecondary">
          Where do you usually eat? (optional, used when location is off)
        </ThemedText>
        <Row wrap>
          {areas.map((a) => (
            <Chip key={a.id} label={a.name} selected={homeAreaId === a.id} onPress={() => setHomeAreaId(homeAreaId === a.id ? undefined : a.id)} />
          ))}
        </Row>
        <Button label="Start logging" onPress={submit} busy={busy} />
        <Button label="Use a different number" kind="secondary" onPress={signOut} />
        <ErrorText error={error} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, paddingVertical: Spacing.three },
  short: { width: 64, textAlign: 'center' },
  year: { width: 96, textAlign: 'center' },
});
