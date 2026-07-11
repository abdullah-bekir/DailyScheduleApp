import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AdMobBannerCard from '../components/ads/AdMobBannerCard';
import TaskItem from '../components/dashboard/TaskItem';
import ProgressBar from '../components/dashboard/ProgressBar';
import PrimaryButton from '../components/common/PrimaryButton';
import ScreenHero from '../components/layout/ScreenHero';
import TasksCloudLoadingBanner from '../components/sync/TasksCloudLoadingBanner';
import { useLocale } from '../context/LocaleContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { isAdsUiEnabled } from '../lib/ads/adsConfig';
import { cardShadow } from '../theme/shadows';
import {
  DEFAULT_DAILY_PLAN_GOAL,
  loadDailyPlanGoal,
} from '../utils/appSettingsStorage';
import { getCombinedDailyProgress } from '../utils/dailyPlanProgress';
import { addDaysToDateKey, formatDateKeyForDisplay, getTodayDateKey } from '../utils/dateKey';
import { sortTasksByTime } from '../utils/sortTasks';

function createStyles(colors, isRtl) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    body: { flex: 1, marginTop: -18, paddingHorizontal: 20 },
    dateCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 12,
      marginBottom: 12,
      ...cardShadow(colors),
    },
    dateRow: {
      flexDirection: 'row',
      direction: isRtl ? 'rtl' : 'ltr',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateTextWrap: { flex: 1, alignItems: 'center' },
    dateText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
    todayChip: {
      alignSelf: 'center',
      marginTop: 10,
      flexDirection: 'row',
      direction: isRtl ? 'rtl' : 'ltr',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    todayChipText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
    },
    daysStrip: {
      marginTop: 10,
      flexDirection: 'row',
      direction: isRtl ? 'rtl' : 'ltr',
      justifyContent: 'space-between',
      gap: 6,
    },
    dayCell: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
      alignItems: 'center',
      paddingVertical: 6,
      minWidth: 0,
    },
    dayCellSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    dayDow: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    dayDom: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '800',
    },
    progressCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      marginBottom: 12,
      ...cardShadow(colors),
      gap: 8,
    },
    planCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      marginBottom: 12,
      ...cardShadow(colors),
    },
    planTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
    planText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 10 },
    listCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 10,
      ...cardShadow(colors, 'sm'),
    },
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 10,
    },
    statPill: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
      paddingHorizontal: 10,
      paddingVertical: 9,
      alignItems: 'center',
      gap: 2,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    listTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
    taskList: { gap: 12 },
    emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingVertical: 14 },
    footerPad: { height: 12 },
  });
}

function parseDateKey(key) {
  const [y, m, d] = String(key || '').split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

function dayStripFromSelected(selectedDateKey) {
  const center = parseDateKey(selectedDateKey);
  const days = [];
  for (let i = -3; i <= 3; i += 1) {
    const date = new Date(center);
    date.setDate(center.getDate() + i);
    days.push(date);
  }
  return days;
}

export default function TaskListScreen() {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const { t } = useTranslation();
  const { dateLocale, isRtl } = useLocale();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, isRtl), [colors, isRtl]);
  const { isPro } = useSubscription();

  const scrollBottomPad = useMemo(() => {
    const tab = tabBarHeight + 12;
    return Math.max(insets.bottom + tab + 8, tab + 20);
  }, [insets.bottom, tabBarHeight]);

  const {
    tasks,
    openAddTaskModalForDate,
    tasksHydrated,
    tasksDataReady,
    tasksSyncError,
    retryCloudSync,
    refreshTasksFromSupabase,
  } = useTasks();
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayDateKey());
  const [dailyPlanGoal, setDailyPlanGoal] = useState(DEFAULT_DAILY_PLAN_GOAL);
  const [retryBusy, setRetryBusy] = useState(false);

  const todayKey = getTodayDateKey();
  const isToday = selectedDateKey === todayKey;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDailyPlanGoal().then((g) => {
        if (active) setDailyPlanGoal(g);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!tasksDataReady) return undefined;
      refreshTasksFromSupabase();
      return undefined;
    }, [tasksDataReady, refreshTasksFromSupabase]),
  );

  const tasksForDate = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks.filter((t) => t?.dateKey === selectedDateKey) : [];
    return sortTasksByTime(list);
  }, [tasks, selectedDateKey]);

  const subtitle = useMemo(
    () => formatDateKeyForDisplay(selectedDateKey, dateLocale),
    [selectedDateKey, dateLocale],
  );
  const dayStrip = useMemo(() => dayStripFromSelected(selectedDateKey), [selectedDateKey]);
  const doneCount = useMemo(
    () => tasksForDate.filter((t) => Boolean(t?.done)).length,
    [tasksForDate],
  );
  const dayProgress = getCombinedDailyProgress(tasksForDate, dailyPlanGoal);

  const onRetrySync = useCallback(async () => {
    setRetryBusy(true);
    try {
      await retryCloudSync();
    } finally {
      setRetryBusy(false);
    }
  }, [retryCloudSync]);

  return (
    <View style={styles.root}>
      <ScreenHero eyebrow={t('tasks.eyebrow')} title={t('tasks.title')} subtitle={subtitle} titleSize={30} />

      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={{ paddingBottom: scrollBottomPad }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <TasksCloudLoadingBanner
          colors={colors}
          visible={tasksHydrated && !tasksDataReady}
          error={tasksDataReady ? tasksSyncError : null}
          onRetry={onRetrySync}
          retryBusy={retryBusy}
        />

        <View style={styles.dateCard}>
          <View style={styles.dateRow}>
            <Pressable
              style={styles.navBtn}
              onPress={() => setSelectedDateKey((prev) => addDaysToDateKey(prev, -1))}
              accessibilityRole="button"
              accessibilityLabel={t('tasks.prevDay')}
            >
              <Ionicons name={isRtl ? 'chevron-forward' : 'chevron-back'} size={20} color={colors.primary} />
            </Pressable>

            <View style={styles.dateTextWrap}>
              <Text style={styles.dateText}>{formatDateKeyForDisplay(selectedDateKey, dateLocale)}</Text>
            </View>

            <Pressable
              style={styles.navBtn}
              onPress={() => setSelectedDateKey((prev) => addDaysToDateKey(prev, 1))}
              accessibilityRole="button"
              accessibilityLabel={t('tasks.nextDay')}
            >
              <Ionicons name={isRtl ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.primary} />
            </Pressable>
          </View>

          {!isToday ? (
            <Pressable
              style={styles.todayChip}
              onPress={() => setSelectedDateKey(todayKey)}
              accessibilityRole="button"
              accessibilityLabel={t('tasks.backToToday')}
            >
              <Ionicons name="today-outline" size={14} color={colors.primary} />
              <Text style={styles.todayChipText}>{t('tasks.backToToday')}</Text>
            </Pressable>
          ) : null}

          <View style={styles.daysStrip}>
            {dayStrip.map((d) => {
              const key = getTodayDateKey(d);
              const selected = key === selectedDateKey;
              return (
                <Pressable
                  key={key}
                  style={[styles.dayCell, selected && styles.dayCellSelected]}
                  onPress={() => setSelectedDateKey(key)}
                  accessibilityRole="button"
                  accessibilityLabel={d.toLocaleDateString(dateLocale)}
                >
                  <Text style={styles.dayDow}>{d.toLocaleDateString(dateLocale, { weekday: 'short' })}</Text>
                  <Text style={styles.dayDom}>{d.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {tasksForDate.length > 0 ? (
          <View style={styles.progressCard}>
            <ProgressBar
              headerTitle={t('tasks.dayProgress')}
              progress={dayProgress}
              caption={t('tasks.dayProgressCaption', {
                total: tasksForDate.length,
                completed: doneCount,
                remaining: tasksForDate.length - doneCount,
              })}
              footnote={t('tasks.dayProgressFoot', { goal: dailyPlanGoal })}
            />
          </View>
        ) : null}

        <View style={styles.planCard}>
          <Text style={styles.planTitle}>{t('tasks.addPlanTitle')}</Text>
          <Text style={styles.planText}>{t('tasks.addPlanBody')}</Text>
          <PrimaryButton
            title={t('tasks.addPlanBtn')}
            onPress={() => openAddTaskModalForDate(selectedDateKey)}
            mutedCta
          />
        </View>

        <View style={styles.listCard}>
          <Text style={styles.listTitle}>{t('tasks.listTitle')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>{t('common.total')}</Text>
              <Text style={styles.statValue}>{tasksForDate.length}</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>{t('common.completed')}</Text>
              <Text style={styles.statValue}>{doneCount}</Text>
            </View>
          </View>

          {tasksForDate.length === 0 ? (
            <Text style={styles.emptyText}>{t('tasks.empty')}</Text>
          ) : (
            <View style={styles.taskList}>
              {tasksForDate.map((item) => (
                <TaskItem key={String(item.id)} task={item} />
              ))}
            </View>
          )}
        </View>

        {!isPro && isAdsUiEnabled() ? (
          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <AdMobBannerCard />
          </View>
        ) : null}

        <View style={styles.footerPad} />
      </ScrollView>
    </View>
  );
}
