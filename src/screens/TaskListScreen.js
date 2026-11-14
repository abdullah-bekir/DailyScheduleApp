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
import TaskFilterChips from '../components/tasks/TaskFilterChips';
import ScreenHero from '../components/layout/ScreenHero';
import TasksCloudLoadingBanner from '../components/sync/TasksCloudLoadingBanner';
import { useAppSettings } from '../context/AppSettingsContext';
import { useLocale } from '../context/LocaleContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { isAdsUiEnabled } from '../lib/ads/adsConfig';
import { cardShadow } from '../theme/shadows';
import { getCombinedDailyProgress } from '../utils/dailyPlanProgress';
import { addDaysToDateKey, formatDateKeyForDisplay, getTodayDateKey } from '../utils/dateKey';
import { sortTasksByTime } from '../utils/sortTasks';

function createStyles(colors, isRtl) {
  const dir = isRtl ? 'rtl' : 'ltr';
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    body: { flex: 1, marginTop: -18, paddingHorizontal: 20 },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 14,
      marginBottom: 14,
      ...cardShadow(colors),
    },
    dateRow: {
      flexDirection: 'row',
      direction: dir,
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    navBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.surfaceSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateTextWrap: { flex: 1, alignItems: 'center', gap: 6 },
    dateText: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.2 },
    todayChip: {
      flexDirection: 'row',
      direction: dir,
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    todayChipText: { fontSize: 11, fontWeight: '800', color: colors.textPrimary },
    daysStrip: {
      marginTop: 14,
      flexDirection: 'row',
      direction: dir,
      justifyContent: 'space-between',
      gap: 6,
    },
    dayCell: {
      flex: 1,
      borderRadius: 14,
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 7,
      minWidth: 0,
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    dayCellToday: { borderColor: colors.borderStrong },
    dayCellSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    dayDow: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    dayDom: { marginTop: 3, fontSize: 15, color: colors.textPrimary, fontWeight: '800' },
    dayTextSelected: { color: colors.onPrimary },
    dayDot: { marginTop: 5, width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent' },
    dayDotOn: { backgroundColor: colors.textTertiary },
    dayDotSelected: { backgroundColor: colors.onPrimary },
    listHeader: {
      flexDirection: 'row',
      direction: dir,
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 12,
    },
    listTitleWrap: { flexDirection: 'row', direction: dir, alignItems: 'center', gap: 8, flexShrink: 1 },
    listTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
    countBadge: {
      minWidth: 24,
      paddingHorizontal: 7,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.surfaceSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countText: { fontSize: 12, fontWeight: '800', color: colors.textSecondary },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: colors.ctaMuted || colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterWrap: { marginBottom: 12 },
    taskList: { gap: 10 },
    empty: { alignItems: 'center', paddingVertical: 26, gap: 10 },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surfaceSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 6 },
    emptyAction: { alignSelf: 'stretch', marginTop: 4 },
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
  const { isPro, ready: subscriptionReady } = useSubscription();
  const showAds = subscriptionReady && !isPro && isAdsUiEnabled();
  const { dailyPlanGoal } = useAppSettings();

  const scrollBottomPad = useMemo(() => {
    const tab = tabBarHeight + 12;
    return Math.max(insets.bottom + tab + 8, tab + 20);
  }, [insets.bottom, tabBarHeight]);

  const {
    tasks,
    openAddTaskModalForDate,
    tasksHydrated,
    tasksDataReady,
    tasksMutationReady,
    tasksSyncError,
    retryCloudSync,
    refreshTasksFromSupabase,
  } = useTasks();
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayDateKey());
  const [retryBusy, setRetryBusy] = useState(false);
  const [filter, setFilter] = useState('all');

  const todayKey = getTodayDateKey();
  const isToday = selectedDateKey === todayKey;

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

  const datesWithTasks = useMemo(() => {
    const set = new Set();
    if (Array.isArray(tasks)) tasks.forEach((x) => x?.dateKey && set.add(x.dateKey));
    return set;
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === 'done') return tasksForDate.filter((x) => x?.done);
    if (filter === 'active') return tasksForDate.filter((x) => !x?.done);
    return tasksForDate;
  }, [tasksForDate, filter]);

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

        <View style={styles.card}>
          <View style={styles.dateRow}>
            <Pressable
              style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setSelectedDateKey((prev) => addDaysToDateKey(prev, -1))}
              accessibilityRole="button"
              accessibilityLabel={t('tasks.prevDay')}
            >
              <Ionicons name={isRtl ? 'chevron-forward' : 'chevron-back'} size={20} color={colors.textPrimary} />
            </Pressable>

            <View style={styles.dateTextWrap}>
              <Text style={styles.dateText} numberOfLines={1}>
                {formatDateKeyForDisplay(selectedDateKey, dateLocale)}
              </Text>
              {!isToday ? (
                <Pressable
                  style={styles.todayChip}
                  onPress={() => setSelectedDateKey(todayKey)}
                  accessibilityRole="button"
                  accessibilityLabel={t('tasks.backToToday')}
                >
                  <Ionicons name="today-outline" size={12} color={colors.textPrimary} />
                  <Text style={styles.todayChipText}>{t('tasks.backToToday')}</Text>
                </Pressable>
              ) : null}
            </View>

            <Pressable
              style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setSelectedDateKey((prev) => addDaysToDateKey(prev, 1))}
              accessibilityRole="button"
              accessibilityLabel={t('tasks.nextDay')}
            >
              <Ionicons name={isRtl ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.daysStrip}>
            {dayStrip.map((d) => {
              const key = getTodayDateKey(d);
              const selected = key === selectedDateKey;
              return (
                <Pressable
                  key={key}
                  style={[styles.dayCell, key === todayKey && styles.dayCellToday, selected && styles.dayCellSelected]}
                  onPress={() => setSelectedDateKey(key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={d.toLocaleDateString(dateLocale)}
                >
                  <Text style={[styles.dayDow, selected && styles.dayTextSelected]}>
                    {d.toLocaleDateString(dateLocale, { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dayDom, selected && styles.dayTextSelected]}>{d.getDate()}</Text>
                  <View
                    style={[
                      styles.dayDot,
                      datesWithTasks.has(key) && (selected ? styles.dayDotSelected : styles.dayDotOn),
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {tasksForDate.length > 0 ? (
          <View style={styles.card}>
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

        <View style={styles.card}>
          <View style={styles.listHeader}>
            <View style={styles.listTitleWrap}>
              <Text style={styles.listTitle}>{t('tasks.listTitle')}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{tasksForDate.length}</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }, !tasksMutationReady && { opacity: 0.5 }]}
              onPress={() => openAddTaskModalForDate(selectedDateKey)}
              disabled={!tasksMutationReady}
              accessibilityRole="button"
              accessibilityLabel={t('tasks.addPlanBtn')}
            >
              <Ionicons name="add" size={24} color={colors.onCtaMuted || colors.onPrimary} />
            </Pressable>
          </View>

          {tasksForDate.length > 0 ? (
            <View style={styles.filterWrap}>
              <TaskFilterChips value={filter} onChange={setFilter} compact />
            </View>
          ) : null}

          {visibleTasks.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="checkmark-done-outline" size={26} color={colors.textTertiary} />
              </View>
              <Text style={styles.emptyText}>{t('tasks.empty')}</Text>
              {tasksForDate.length === 0 ? (
                <View style={styles.emptyAction}>
                  <PrimaryButton
                    title={t('tasks.addPlanBtn')}
                    onPress={() => openAddTaskModalForDate(selectedDateKey)}
                    disabled={!tasksMutationReady}
                    mutedCta
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.taskList}>
              {visibleTasks.map((item) => (
                <TaskItem key={String(item.id)} task={item} />
              ))}
            </View>
          )}
        </View>

        {showAds ? (
          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <AdMobBannerCard />
          </View>
        ) : null}

        <View style={styles.footerPad} />
      </ScrollView>
    </View>
  );
}
