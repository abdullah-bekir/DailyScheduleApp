import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../components/common/PrimaryButton';
import ScreenHero from '../components/layout/ScreenHero';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { cardShadow } from '../theme/shadows';
import { addDaysToDateKey, formatDateKeyForDisplay, getTodayDateKey } from '../utils/dateKey';
import { sortTasksByTime } from '../utils/sortTasks';

function createStyles(colors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    body: { flex: 1, marginTop: -18, paddingHorizontal: 20 },
    dateCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      ...cardShadow(colors),
    },
    dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
    daysStrip: {
      marginTop: 10,
      flexDirection: 'row',
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
    planCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
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
    taskRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 10,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaceSubtle,
    },
    taskRowDone: {
      opacity: 0.75,
    },
    taskTextWrap: { flex: 1, marginRight: 10 },
    taskTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
    taskTitleDone: { textDecorationLine: 'line-through', color: colors.textSecondary },
    taskMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    rowBtns: { flexDirection: 'row' },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      marginLeft: 6,
    },
    emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingVertical: 14 },
    footerPad: { height: 12 },
    fabWrap: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      borderRadius: 999,
      ...cardShadow(colors, 'sm'),
    },
    fabBtn: {
      width: 58,
      height: 58,
      borderRadius: 999,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
    },
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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { tasks, openAddTaskModalForDate, toggleTaskDone, deleteTask } = useTasks();
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayDateKey());

  const tasksForDate = useMemo(() => {
    const list = Array.isArray(tasks) ? tasks.filter((t) => t?.dateKey === selectedDateKey) : [];
    return sortTasksByTime(list);
  }, [tasks, selectedDateKey]);

  const subtitle = useMemo(() => formatDateKeyForDisplay(selectedDateKey), [selectedDateKey]);
  const dayStrip = useMemo(() => dayStripFromSelected(selectedDateKey), [selectedDateKey]);
  const doneCount = useMemo(
    () => tasksForDate.filter((t) => Boolean(t?.done)).length,
    [tasksForDate],
  );

  return (
    <View style={styles.root}>
      <ScreenHero eyebrow="GÖREVLER" title="Görevler" subtitle={subtitle} titleSize={30} />

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 12, 24) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateCard}>
          <View style={styles.dateRow}>
            <Pressable
              style={styles.navBtn}
              onPress={() => setSelectedDateKey((prev) => addDaysToDateKey(prev, -1))}
              accessibilityRole="button"
              accessibilityLabel="Önceki gün"
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </Pressable>

            <View style={styles.dateTextWrap}>
              <Text style={styles.dateText}>{formatDateKeyForDisplay(selectedDateKey)}</Text>
            </View>

            <Pressable
              style={styles.navBtn}
              onPress={() => setSelectedDateKey((prev) => addDaysToDateKey(prev, 1))}
              accessibilityRole="button"
              accessibilityLabel="Sonraki gün"
            >
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </Pressable>
          </View>
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
                  accessibilityLabel={d.toLocaleDateString('tr-TR')}
                >
                  <Text style={styles.dayDow}>{d.toLocaleDateString('tr-TR', { weekday: 'short' })}</Text>
                  <Text style={styles.dayDom}>{d.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Görev planı ekle</Text>
          <Text style={styles.planText}>
            Seçtiğin gün için yeni görev ekle. Alttaki butonla planını hemen oluşturabilirsin.
          </Text>
          <PrimaryButton title="+ Görev planı ekle" onPress={() => openAddTaskModalForDate(selectedDateKey)} />
        </View>

        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Görev listesi</Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Toplam görev</Text>
              <Text style={styles.statValue}>🎯 {tasksForDate.length}</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Tamamlanan</Text>
              <Text style={styles.statValue}>🏆 {doneCount}</Text>
            </View>
          </View>

          {tasksForDate.length === 0 ? (
            <Text style={styles.emptyText}>Bu tarih için henüz görev yok.</Text>
          ) : (
            tasksForDate.map((item) => {
              const itemId = item?.id != null ? String(item.id) : '';
              if (!itemId) return null;
              return (
                <Pressable
                  key={itemId}
                  style={[styles.taskRow, item?.done && styles.taskRowDone]}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: itemId })}
                  accessibilityRole="button"
                  accessibilityLabel="Görev detayını aç"
                >
                  <Pressable
                    style={styles.iconBtn}
                    onPress={() => toggleTaskDone(itemId)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: Boolean(item?.done) }}
                    accessibilityLabel="Tamamlandı durumunu değiştir"
                  >
                    <Ionicons
                      name={item?.done ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={item?.done ? colors.success : colors.textSecondary}
                    />
                  </Pressable>
                  <View style={styles.taskTextWrap}>
                    <Text style={[styles.taskTitle, item?.done && styles.taskTitleDone]} numberOfLines={1}>
                      {item?.title || 'Adsız görev'}
                    </Text>
                    <Text style={styles.taskMeta}>
                      {item?.time || '--:--'} · {item?.done ? 'Tamamlandı' : 'Tamamlanmadı'}
                    </Text>
                  </View>
                  <View style={styles.rowBtns}>
                    <Pressable
                      style={styles.iconBtn}
                      onPress={() => navigation.navigate('TaskDetail', { taskId: itemId })}
                      accessibilityRole="button"
                      accessibilityLabel="Görev detayını aç"
                    >
                      <Ionicons name="chevron-forward" size={17} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      style={styles.iconBtn}
                      onPress={() => deleteTask(itemId)}
                      accessibilityRole="button"
                      accessibilityLabel="Sil"
                    >
                      <Ionicons name="trash-outline" size={17} color={colors.danger} />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        <View style={styles.footerPad} />
      </ScrollView>
      <View style={[styles.fabWrap, { bottom: Math.max(insets.bottom + 14, 24) }]}>
        <Pressable
          style={styles.fabBtn}
          onPress={() => openAddTaskModalForDate(selectedDateKey)}
          accessibilityRole="button"
          accessibilityLabel="Hızlı görev ekleme"
        >
          <Ionicons name="add" size={28} color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}
