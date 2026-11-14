import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';
import { useTasks } from '../../context/TasksContext';
import { cardShadow } from '../../theme/shadows';

function priorityColor(colors, priority) {
  const map = {
    high: colors.danger,
    medium: colors.warning,
    low: colors.success,
  };
  return map[priority] || colors.textTertiary;
}

function createStyles(colors, isRtl) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      direction: isRtl ? 'rtl' : 'ltr',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 12,
      ...cardShadow(colors, 'sm'),
    },
    rowDone: {
      backgroundColor: colors.surfaceSubtle,
    },
    check: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkDone: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    info: {
      flex: 1,
      gap: 6,
      minWidth: 0,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.2,
      lineHeight: 20,
      textAlign: isRtl ? 'right' : 'left',
    },
    titleDone: {
      textDecorationLine: 'line-through',
      color: colors.textTertiary,
    },
    metaRow: {
      flexDirection: 'row',
      direction: isRtl ? 'rtl' : 'ltr',
      alignItems: 'center',
      gap: 12,
    },
    metaItem: {
      flexDirection: 'row',
      direction: isRtl ? 'rtl' : 'ltr',
      alignItems: 'center',
      gap: 5,
    },
    metaText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    deleteBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSubtle,
    },
    pressed: {
      opacity: 0.7,
    },
  });
}

const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

export default function TaskItem({ task }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, isRtl), [colors, isRtl]);
  const { toggleTaskDone, deleteTask, tasksMutationReady } = useTasks();

  const taskId = task?.id != null ? String(task.id).trim() : '';
  const titlePreview = task?.title?.trim() ? task.title.trim() : t('common.thisTask');

  const confirmDelete = useCallback(() => {
    if (!taskId) return;
    Alert.alert(t('tasks.deleteTitle'), t('tasks.deleteBody', { title: titlePreview }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => deleteTask(taskId),
      },
    ]);
  }, [deleteTask, taskId, titlePreview, t]);

  const onToggle = useCallback(() => {
    if (!taskId) return;
    toggleTaskDone(taskId);
  }, [toggleTaskDone, taskId]);

  const openDetail = useCallback(() => {
    if (!taskId) return;
    navigation.navigate('TaskDetail', { taskId });
  }, [navigation, taskId]);

  if (!task || !taskId) {
    return null;
  }

  const done = Boolean(task.done);
  const dotColor = priorityColor(colors, task.priority);
  const priorityLabel = ['high', 'medium', 'low'].includes(task.priority)
    ? t(`priority.${task.priority}`)
    : null;

  return (
    <View style={[styles.row, done && styles.rowDone]}>
      <Pressable
        style={[styles.check, done && styles.checkDone]}
        hitSlop={hitSlop}
        onPress={onToggle}
        disabled={!tasksMutationReady}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={done ? t('tasks.undo') : t('tasks.complete')}
      >
        {done ? <Ionicons name="checkmark" size={16} color={colors.onPrimary} /> : null}
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.info, pressed && styles.pressed]}
        onPress={openDetail}
        accessibilityRole="button"
        accessibilityLabel={t('tasks.openDetail')}
      >
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          {task.time ? (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
              <Text style={styles.metaText}>{task.time}</Text>
            </View>
          ) : null}
          {priorityLabel ? (
            <View style={styles.metaItem}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <Text style={styles.metaText}>{priorityLabel}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
        hitSlop={hitSlop}
        onPress={confirmDelete}
        disabled={!tasksMutationReady}
        accessibilityRole="button"
        accessibilityLabel={t('common.delete')}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}
