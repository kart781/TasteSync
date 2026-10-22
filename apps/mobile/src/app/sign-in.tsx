import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, ErrorText, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { phoneAuth } from '@/lib/auth';
import { useSession } from '@/lib/session';

export default function SignIn() {
  const { refresh } = useSession();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState<((code: string) => Promise<void>) | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, '');
  const valid = /^[6-9]\d{9}$/.test(digits); // Indian mobile numbers

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.body}>
        <ThemedText type="subtitle">TasteSync</ThemedText>
        <ThemedText themeColor="textSecondary">
          Your food diary, ranked, with the friends whose taste you trust.
        </ThemedText>

        {confirm === null ? (
          <>
            <Field
              label="Mobile number"
              placeholder="98765 43210"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              value={phone}
              onChangeText={setPhone}
              maxLength={14}
            />
            <Button
              label="Send code"
              disabled={!valid}
              busy={busy}
              onPress={() =>
                run(async () => {
                  const confirmCode = await phoneAuth.sendCode(`+91${digits}`);
                  setConfirm(() => confirmCode); // a function in state must be wrapped
                })
              }
            />
          </>
        ) : (
          <>
            <ThemedText>Enter the 6-digit code sent to +91 {digits}.</ThemedText>
            <Field
              placeholder="123456"
              keyboardType="number-pad"
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              value={code}
              onChangeText={setCode}
              maxLength={6}
              autoFocus
            />
            <Button
              label="Verify"
              disabled={code.length !== 6}
              busy={busy}
              onPress={() =>
                run(async () => {
                  await confirm(code);
                  await refresh();
                })
              }
            />
            <Button label="Change number" kind="secondary" onPress={() => setConfirm(null)} />
          </>
        )}
        <ErrorText error={error} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: Spacing.three },
});
