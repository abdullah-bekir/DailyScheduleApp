import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { cardShadow } from '../theme/shadows';
import { formatTodayCompactLabel, getTodayDateKey } from '../utils/dateKey';

const DASHBOARD_TASK_PREVIEW = 5;

function getProgressPercent(taskList) {
  if (!taskList.length) return 0;
  const doneCount = taskList.filter((t) => t.done).length;
  return Math.round((doneCount / taskList.length) * 100);
}

function createStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    body: {
      paddingHorizontal: 20,
      gap: 22,
      marginTop: -18,
      paddingBottom: 36,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
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
      gap: 12,
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { tasks, openAddTaskModal, refreshTasksFromSupabase, tasksHydrated, tasksDataReady } = useTasks();

  useFocusEffect(
    useCallback(() => {
      if (!tasksDataReady) return undefined;
      refreshTasksFromSupabase();
      return undefined;
    }, [tasksDataReady, refreshTasksFromSupabase]),
  );

  const todayKey = getTodayDateKey();
  const tasksToday = useMemo(() => tasks.filter((t) => t.dateKey === todayKey), [tasks, todayKey]);

  const progress = getProgressPercent(tasksToday);
  const completed = tasksToday.filter((t) => t.done).length;
  const remaining = tasksToday.length - completed;
  const previewTasks = tasksToday.slice(0, DASHBOARD_TASK_PREVIEW);

  const stats = [
    { id: 'st1', label: 'Toplam görev', value: tasksToday.length, accent: 'primary' },
    { id: 'st2', label: 'Tamamlanan', value: completed, accent: 'success' },
    { id: 'st3', label: 'Kalan', value: remaining, accent: 'warning' },
  ];

  const progressCaption =
    tasksToday.length === 0
      ? 'Bugün için görev ekleyerek ilerlemeni buradan takip edebilirsin.'
      : `${progress}% tamamlandı · ${completed}/${tasksToday.length} görev (${remaining} bekliyor)`;

  const heroDateLabel = formatTodayCompactLabel();

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <ScreenHero title="Bugün" subtitle={heroDateLabel} titleSize={34} />

      <View style={styles.body}>
        <TasksCloudLoadingBanner colors={colors} visible={tasksHydrated && !tasksDataReady} />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeading}>Bugünün Özeti</Text>
          <ProgressBar variant="featured" progress={progress} caption={progressCaption} />
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <StatCard key={stat.id} label={stat.label} value={stat.value} accent={stat.accent} />
          ))}
        </View>

        <SectionHeader title="Modüller" subtitle="Kısayollar — dört kutucuk aynı boyutta." />

        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              icon="✅"
              title="Yapılacaklar"
              subtitle={tasksToday.length ? `${remaining} bekleyen` : 'Liste boş'}
              onPress={() => navigation.navigate('Gorevler')}
            />
          </View>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              icon="📅"
              title="Görev planı"
              subtitle="Haftalık şerit · Görevler"
              onPress={() => navigation.navigate('Gorevler')}
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
              onPress={() => navigation.navigate('Istatistikler')}
            />
          </View>
          <View style={styles.gridCell}>
            <DashboardPreviewCard
              variant="rich"
              compact
              icon="🔔"
              title="Hatırlatıcılar"
              subtitle="Bildirim tercihleri"
              onPress={() => navigation.navigate('Ayarlar')}
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

        <PrimaryButton title="+ Görev ekle" onPress={openAddTaskModal} />
        <Text style={styles.fabHint}>Görevler varsayılan olarak bugünün tarihine eklenir.</Text>
      </View>
    </ScrollView>
  );
}
