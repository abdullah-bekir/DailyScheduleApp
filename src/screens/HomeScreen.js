import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation, useScrollToTop } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import TasksCloudLoadingBanner from '../components/sync/TasksCloudLoadingBanner';

import DashboardPreviewCard from '../components/dashboard/DashboardPreviewCard';
import ScreenHero from '../components/layout/ScreenHero';
import SectionHeader from '../components/layout/SectionHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import PlanCompletionCelebrationCard from '../components/dashboard/PlanCompletionCelebrationCard';
import ProgressBar from '../components/dashboard/ProgressBar';
import MotivationQuoteBrowser from '../components/dashboard/MotivationQuoteBrowser';
import StatCard from '../components/dashboard/StatCard';
import TaskItem from '../components/dashboard/TaskItem';
import TextLink from '../components/common/TextLink';
import { useLocale } from '../context/LocaleContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTasks } from '../context/TasksContext';
import { getAdsRewardBonusPoints, isAdsUiEnabled } from '../lib/ads/adsConfig';
import { showInterstitialIfReady } from '../lib/ads/interstitialAd';
import { showRewardedAd } from '../lib/ads/rewardedAd';
import { useTheme } from '../context/ThemeContext';
import { cardShadow } from '../theme/shadows';
import {
  DEFAULT_DAILY_PLAN_GOAL,
  loadDailyPlanGoal,
} from '../utils/appSettingsStorage';
import { getCombinedDailyProgress, isDailyPlanProgressComplete } from '../utils/dailyPlanProgress';
import { formatTodayHeaderCapsLine, getTodayDateKey } from '../utils/dateKey';

const DASHBOARD_TASK_PREVIEW = 5;

function createStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    body: {
      paddingHorizontal: 20,
      gap: 20,
      marginTop: -16,
      paddingBottom: 20,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
      ...cardShadow(colors),
      gap: 14,
    },
    summaryHeading: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 0.3,
      marginBottom: 8,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    gridRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'stretch',
    },
    gridCell: {
      flex: 1,
      minWidth: 0,
      alignSelf: 'stretch',
    },
    taskList: {
      gap: 14,
    },
    emptyTasksWrap: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderStrong,
      borderRadius: 18,
      paddingVertical: 22,
      paddingHorizontal: 18,
      backgroundColor: colors.surfaceSubtle,
      alignItems: 'center',
      gap: 8,
    },
    emptyTasksTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    emptyTasks: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 21,
      textAlign: 'center',
    },
    inlineLink: {
      alignSelf: 'flex-start',
      marginTop: -8,
      marginBottom: -8,
    },
    fabHint: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
  });
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const tabBarHeight = useBottomTabBarHeight();
  const { t } = useTranslation();
  const { dateLocale } = useLocale();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isPro } = useSubscription();
  const { tasks, openAddTaskModal, refreshTasksFromSupabase, tasksHydrated, tasksDataReady, tasksSyncError, retryCloudSync, completionTally, grantAdRewardBonus } =
    useTasks();
  const navTapCountRef = useRef(0);
  const [rewardBusy, setRewardBusy] = useState(false);
  const [syncRetryBusy, setSyncRetryBusy] = useState(false);
  const [dailyPlanGoal, setDailyPlanGoal] = useState(DEFAULT_DAILY_PLAN_GOAL);
  const bonusPoints = useMemo(() => getAdsRewardBonusPoints(), []);

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

  const onOptionalAdReward = useCallback(async () => {
    if (!isAdsUiEnabled() || isPro) return;
    setRewardBusy(true);
    try {
      const r = await showRewardedAd();
      if (r.reason === 'disabled' || r.reason === 'expo-go') {
        Alert.alert(
          t('ads.unavailable'),
          r.reason === 'expo-go'
            ? t('ads.needBuild')
            : t('ads.notConfigured'),
        );
        return;
      }
      if (r.earned) {
        grantAdRewardBonus(bonusPoints);
        Alert.alert(t('common.thanks'), t('ads.pointsAdded', { points: bonusPoints }));
      } else if (r.shown) {
        Alert.alert(t('common.info'), t('ads.closedNoReward'));
      } else {
        Alert.alert(t('tabs.home'), t('ads.loadFailed'));
      }
    } finally {
      setRewardBusy(false);
    }
  }, [isPro, bonusPoints, grantAdRewardBonus, t]);

  useFocusEffect(
    useCallback(() => {
      if (!tasksDataReady) return undefined;
      refreshTasksFromSupabase();
      return undefined;
    }, [tasksDataReady, refreshTasksFromSupabase]),
  );

  const onRetrySync = useCallback(async () => {
    setSyncRetryBusy(true);
    try {
      await retryCloudSync();
    } finally {
      setSyncRetryBusy(false);
    }
  }, [retryCloudSync]);

  const todayKey = getTodayDateKey();
  const tasksToday = useMemo(() => tasks.filter((t) => t.dateKey === todayKey), [tasks, todayKey]);

  const progress = getCombinedDailyProgress(tasksToday, dailyPlanGoal);
  const planComplete = isDailyPlanProgressComplete(tasksToday, dailyPlanGoal);
  const completed = tasksToday.filter((t) => t.done).length;
  const remaining = tasksToday.length - completed;
  const allTasksDone = tasksToday.length > 0 && remaining === 0;
  const previewTasks = tasksToday.slice(0, DASHBOARD_TASK_PREVIEW);

  const stats = [
    { id: 'st1', label: t('common.total'), value: tasksToday.length, accent: 'primary' },
    { id: 'st2', label: t('common.remaining'), value: remaining, accent: 'warning' },
    { id: 'st3', label: t('common.completed'), value: completed, accent: 'success' },
  ];

  const { progressCaption, progressFootnote } = useMemo(() => {
    const goal = dailyPlanGoal;
    const n = tasksToday.length;
    if (n === 0) {
      return {
        progressCaption: t('home.progressEmpty'),
        progressFootnote: t('home.progressEmptyFoot', { goal }),
      };
    }

    if (planComplete) {
      return {
        progressCaption:
          n === goal
            ? t('home.progressCompleteExact', { goal })
            : t('home.progressCompleteOver', { goal, count: n }),
        progressFootnote:
          remaining === 0
            ? t('home.progressCompleteFootDone')
            : t('home.progressCompleteFootPending', { completed, remaining }),
      };
    }

    return {
      progressCaption: t('home.progressActive', { count: n, goal, completed, remaining }),
      progressFootnote: t('home.progressActiveFoot', { percent: progress, goal }),
    };
  }, [tasksToday, tasksToday.length, completed, remaining, dailyPlanGoal, progress, planComplete, t]);

  const heroDateCaps = formatTodayHeaderCapsLine(undefined, dateLocale);

  const navigateWithInterstitial = useCallback(
    async (routeName) => {
      if (!isPro) {
        navTapCountRef.current += 1;
        if (navTapCountRef.current % 7 === 0) {
          await showInterstitialIfReady();
        }
      }
      navigation.navigate(routeName);
    },
    [navigation, isPro],
  );

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
    >
      <ScreenHero
        variant="greeting"
        showBrandMark
        dateLine={heroDateCaps}
        title={t('home.greeting')}
        subtitle={t('home.subtitle')}
        titleSize={34}
      />

      <View style={styles.body}>
        <TasksCloudLoadingBanner
          colors={colors}
          visible={tasksHydrated && !tasksDataReady}
          error={tasksDataReady ? tasksSyncError : null}
          onRetry={onRetrySync}
          retryBusy={syncRetryBusy}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>{t('home.summaryTitle')}</Text>
          <ProgressBar
            variant="featured"
            headerTitle={t('home.progressTitle')}
            progress={progress}
            caption={progressCaption}
            footnote={progressFootnote}
          />
          {planComplete ? (
            <PlanCompletionCelebrationCard planGoal={dailyPlanGoal} allTasksDone={allTasksDone} />
          ) : null}
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <StatCard key={stat.id} label={stat.label} value={stat.value} accent={stat.accent} />
          ))}
        </View>

        <SectionHeader title={t('home.modulesTitle')} subtitle={t('home.modulesSubtitle')} />

        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              iconName="checkbox-outline"
              title={t('home.todoCard')}
              subtitle={
                tasksToday.length
                  ? t('home.todoProgress', { completed, total: tasksToday.length })
                  : t('home.todoEmpty')
              }
              onPress={() => navigateWithInterstitial('Gorevler')}
            />
          </View>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              iconName="calendar-outline"
              title={t('home.planCard')}
              subtitle={t('home.planCardSub')}
              onPress={() => navigateWithInterstitial('Gorevler')}
            />
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              iconName="stats-chart-outline"
              title={t('home.statsCard')}
              subtitle={t('home.statsCardSub', { points: completionTally })}
              onPress={() => navigateWithInterstitial('Istatistikler')}
            />
          </View>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              iconName="notifications-outline"
              title={t('home.remindersCard')}
              subtitle={t('home.remindersCardSub')}
              onPress={() => navigateWithInterstitial('Ayarlar')}
            />
          </View>
        </View>

        <SectionHeader
          title={t('home.todayTasks')}
          subtitle={tasksDataReady && tasksToday.length === 0 ? t('home.todayEmpty') : undefined}
        />

        <MotivationQuoteBrowser totalToday={tasksToday.length} remainingToday={remaining} />

        {tasksToday.length > 0 ? (
          <View style={styles.taskList}>
            {previewTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </View>
        ) : tasksDataReady ? (
          <View style={styles.emptyTasksWrap}>
            <Text style={styles.emptyTasksTitle}>{t('home.emptyTitle')}</Text>
            <Text style={styles.emptyTasks}>{t('home.emptyBody')}</Text>
          </View>
        ) : null}

        {tasksToday.length > DASHBOARD_TASK_PREVIEW ? (
          <View style={styles.inlineLink}>
            <TextLink title={t('home.seeAll', { count: tasksToday.length })} onPress={() => navigation.navigate('Gorevler')} />
          </View>
        ) : null}

        <PrimaryButton title={t('home.addTask')} onPress={openAddTaskModal} mutedCta />
        <Text style={styles.fabHint}>{t('home.addTaskHint')}</Text>

        {!isPro && isAdsUiEnabled() ? (
          <View style={styles.inlineLink}>
            <TextLink
              title={rewardBusy ? t('home.adOpening') : t('home.adReward', { points: bonusPoints })}
              onPress={() => !rewardBusy && onOptionalAdReward()}
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
