// Ranks a place already in a list: one skipped earlier, or moved to a new band.
import type { Band, Experience } from '@tastesync/core';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Compare } from '@/components/compare';
import { ErrorText, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { api } from '@/lib/api';

export default function Rank() {
  const { placeId, name, experience, band } = useLocalSearchParams<{
    placeId: string;
    name: string;
    experience: Experience;
    band: Band;
  }>();
  const [error, setError] = useState<string | null>(null);

  return (
    <Screen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Compare
          placeId={placeId}
          placeName={name}
          experience={experience}
          band={band}
          onDone={async (result) => {
            if (result === 'skip') return router.back();
            try {
              await api('/me/rankings/rank', {
                method: 'POST',
                body: { placeId, experience, band, comparisons: result.answers },
              });
              router.back();
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Could not save the ranking');
            }
          }}
        />
        <ErrorText error={error} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, paddingVertical: Spacing.three },
});
