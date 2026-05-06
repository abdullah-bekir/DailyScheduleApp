import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TasksContext';
import { cardShadow } from '../../theme/shadows';

function priorityColor(colors, priority) {
  const map = {
    high: colors.danger,
    medium: colors.warning,
    low: colors.success,
  };
  return map[priority] || colors.textSecondary;
}

function createStyles(colors) {
  return StyleSheet.create({
    wrap: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      ...cardShadow(colors, 'sm'),
    },
    priorityStripe: {
      width: 4,
      alignSelf: 'stretch',
      borderRadius: 999,
      minHeight: 36,
    },
    actionColumn: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'stretch',
      gap: 4,
      opacity: 0.92,
    },
    actionLabel: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.2,
      textAlign: 'center',
      lineHeight: 10,
      maxWidth: 28,
    },
    info: {
      flex: 1,
      gap: 5,
      minWidth: 0,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.2,
      lineHeight: 21,
    },
    titleDone: {
      textDecorationLine: 'line-through',
      opacity: 0.62,
      color: colors.textSecondary,
    },
    time: {
      color: colors.textTertiary,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.2,
      textTransform: 'uppercase',
    },
    statusBadge: {
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderWidth: 1,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    doneBadge: {
      backgroundColor: colors.badgeDoneBg,
      borderColor: colors.border,
    },
    pendingBadge: {
      backgroundColor: colors.badgePendingBg,
      borderColor: colors.border,
    },
    doneText: {
      color: colors.badgeDoneText,
    },
    pendingText: {
      color: colors.badgePendingText,
    },
  });
}

const hintHitSlop = { top: 12, bottom: 12, left: 10, right: 10 };

export default function TaskItem({ task }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { toggleTaskDone, deleteTask } = useTasks();

  const taskId = task?.id != null ? String(task.id).trim() : '';
  const titlePreview = task?.title?.trim() ? task.title.trim() : 'Bu görev';

  const confirmDelete = useCallback(() => {
    if (!taskId) return;
    Alert.alert(
      'Görevi sil',
      `“${titlePreview}” kalıcı olarak silinsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteTask(taskId),
        },
      ],
    );
  }, [deleteTask, taskId, titlePreview]);

  const onToggle = useCallback(() => {
    if (!taskId) return;
    toggleTaskDone(taskId);
  }, [toggleTaskDone, taskId]);

  if (!task || !taskId) {
    return null;
  }

  const stripeColor = priorityColor(colors, task.priority);
  const leftLabel = task.done ? 'Geri' : 'Tamamla';

  return (
    <View style={styles.wrap} accessible={false}>
      <View style={styles.row} accessible={false}>
        <View style={[styles.priorityStripe, { backgroundColor: stripeColor }]} />
        <Pressable
          style={styles.actionColumn}
          hitSlop={hintHitSlop}
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={task.done ? 'Geri al' : 'Tamamla'}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color={colors.success} />
          <Text style={[styles.actionLabel, { color: colors.success }]} numberOfLines={2}>
            {leftLabel}
          </Text>
        </Pressable>
        <View style={styles.info}>
          <Text style={[styles.title, task.done && styles.titleDone]} numberOfLines={2}>
            {task.title}
          </Text>
          <Text style={styles.time}>{task.time}</Text>
        </View>
        <View style={[styles.statusBadge, task.done ? styles.doneBadge : styles.pendingBadge]}>
          <Text style={[styles.statusText, task.done ? styles.doneText : styles.pendingText]}>
            {task.done ? 'Tamamlandı' : 'Bekliyor'}
          </Text>
        </View>
        <Pressable
          style={styles.actionColumn}
          hitSlop={hintHitSlop}
          onPress={confirmDelete}
          accessibilityRole="button"
          accessibilityLabel="Sil"
        >
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
          <Text style={[styles.actionLabel, { color: colors.danger }]} numberOfLines={2}>
            Sil
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
