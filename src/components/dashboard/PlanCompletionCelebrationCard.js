import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  getCelebrationPoolForGoal,
  pickCelebrationIndex,
} from '../../data/dailyPlanCompletionCelebrations';
import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';

function createStyles(colors) {
  return StyleSheet.create({
    wrap: {
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.success,
      backgroundColor: colors.badgeDoneBg,
      gap: 12,
      ...cardShadow(colors, 'sm'),
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.success,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    emoji: {
      fontSize: 36,
      lineHeight: 42,
      textAlign: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
      textAlign: 'center',
      lineHeight: 22,
      letterSpacing: -0.2,
    },
    quote: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 21,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginTop: 4,
    },
    navBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navHint: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textTertiary,
    },
    doneExtra: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.success,
      textAlign: 'center',
      marginTop: 2,
    },
  });
}

/**
 * Günlük plan %100 olduğunda ana sayfada gösterilir (hedef: 3, 5, 8, 10, 15, 20).
 */
export default function PlanCompletionCelebrationCard({ planGoal, allTasksDone = false }) {
  const { t } = useTranslation();
  const { language } = useLocale();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const pool = useMemo(() => getCelebrationPoolForGoal(planGoal, language), [language, planGoal]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(pickCelebrationIndex(pool.length));
  }, [planGoal, pool.length]);

  const item = pool[index] ?? pool[0];
  if (!item) return null;

  const goPrev = () => {
    setIndex((i) => {
      const next = (i - 1 + pool.length) % pool.length;
      return next;
    });
  };

  const goNext = () => {
    setIndex((i) => pickCelebrationIndex(pool.length, i));
  };

  return (
    <View style={styles.wrap} accessibilityRole="summary" accessibilityLabel={t('celebration.a11y')}>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={styles.badgeText}>{t('celebration.plan100')}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('celebration.goalBadge', { goal: planGoal })}</Text>
        </View>
      </View>

      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.quote}>{item.quote}</Text>

      {allTasksDone ? (
        <Text style={styles.doneExtra}>{t('celebration.allDone')}</Text>
      ) : null}

      {pool.length > 1 ? (
        <View style={styles.navRow}>
          <Pressable style={styles.navBtn} onPress={goPrev} accessibilityLabel={t('celebration.prev')}>
            <Ionicons name="chevron-back" size={18} color={colors.primary} />
          </Pressable>
          <Text style={styles.navHint}>
            {index + 1} / {pool.length}
          </Text>
          <Pressable style={styles.navBtn} onPress={goNext} accessibilityLabel={t('celebration.next')}>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
