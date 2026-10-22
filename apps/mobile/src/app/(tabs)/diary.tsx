// Every visit by date: a month calendar with the month's count, and the list below.
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Chip, ErrorText, Row, Screen, Score } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api';
import { label, MODES } from '@/lib/labels';
import type { VisitMode } from '@tastesync/core';

type DiaryVisit = { id: string; visitedOn: string; mode: VisitMode; placeName: string; score: number | null };

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split('-').map(Number) as [number, number];
  return monthKey(new Date(y, m - 1 + delta, 1));
}

export default function Diary() {
  const theme = useTheme();
  const [month, setMonth] = useState(monthKey(new Date()));
  const [visits, setVisits] = useState<DiaryVisit[]>([]);
  const [day, setDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ visits: DiaryVisit[] }>(`/me/diary?month=${month}`);
      setVisits(res.visits);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const [y, m] = month.split('-').map(Number) as [number, number];
  const daysInMonth = new Date(y, m, 0).getDate();
  const leadingBlanks = (new Date(y, m - 1, 1).getDay() + 6) % 7; // weeks start on Monday
  const countByDay = new Map<number, number>();
  for (const v of visits) {
    const d = Number(v.visitedOn.slice(8, 10));
    countByDay.set(d, (countByDay.get(d) ?? 0) + 1);
  }
  const shown = day === null ? visits : visits.filter((v) => Number(v.visitedOn.slice(8, 10)) === day);
  const monthName = new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const changeMonth = (delta: number) => {
    setMonth(shiftMonth(month, delta));
    setDay(null);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <ThemedText type="subtitle">Diary</ThemedText>
        <Row>
          <Chip label="‹" selected={false} onPress={() => changeMonth(-1)} />
          <ThemedText style={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>
            {monthName} · {visits.length} {visits.length === 1 ? 'visit' : 'visits'}
          </ThemedText>
          <Chip label="›" selected={false} onPress={() => changeMonth(1)} />
        </Row>

        <View style={styles.grid}>
          {WEEKDAYS.map((w, i) => (
            <ThemedText key={`w${i}`} type="small" themeColor="textSecondary" style={styles.cell}>
              {w}
            </ThemedText>
          ))}
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <View key={`b${i}`} style={styles.cell} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
            const count = countByDay.get(d) ?? 0;
            const selected = day === d;
            return (
              <Pressable
                key={d}
                onPress={() => setDay(selected ? null : d)}
                style={[styles.cell, styles.dayCell, selected && { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText type="small">{d}</ThemedText>
                <View style={[styles.dot, { backgroundColor: count > 0 ? theme.accent : 'transparent' }]} />
              </Pressable>
            );
          })}
        </View>

        <ErrorText error={error} />
        {shown.map((v) => (
          <Pressable
            key={v.id}
            onPress={() => router.push({ pathname: '/visit/[id]', params: { id: v.id } })}
            style={[styles.row, { borderColor: theme.backgroundSelected }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontWeight: 700 }}>{v.placeName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {v.visitedOn} · {label(MODES, v.mode)}
              </ThemedText>
            </View>
            <Score score={v.score} />
          </Pressable>
        ))}
        {visits.length === 0 && !loading ? <ThemedText themeColor="textSecondary">No visits this month.</ThemedText> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, paddingVertical: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', textAlign: 'center', paddingVertical: 4 },
  dayCell: { borderRadius: 8, gap: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two, borderBottomWidth: StyleSheet.hairlineWidth },
});
