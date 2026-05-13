import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation, useScrollToTop } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import TasksCloudLoadingBanner from '../components/sync/TasksCloudLoadingBanner';

import DashboardPreviewCard from '../components/dashboard/DashboardPreviewCard';
import ScreenHero from '../components/layout/ScreenHero';
import SectionHeader from '../components/layout/SectionHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import ProgressBar from '../components/dashboard/ProgressBar';
import MotivationQuoteBrowser from '../components/dashboard/MotivationQuoteBrowser';
import StatCard from '../components/dashboard/StatCard';
import TaskItem from '../components/dashboard/TaskItem';
import TextLink from '../components/common/TextLink';
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
import { formatTodayHeaderCapsLine, getTodayDateKey } from '../utils/dateKey';

const DASHBOARD_TASK_PREVIEW = 5;

/**
 * Tek çubukta iki bileşen (%50 + %50):
 * - Plan: bugün kaç görev ekledin (hedefe göre ölçeklenir; silince düşer).
 * - Tamamlama: tik oranı (tik atınca yükselir).
 * Hepsi bitince her zaman %100.
 */
function getCombinedDailyProgress(taskList, planGoal) {
  const n = taskList.length;
  if (n === 0) return 0;
  const done = taskList.filter((t) => t.done).length;
  if (done === n) return 100;
  const goal = Math.max(1, planGoal);
  const planFraction = Math.min(1, n / goal);
  const completeFraction = done / n;
  return Math.round(planFraction * 50 + completeFraction * 50);
}

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
      gap: 4,
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isPro } = useSubscription();
  const { tasks, openAddTaskModal, refreshTasksFromSupabase, tasksHydrated, tasksDataReady, grantAdRewardBonus } =
    useTasks();
  const navTapCountRef = useRef(0);
  const [rewardBusy, setRewardBusy] = useState(false);
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
          'Şu an kullanılamıyor',
          r.reason === 'expo-go'
            ? 'Bu özellik için yüklü uygulama gerekir.'
            : 'Reklamlar yapılandırılmamış.',
        );
        return;
      }
      if (r.earned) {
        grantAdRewardBonus(bonusPoints);
        Alert.alert('Teşekkürler', `+${bonusPoints} tamamlama puanı eklendi.`);
      } else if (r.shown) {
        Alert.alert('Bilgi', 'Reklam kapandı; ödül onayı gelmezse puan eklenmez.');
      } else {
        Alert.alert('Reklam', 'Yüklenemedi; daha sonra deneyin.');
      }
    } finally {
      setRewardBusy(false);
    }
  }, [isPro, bonusPoints, grantAdRewardBonus]);

  useFocusEffect(
    useCallback(() => {
      if (!tasksDataReady) return undefined;
      refreshTasksFromSupabase();
      return undefined;
    }, [tasksDataReady, refreshTasksFromSupabase]),
  );

  const todayKey = getTodayDateKey();
  const tasksToday = useMemo(() => tasks.filter((t) => t.dateKey === todayKey), [tasks, todayKey]);

  const progress = getCombinedDailyProgress(tasksToday, dailyPlanGoal);
  const completed = tasksToday.filter((t) => t.done).length;
  const remaining = tasksToday.length - completed;
  const previewTasks = tasksToday.slice(0, DASHBOARD_TASK_PREVIEW);

  const stats = [
    { id: 'st1', label: 'Toplam görev', value: tasksToday.length, accent: 'primary' },
    { id: 'st2', label: 'Tamamlanan', value: completed, accent: 'success' },
    { id: 'st3', label: 'Kalan', value: remaining, accent: 'warning' },
  ];

  const { progressCaption, progressFootnote } = useMemo(() => {
    if (tasksToday.length === 0) {
      return {
        progressCaption: 'Bugün için henüz görev yok.',
        progressFootnote: `Görev ekledikçe çubuk yükselir (plan ölçüsü: Ayarlar’dan seçtiğin günlük ${dailyPlanGoal} görev). Tik ve silme yüzdeyi adım adım değiştirir.`,
      };
    }
    if (remaining === 0) {
      return {
        progressCaption:
          tasksToday.length === 1
            ? 'Tek görevini de bitirdin — bugün tamamdır.'
            : `${tasksToday.length} görevin hepsi tamam. Böyle devam.`,
        progressFootnote: '%100 — yarın yeni liste ile sıfırdan başlarsın.',
      };
    }
    return {
      progressCaption: `Bugün ${tasksToday.length} görev planlı · ${completed} tamamlandı · ${remaining} sırada`,
      progressFootnote: `Yüzde: yaklaşık yarısı plan (günlük ${dailyPlanGoal} göreve kadar), yarısı tik oranı. Görev silince plan tarafı düşer.`,
    };
  }, [tasksToday.length, completed, remaining, dailyPlanGoal]);

  const heroDateCaps = formatTodayHeaderCapsLine();

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
      contentContainerStyle={{ paddingBottom: tabBarHeight + 12 }}
    >
      <ScreenHero variant="greeting" dateLine={heroDateCaps} title="Merhaba!" titleSize={34} />

      <View style={styles.body}>
        <TasksCloudLoadingBanner colors={colors} visible={tasksHydrated && !tasksDataReady} />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>Bugünün Özeti</Text>
          <ProgressBar
            variant="featured"
            headerTitle="Bugünün ilerlemesi"
            progress={progress}
            caption={progressCaption}
            footnote={progressFootnote}
          />
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <StatCard key={stat.id} label={stat.label} value={stat.value} accent={stat.accent} />
          ))}
        </View>

        <SectionHeader title="Modüller" />

        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              icon="✅"
              title="Yapılacaklar"
              subtitle={tasksToday.length ? `${remaining} bekleyen` : 'Liste boş'}
              onPress={() => navigateWithInterstitial('Gorevler')}
            />
          </View>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              icon="📅"
              title="Görev planı"
              subtitle="Haftalık şerit · Görevler"
              onPress={() => navigateWithInterstitial('Gorevler')}
            />
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              icon="📊"
              title="İstatistikler"
              subtitle="Tamamlama özeti"
              onPress={() => navigateWithInterstitial('Istatistikler')}
            />
          </View>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              icon="🔔"
              title="Hatırlatıcılar"
              subtitle="Bildirim tercihleri"
              onPress={() => navigateWithInterstitial('Ayarlar')}
            />
          </View>
        </View>

        <SectionHeader
          title="Bugünün görevleri"
          subtitle={tasksDataReady && tasksToday.length === 0 ? 'Bugün için henüz görev yok.' : undefined}
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
            <Text style={styles.emptyTasksTitle}>Gününü planla</Text>
            <Text style={styles.emptyTasks}>
              Hızlıca başlamak için alttaki &quot;+ Görev ekle&quot; ile bugüne ilk görevini ekleyebilirsin.
            </Text>
          </View>
        ) : null}

        {tasksToday.length > DASHBOARD_TASK_PREVIEW ? (
          <View style={styles.inlineLink}>
            <TextLink title={`Tümünü gör (${tasksToday.length})`} onPress={() => navigation.navigate('Gorevler')} />
          </View>
        ) : null}

        <PrimaryButton title="+ Görev ekle" onPress={openAddTaskModal} mutedCta />
        <Text style={styles.fabHint}>Görevler varsayılan olarak bugünün tarihine eklenir.</Text>

        {!isPro && isAdsUiEnabled() ? (
          <View style={styles.inlineLink}>
            <TextLink
              title={rewardBusy ? 'Reklam açılıyor…' : `Bonus puan: kısa reklam izle (+${bonusPoints})`}
              onPress={() => !rewardBusy && onOptionalAdReward()}
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
