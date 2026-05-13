import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import AdMobBannerCard from '../components/ads/AdMobBannerCard';
import PrimaryButton from '../components/common/PrimaryButton';
import TasksCloudLoadingBanner from '../components/sync/TasksCloudLoadingBanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHero from '../components/layout/ScreenHero';
import TaskFilterChips from '../components/tasks/TaskFilterChips';
import { useSubscription } from '../context/SubscriptionContext';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { getAdsRewardBonusPoints, isAdsUiEnabled } from '../lib/ads/adsConfig';
import { showRewardedAd } from '../lib/ads/rewardedAd';
import { cardShadow } from '../theme/shadows';
import { COMPLETION_WEIGHT, TIER_SIZE } from '../utils/completionTally';
import { formatDateKeyForDisplay } from '../utils/dateKey';
import {
  buildDailySeries,
  buildMonthlySeries,
  buildTaskStats,
  buildWeeklySeries,
  buildYearlySeries,
} from '../utils/statsFromTasks';

const CHART_PLOT_H = 168;

function getYTicks(maxBar) {
  const top = Math.max(1, maxBar);
  const steps = 4;
  const set = new Set();
  for (let i = 0; i <= steps; i += 1) {
    set.add(Math.round((top * i) / steps));
  }
  return Array.from(set).sort((a, b) => a - b);
}

function createStyles(colors, chartUi) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    body: {
      paddingHorizontal: 20,
      gap: 16,
      marginTop: -16,
      paddingTop: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      ...cardShadow(colors),
      gap: 14,
    },
    cardTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    statRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    statPill: {
      flexGrow: 1,
      minWidth: '28%',
      backgroundColor: colors.surfaceSubtle,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingHorizontal: 14,
      gap: 6,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.6,
      fontVariant: ['tabular-nums'],
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      letterSpacing: -0.1,
    },
    hint: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 20,
    },
    tierBlock: {
      marginTop: 4,
      gap: 8,
    },
    tierRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    tierLevel: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.2,
    },
    tierSub: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      flex: 1,
      textAlign: 'right',
    },
    tierTrack: {
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    tierFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    chartCardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    chartGranularity: {
      marginTop: 4,
      gap: 8,
    },
    chartGranularityLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textSecondary,
      letterSpacing: 0.35,
    },
    chartBadge: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chartBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.8,
    },
    chartHeadline: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.35,
      lineHeight: 22,
    },
    chartSub: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 18,
    },
    chartWell: {
      marginTop: 4,
      borderRadius: 18,
      backgroundColor: chartUi.plotBg,
      borderWidth: 1,
      borderColor: chartUi.plotBorder,
      paddingVertical: 14,
      paddingHorizontal: 12,
      overflow: 'hidden',
    },
    chartMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    chartYCaption: {
      fontSize: 11,
      fontWeight: '700',
      color: chartUi.captionColor,
      letterSpacing: 0.2,
    },
    chartMiniHint: {
      fontSize: 10,
      fontWeight: '600',
      color: chartUi.captionColor,
    },
    chartPlotRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    chartYBand: {
      width: 36,
      height: CHART_PLOT_H,
      position: 'relative',
      marginRight: 6,
    },
    chartYTick: {
      position: 'absolute',
      right: 2,
      fontSize: 10,
      fontWeight: '700',
      color: chartUi.tickColor,
      fontVariant: ['tabular-nums'],
    },
    chartPlotFrame: {
      flex: 1,
      minWidth: 0,
      height: CHART_PLOT_H,
      borderLeftWidth: StyleSheet.hairlineWidth * 2,
      borderBottomWidth: StyleSheet.hairlineWidth * 2,
      borderLeftColor: chartUi.axisColor,
      borderBottomColor: chartUi.axisColor,
      borderBottomLeftRadius: 10,
      position: 'relative',
      overflow: 'hidden',
    },
    chartGridLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: StyleSheet.hairlineWidth,
      backgroundColor: chartUi.gridColor,
    },
    chartBarsLayer: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      paddingBottom: 0,
    },
    chartBarCol: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'flex-end',
      height: CHART_PLOT_H,
      paddingHorizontal: 3,
    },
    chartBarHighlight: {
      borderRadius: 16,
      paddingHorizontal: 4,
      paddingBottom: 2,
      alignItems: 'center',
      justifyContent: 'flex-end',
      alignSelf: 'stretch',
    },
    chartBarHighlightToday: {
      backgroundColor: colors.primaryLight,
    },
    chartBarLabels: {
      alignItems: 'center',
      gap: 2,
      marginBottom: 2,
      minHeight: 30,
      justifyContent: 'flex-end',
    },
    chartBarFrac: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textPrimary,
      fontVariant: ['tabular-nums'],
      textAlign: 'center',
    },
    chartBarPct: {
      fontSize: 9,
      fontWeight: '700',
      color: chartUi.barTextColor,
      fontVariant: ['tabular-nums'],
      textAlign: 'center',
    },
    chartBarLabelsMuted: {
      opacity: 0.85,
    },
    chartBarFracMuted: {
      color: colors.textTertiary,
    },
    chartBarFill: {
      width: '88%',
      maxWidth: 38,
      backgroundColor: chartUi.barColor,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      minHeight: 0,
    },
    chartBarFillMuted: {
      opacity: 0.38,
    },
    chartBarFillToday: {
      opacity: 1,
      shadowColor: chartUi.barColor,
      shadowOpacity: 0.35,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    chartXRow: {
      flexDirection: 'row',
      marginTop: 12,
      paddingLeft: 42,
      gap: 4,
    },
    chartXCell: {
      flex: 1,
      alignItems: 'center',
      minWidth: 0,
    },
    chartXDay: {
      fontSize: 10,
      fontWeight: '700',
      color: chartUi.tickColor,
      textAlign: 'center',
    },
    chartXDayCompact: {
      fontSize: 8,
      fontWeight: '700',
      lineHeight: 11,
    },
    chartXDom: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
    },
    chartXDomCompact: {
      fontSize: 8,
      marginTop: 1,
      lineHeight: 11,
    },
    chartXToday: {
      color: chartUi.barColor,
      fontWeight: '800',
    },
    chartXCaption: {
      marginTop: 12,
      fontSize: 11,
      fontWeight: '600',
      color: chartUi.captionColor,
      textAlign: 'center',
    },
    priorityWrap: {
      gap: 10,
    },
    priorityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      paddingLeft: 14,
      borderRadius: 18,
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
    },
    priorityMid: {
      flex: 1,
    },
    priorityLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.2,
    },
    priorityCount: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.primary,
      fontVariant: ['tabular-nums'],
    },
    emptyBox: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderStrong,
      borderRadius: 22,
      padding: 22,
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surfaceSubtle,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 21,
    },
  });
}

const CHART_HEADLINE = {
  day: 'Günlük tamamlanan dağılımı',
  week: 'Haftalık tamamlanan dağılımı',
  month: 'Aylık tamamlanan dağılımı',
  year: 'Yıllık tamamlanan dağılımı',
};

const CHART_SUB = {
  day: 'Son 7 günde her gün: tamamlanan / günün görevi ve tamamlama yüzdesi',
  week: 'Son 8 haftada (Pzt–Paz): haftalık toplamlar ve haftalık tamamlama yüzdesi',
  month: 'Son 6 ayda: aylık toplamlar ve o ayın tamamlama yüzdesi',
  year: 'Son 5 yılda: yıllık toplamlar ve o yılın tamamlama yüzdesi',
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const { isPro } = useSubscription();
  const { colors, isDark } = useTheme();
  const chartUi = useMemo(
    () =>
      isDark
        ? {
            // Koyu modda bile grafik alanını beyaz tut: değerler daha hızlı okunur.
            plotBg: '#FFFFFF',
            plotBorder: '#D4D4D8',
            axisColor: 'rgba(15, 23, 42, 0.24)',
            gridColor: 'rgba(15, 23, 42, 0.08)',
            tickColor: '#475569',
            captionColor: '#334155',
            barColor: '#3F3F46',
            barTextColor: '#334155',
          }
        : {
            plotBg: '#F1F5FB',
            plotBorder: colors.border,
            axisColor: 'rgba(15, 23, 42, 0.22)',
            gridColor: 'rgba(15, 23, 42, 0.06)',
            tickColor: colors.textTertiary,
            captionColor: colors.textSecondary,
            barColor: colors.primary,
            barTextColor: colors.primary,
          },
    [colors.border, colors.primary, colors.textSecondary, colors.textTertiary, isDark],
  );
  const styles = useMemo(() => createStyles(colors, chartUi), [colors, chartUi]);
  const { tasks, completionTally, tasksHydrated, tasksDataReady, refreshTasksFromSupabase, grantAdRewardBonus } =
    useTasks();
  const [rewardBusy, setRewardBusy] = useState(false);
  const bonusPoints = useMemo(() => getAdsRewardBonusPoints(), []);

  const onAdRewardPress = useCallback(async () => {
    if (!isAdsUiEnabled() || isPro) return;
    setRewardBusy(true);
    try {
      const r = await showRewardedAd();
      if (r.reason === 'disabled') {
        Alert.alert('Reklamlar kapalı', 'Açmak için EXPO_PUBLIC_ADS_UI_ENABLED=true ile derleyin.');
        return;
      }
      if (r.reason === 'expo-go') {
        Alert.alert('Expo Go', 'Ödüllü reklam için development veya release build gerekir.');
        return;
      }
      if (r.earned) {
        grantAdRewardBonus(bonusPoints);
        Alert.alert('Teşekkürler', `+${bonusPoints} tamamlama puanı hesabına eklendi.`);
      } else if (r.shown) {
        Alert.alert('Bilgi', 'Reklam kapandı; ödül için tamamlanmış izlenme gerekir.');
      } else {
        Alert.alert('Reklam', 'Şu an yüklenemedi. Biraz sonra tekrar deneyin.');
      }
    } finally {
      setRewardBusy(false);
    }
  }, [isPro, bonusPoints, grantAdRewardBonus]);
  const statsTasks = useMemo(() => (tasksDataReady ? tasks : []), [tasksDataReady, tasks]);

  useFocusEffect(
    useCallback(() => {
      if (!tasksDataReady) return undefined;
      refreshTasksFromSupabase();
      return undefined;
    }, [tasksDataReady, refreshTasksFromSupabase]),
  );

  const [granularity, setGranularity] = useState('day');
  const [displayTally, setDisplayTally] = useState(0);
  const displayRef = useRef(0);
  const tallyHydrateSnapDone = useRef(false);

  useEffect(() => {
    if (!tasksHydrated) return;

    if (!tallyHydrateSnapDone.current) {
      tallyHydrateSnapDone.current = true;
      displayRef.current = completionTally;
      setDisplayTally(completionTally);
      return;
    }

    const to = completionTally;
    if (displayRef.current === to) return;

    const timer = setInterval(() => {
      const cur = displayRef.current;
      if (cur === to) {
        clearInterval(timer);
        return;
      }
      const dir = to > cur ? 1 : -1;
      const next = cur + dir;
      displayRef.current = next;
      setDisplayTally(next);
      if (next === to) clearInterval(timer);
    }, 44);

    return () => clearInterval(timer);
  }, [completionTally, tasksHydrated]);

  const tierMeta = useMemo(() => {
    const level = Math.floor(displayTally / TIER_SIZE) + 1;
    const within = displayTally % TIER_SIZE;
    const pct = (within / TIER_SIZE) * 100;
    const toNext = TIER_SIZE - within;
    return { level, within, pct, toNext };
  }, [displayTally]);

  const s = useMemo(() => buildTaskStats(statsTasks), [statsTasks]);
  const chartSeries = useMemo(() => {
    if (granularity === 'week') return buildWeeklySeries(statsTasks, 8);
    if (granularity === 'month') return buildMonthlySeries(statsTasks, 6);
    if (granularity === 'year') return buildYearlySeries(statsTasks, 5);
    return buildDailySeries(statsTasks, 7);
  }, [statsTasks, granularity]);

  const yTicks = useMemo(() => getYTicks(chartSeries.maxBar), [chartSeries.maxBar]);
  const xCompact = chartSeries.granularity !== 'day';

  const scrollBottomPad = useMemo(() => {
    const base = Math.max(insets.bottom + tabBarHeight + 40, tabBarHeight + 56);
    if (isPro) return base;
    return Math.max(insets.bottom + tabBarHeight + 40 + 88, tabBarHeight + 144);
  }, [insets.bottom, isPro, tabBarHeight]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.root}
      contentContainerStyle={{ paddingBottom: scrollBottomPad }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHero
        eyebrow="Özet"
        title="İstatistikler"
        subtitle="Günlük, haftalık, aylık veya yıllık grafik; paneller aşağıda."
        titleSize={30}
      />

      <View style={styles.body}>
        <TasksCloudLoadingBanner colors={colors} visible={tasksHydrated && !tasksDataReady} />

        {tasksDataReady && s.total === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Henüz veri yok</Text>
            <Text style={styles.emptyText}>
              Görev ekledikçe kartlar ve grafik otomatik güncellenir.
            </Text>
          </View>
        ) : null}
        {s.total > 0 ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Genel</Text>
              <View style={styles.statRow}>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>{s.total}</Text>
                  <Text style={styles.statLabel}>Toplam görev</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>{s.done}</Text>
                  <Text style={styles.statLabel}>Tamamlanan</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>{s.pending}</Text>
                  <Text style={styles.statLabel}>Bekleyen</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>{displayTally}</Text>
                  <Text style={styles.statLabel}>Tamamlama puanı</Text>
                </View>
              </View>

              <View style={styles.tierBlock}>
                <View style={styles.tierRow}>
                  <Text style={styles.tierLevel}>Kademe {tierMeta.level}</Text>
                  <Text style={styles.tierSub} numberOfLines={2}>
                    Bu basamakta {tierMeta.within}/{TIER_SIZE} · Sonraki kademeye{' '}
                    <Text style={{ fontWeight: '800', color: colors.textPrimary }}>
                      {tierMeta.toNext}
                    </Text>{' '}
                    puan
                  </Text>
                </View>
                <View style={styles.tierTrack}>
                  <View style={[styles.tierFill, { width: `${tierMeta.pct}%` }]} />
                </View>
              </View>

              <Text style={styles.hint}>
                Tamamlama oranı{' '}
                <Text style={{ fontWeight: '800', color: colors.primary }}>%{s.rate}</Text>
                {' · '}
                Görevi her tamamladığında puan eklenir (yüksek +{COMPLETION_WEIGHT.high}, orta +
                {COMPLETION_WEIGHT.medium}, düşük +{COMPLETION_WEIGHT.low}). Puan göstergesi artışları
                basamak basamak sayılır; çubuk her {TIER_SIZE} puanda bir üst kademeye döner.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Bugün ve hafta</Text>
              <View style={styles.statRow}>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>
                    {s.todayDone}/{s.todayTotal || 0}
                  </Text>
                  <Text style={styles.statLabel}>Bugün</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statValue}>
                    {s.weekDone}/{s.weekTotal || 0}
                  </Text>
                  <Text style={styles.statLabel}>Hafta (Pzt–Paz)</Text>
                </View>
              </View>
              <Text style={styles.hint}>{formatDateKeyForDisplay(s.todayKey)}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.chartCardHeader}>
                <View style={styles.chartBadge}>
                  <Text style={styles.chartBadgeText}>{chartSeries.badgeLabel}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.chartHeadline}>{CHART_HEADLINE[chartSeries.granularity]}</Text>
                  <Text style={styles.chartSub}>{CHART_SUB[chartSeries.granularity]}</Text>
                </View>
              </View>

              <View style={styles.chartGranularity}>
                <Text style={styles.chartGranularityLabel}>Aralık</Text>
                <TaskFilterChips
                  compact
                  value={granularity}
                  onChange={setGranularity}
                  options={[
                    { id: 'day', label: 'Günlük' },
                    { id: 'week', label: 'Haftalık' },
                    { id: 'month', label: 'Aylık' },
                    { id: 'year', label: 'Yıllık' },
                  ]}
                />
              </View>

              <View style={styles.chartWell}>
                <View style={styles.chartMetaRow}>
                  <Text style={styles.chartYCaption}>Tamamlanan (adet)</Text>
                  <Text style={styles.chartMiniHint}>{chartSeries.hintScale}</Text>
                </View>

                <View style={styles.chartPlotRow}>
                  <View style={styles.chartYBand}>
                    {yTicks.map((t) => (
                      <Text
                        key={`yt-${t}`}
                        style={[
                          styles.chartYTick,
                          {
                            bottom: Math.max(0, (t / chartSeries.maxBar) * CHART_PLOT_H - 7),
                          },
                        ]}
                      >
                        {t}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.chartPlotFrame}>
                    {yTicks
                      .filter((tk) => tk > 0)
                      .map((tk) => (
                        <View
                          key={`grid-${tk}`}
                          style={[
                            styles.chartGridLine,
                            { bottom: (tk / chartSeries.maxBar) * CHART_PLOT_H },
                          ]}
                        />
                      ))}
                    <View style={styles.chartBarsLayer}>
                      {chartSeries.points.map((pt) => {
                        const rawH = (pt.doneCount / chartSeries.maxBar) * CHART_PLOT_H;
                        const fillH = pt.doneCount > 0 ? Math.max(rawH, 10) : 0;
                        const isHighlight = pt.periodKey === chartSeries.highlightKey;
                        const total = pt.totalCount;
                        const done = pt.doneCount;
                        const pct =
                          total > 0 ? Math.min(100, Math.round((done / total) * 100)) : null;
                        const noTasks = total === 0;
                        return (
                          <View key={pt.periodKey} style={styles.chartBarCol}>
                            <View
                              style={[
                                styles.chartBarHighlight,
                                isHighlight && styles.chartBarHighlightToday,
                              ]}
                            >
                              <View
                                style={[
                                  styles.chartBarLabels,
                                  noTasks && styles.chartBarLabelsMuted,
                                ]}
                              >
                                {noTasks ? (
                                  <Text style={[styles.chartBarFrac, styles.chartBarFracMuted]}>—</Text>
                                ) : (
                                  <>
                                    <Text style={styles.chartBarFrac} numberOfLines={1}>
                                      {done}/{total}
                                    </Text>
                                    <Text style={styles.chartBarPct} numberOfLines={1}>
                                      %{pct}
                                    </Text>
                                  </>
                                )}
                              </View>
                              <View
                                style={[
                                  styles.chartBarFill,
                                  { height: fillH, marginTop: 4 },
                                  pt.doneCount === 0 && styles.chartBarFillMuted,
                                  isHighlight && styles.chartBarFillToday,
                                ]}
                              />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View style={styles.chartXRow}>
                  {chartSeries.points.map((pt) => {
                    const isHighlight = pt.periodKey === chartSeries.highlightKey;
                    return (
                      <View key={`x-${pt.periodKey}`} style={styles.chartXCell}>
                        <Text
                          style={[
                            styles.chartXDay,
                            xCompact && styles.chartXDayCompact,
                            isHighlight && styles.chartXToday,
                          ]}
                          numberOfLines={2}
                        >
                          {pt.labelPrimary}
                        </Text>
                        <Text
                          style={[
                            styles.chartXDom,
                            xCompact && styles.chartXDomCompact,
                            isHighlight && styles.chartXToday,
                          ]}
                          numberOfLines={2}
                        >
                          {pt.labelSecondary}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                <Text style={styles.chartXCaption}>{chartSeries.captionFoot}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Öncelik</Text>
              <View style={styles.priorityWrap}>
                <View style={[styles.priorityRow, { borderLeftColor: colors.danger }]}>
                  <View style={styles.priorityMid}>
                    <Text style={styles.priorityLabel}>Yüksek</Text>
                  </View>
                  <Text style={styles.priorityCount}>{s.priorityCounts.high}</Text>
                </View>
                <View style={[styles.priorityRow, { borderLeftColor: colors.warning }]}>
                  <View style={styles.priorityMid}>
                    <Text style={styles.priorityLabel}>Orta</Text>
                  </View>
                  <Text style={styles.priorityCount}>{s.priorityCounts.medium}</Text>
                </View>
                <View style={[styles.priorityRow, { borderLeftColor: colors.success }]}>
                  <View style={styles.priorityMid}>
                    <Text style={styles.priorityLabel}>Düşük</Text>
                  </View>
                  <Text style={styles.priorityCount}>{s.priorityCounts.low}</Text>
                </View>
              </View>
            </View>
          </>
        ) : null}

        {tasksDataReady && !isPro && isAdsUiEnabled() ? (
          <View style={[styles.card, { marginTop: 14 }]}>
            <Text style={styles.cardTitle}>Destek & bonus</Text>
            <Text style={styles.hint}>
              İsteğe bağlı ödüllü reklam: izlersen +{bonusPoints} tamamlama puanı kazanırsın. Tam ekran geçiş
              reklamları ise en az birkaç dakika arayla ve yalnızca bazı geçişlerde gösterilir; sık sık çıkmaz.
            </Text>
            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                title={rewardBusy ? 'Açılıyor…' : `Reklam izle (+${bonusPoints} puan)`}
                onPress={onAdRewardPress}
                disabled={rewardBusy}
                variant="outline"
                mutedCta
              />
            </View>
          </View>
        ) : null}

        {tasksDataReady && !isPro && isAdsUiEnabled() ? (
          <View style={{ marginTop: 16 }}>
            <AdMobBannerCard />
          </View>
        ) : null}

      </View>
    </ScrollView>
  );
}
