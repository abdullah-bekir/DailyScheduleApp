import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../components/common/PrimaryButton';
import ScreenBackBar from '../components/layout/ScreenBackBar';
import ScreenHero from '../components/layout/ScreenHero';
import { useLocale } from '../context/LocaleContext';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { cardShadow } from '../theme/shadows';
import { formatDateKeyForDisplay } from '../utils/dateKey';

function createStyles(colors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    body: { flex: 1, marginTop: -18, paddingHorizontal: 20, gap: 14 },
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
      gap: 8,
      ...cardShadow(colors),
    },
    label: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    value: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    muted: { fontSize: 13, fontWeight: '500', lineHeight: 20, color: colors.textSecondary },
    attachmentRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    attachmentInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 13,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceSubtle,
    },
    attachmentBtn: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    attachmentBtnText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    attachmentChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
      paddingHorizontal: 10,
      paddingVertical: 7,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    attachmentChipText: {
      flex: 1,
      fontSize: 12,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    attachmentRemove: {
      color: colors.danger,
      fontSize: 12,
      fontWeight: '800',
    },
    notesInput: {
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceSubtle,
      minHeight: 96,
      textAlignVertical: 'top',
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    metaPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
    },
    metaPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
  });
}

export default function TaskDetailScreen({ route }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { dateLocale } = useLocale();
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { tasks, updateTaskDetails, toggleTaskDone } = useTasks();
  const taskId = route?.params?.taskId ? String(route.params.taskId) : '';
  const task = useMemo(() => tasks.find((t) => String(t.id) === taskId), [tasks, taskId]);
  const [attachmentDraft, setAttachmentDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    setNotesDraft(typeof task?.notes === 'string' ? task.notes : '');
  }, [taskId, task?.notes]);

  /** Yığın kökü değilken useScrollToTop devreye girmez; sekme tekrarında yine yukarı kaydır */
  useEffect(() => {
    const tabNavigations = [];
    let nav = navigation;
    while (nav) {
      if (nav.getState?.()?.type === 'tab') tabNavigations.push(nav);
      nav = nav.getParent();
    }
    if (tabNavigations.length === 0) return undefined;
    const unsubs = tabNavigations.map((tab) =>
      tab.addListener('tabPress', (e) => {
        requestAnimationFrame(() => {
          if (navigation.isFocused() && !e.defaultPrevented) {
            scrollRef.current?.scrollTo?.({ y: 0, animated: true });
          }
        });
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [navigation]);

  if (!task) {
    return (
      <View style={styles.root}>
        <ScreenBackBar label={t('taskDetail.back')} onPress={() => navigation.goBack()} />
        <ScreenHero
          compactTop
          eyebrow={t('taskDetail.eyebrow')}
          title={t('taskDetail.title')}
          subtitle={t('taskDetail.notFound')}
          titleSize={28}
        />
        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.muted}>{t('taskDetail.notFoundBody')}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenBackBar label={t('taskDetail.back')} onPress={() => navigation.goBack()} />
      <ScreenHero compactTop eyebrow={t('taskDetail.eyebrow')} title={t('taskDetail.title')} subtitle={task.title} titleSize={28} />
      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 12, 24) }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.label}>{t('taskDetail.labelTitle')}</Text>
          <Text style={styles.value}>{task.title}</Text>
          <Text style={styles.label}>{t('taskDetail.labelDate')}</Text>
          <Text style={styles.value}>{formatDateKeyForDisplay(task.dateKey, dateLocale)}</Text>
          <Text style={styles.label}>{t('taskDetail.labelTime')}</Text>
          <Text style={styles.value}>{task.time || '--:--'}</Text>
          <Text style={styles.label}>{t('taskDetail.labelStatus')}</Text>
          <Text style={styles.value}>{task.done ? t('common.completed') : t('tasks.notDone')}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>
                {task.priority === 'high'
                  ? t('priority.highFull')
                  : task.priority === 'low'
                    ? t('priority.lowFull')
                    : t('priority.mediumFull')}
              </Text>
            </View>
          </View>
          <PrimaryButton
            title={task.done ? t('taskDetail.markUndone') : t('taskDetail.markDone')}
            variant="outline"
            onPress={() => toggleTaskDone(taskId)}
            mutedCta
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('taskDetail.notes')}</Text>
          <TextInput
            style={styles.notesInput}
            value={notesDraft}
            onChangeText={setNotesDraft}
            placeholder={t('taskDetail.notesPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onBlur={() => {
              const next = String(notesDraft ?? '');
              const current = String(task.notes ?? '');
              if (next !== current) {
                updateTaskDetails(taskId, { notes: next });
              }
            }}
          />
          <Text style={styles.muted}>{t('taskDetail.notesHint')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('taskDetail.attachments')}</Text>
          <View style={styles.attachmentRow}>
            <TextInput
              style={styles.attachmentInput}
              value={attachmentDraft}
              onChangeText={setAttachmentDraft}
              placeholder={t('taskDetail.attachmentPlaceholder')}
              placeholderTextColor={colors.textTertiary}
            />
            <Pressable
              style={styles.attachmentBtn}
              onPress={() => {
                const next = String(attachmentDraft).trim();
                if (!next) return;
                const current = Array.isArray(task.attachments) ? task.attachments : [];
                updateTaskDetails(taskId, { attachments: [...current, next] });
                setAttachmentDraft('');
              }}
            >
              <Text style={styles.attachmentBtnText}>{t('common.add')}</Text>
            </Pressable>
          </View>

          {(Array.isArray(task.attachments) ? task.attachments : []).length === 0 ? (
            <Text style={styles.muted}>{t('taskDetail.attachmentsEmpty')}</Text>
          ) : (
            (task.attachments || []).map((x, idx) => (
              <View key={`${x}-${idx}`} style={styles.attachmentChip}>
                <Text style={styles.attachmentChipText} numberOfLines={1}>
                  {x}
                </Text>
                <Pressable
                  onPress={() => {
                    const current = Array.isArray(task.attachments) ? task.attachments : [];
                    updateTaskDetails(taskId, {
                      attachments: current.filter((_, i) => i !== idx),
                    });
                  }}
                >
                  <Text style={styles.attachmentRemove}>{t('common.remove')}</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
