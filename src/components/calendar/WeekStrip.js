import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';
import { getTodayDateKey } from '../../utils/dateKey';

function createStyles(colors) {
  return StyleSheet.create({
    outer: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
      paddingVertical: 6,
      paddingHorizontal: 4,
      ...cardShadow(colors, 'sm'),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    navBtn: {
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      minWidth: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navBtnText: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.primary,
      lineHeight: 19,
    },
    days: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 5,
    },
    dayCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      minWidth: 0,
    },
    dayCellSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.28,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    dayCellToday: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    dow: {
      fontSize: 8,
      fontWeight: '800',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.35,
    },
    dowSelected: {
      color: colors.calendarSelectedText,
    },
    dom: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textPrimary,
      marginTop: 2,
      letterSpacing: -0.4,
    },
    domSelected: {
      color: colors.calendarSelectedText,
    },
  });
}

export default function WeekStrip({ weekDays, selectedDateKey, onSelectDateKey, onPrevDay, onNextDay }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const todayKey = getTodayDateKey();

  return (
    <View style={styles.outer}>
      <View style={styles.row}>
        <Pressable
          style={styles.navBtn}
          onPress={onPrevDay}
          hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Önceki gün"
        >
          <Text style={styles.navBtnText}>‹</Text>
        </Pressable>
        <View style={styles.days}>
          {weekDays.map((d) => {
            const key = getTodayDateKey(d);
            const selected = key === selectedDateKey;
            const isToday = key === todayKey;
            const dow = d.toLocaleDateString('tr-TR', { weekday: 'short' });
            const dom = String(d.getDate());
            return (
              <Pressable
                key={key}
                onPress={() => onSelectDateKey(key)}
                style={[
                  styles.dayCell,
                  selected && styles.dayCellSelected,
                  !selected && isToday && styles.dayCellToday,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: Boolean(selected) }}
              >
                <Text style={[styles.dow, selected && styles.dowSelected]}>{dow}</Text>
                <Text style={[styles.dom, selected && styles.domSelected]}>{dom}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          style={styles.navBtn}
          onPress={onNextDay}
          hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Sonraki gün"
        >
          <Text style={styles.navBtnText}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}
