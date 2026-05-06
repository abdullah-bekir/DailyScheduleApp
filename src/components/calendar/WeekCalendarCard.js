import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';
import {
  addDaysToDateKey,
  formatDateKeyForDisplay,
  getTodayDateKey,
  getWeekDaysContaining,
} from '../../utils/dateKey';

import WeekStrip from './WeekStrip';

function mondayOf(date) {
  return getWeekDaysContaining(date)[0];
}

function createStyles(colors) {
  return StyleSheet.create({
    calendarCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      ...cardShadow(colors),
      gap: 8,
    },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    monthTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.25,
      flex: 1,
    },
    todayBtn: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    todayBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    selectedBadge: {
      alignSelf: 'flex-start',
      marginTop: 0,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    selectedBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
  });
}

/**
 * Haftalık şerit: ay başlığı, hafta gezgini, seçili gün rozeti.
 * `selectedDateKey` dışarıda tutulur; görünür hafta seçili güne göre senkronlanır.
 */
export default function WeekCalendarCard({ selectedDateKey, onSelectDateKey }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [weekMonday, setWeekMonday] = useState(() => mondayOf(new Date()));

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i += 1) {
      const x = new Date(weekMonday);
      x.setDate(weekMonday.getDate() + i);
      days.push(x);
    }
    return days;
  }, [weekMonday]);

  const containsSelected = useMemo(
    () => weekDays.some((d) => getTodayDateKey(d) === selectedDateKey),
    [weekDays, selectedDateKey],
  );

  useEffect(() => {
    if (!selectedDateKey) return;
    if (containsSelected) return;
    const parts = selectedDateKey.split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return;
    const [y, m, d] = parts;
    setWeekMonday(mondayOf(new Date(y, m - 1, d)));
  }, [selectedDateKey, containsSelected]);

  const monthTitle = weekDays[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const goPrevDay = () => {
    onSelectDateKey(addDaysToDateKey(selectedDateKey, -1));
  };

  const goNextDay = () => {
    onSelectDateKey(addDaysToDateKey(selectedDateKey, 1));
  };

  const jumpToday = () => {
    const now = new Date();
    setWeekMonday(mondayOf(now));
    onSelectDateKey(getTodayDateKey(now));
  };

  return (
    <View style={styles.calendarCard}>
      <View style={styles.monthRow}>
        <Text style={styles.monthTitle}>{monthTitle}</Text>
        <Pressable style={styles.todayBtn} onPress={jumpToday} accessibilityRole="button">
          <Text style={styles.todayBtnText}>Bugüne dön</Text>
        </Pressable>
      </View>

      <WeekStrip
        weekDays={weekDays}
        selectedDateKey={selectedDateKey}
        onSelectDateKey={onSelectDateKey}
        onPrevDay={goPrevDay}
        onNextDay={goNextDay}
      />

      <View style={styles.selectedBadge}>
        <Text style={styles.selectedBadgeText}>{formatDateKeyForDisplay(selectedDateKey)}</Text>
      </View>
    </View>
  );
}
