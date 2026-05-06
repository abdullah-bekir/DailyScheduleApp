import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHero from '../components/layout/ScreenHero';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { cardShadow } from '../theme/shadows';
import { formatDateKeyForDisplay } from '../utils/dateKey';

function createStyles(colors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    body: { flex: 1, marginTop: -18, paddingHorizontal: 20, gap: 12 },
    card: {
      borderRadius: 16,
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
  });
}

export default function TaskDetailScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { tasks, updateTaskDetails } = useTasks();
  const taskId = route?.params?.taskId ? String(route.params.taskId) : '';
  const task = useMemo(() => tasks.find((t) => String(t.id) === taskId), [tasks, taskId]);
  const [attachmentDraft, setAttachmentDraft] = useState('');

  if (!task) {
    return (
      <View style={styles.root}>
        <ScreenHero eyebrow="GÖREV" title="Görev detayı" subtitle="Kayıt bulunamadı" titleSize={28} />
        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.muted}>Görev bulunamadı veya silinmiş olabilir.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHero eyebrow="GÖREV" title="Görev detayı" subtitle={task.title} titleSize={28} />
      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 12, 24) }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.label}>Başlık</Text>
          <Text style={styles.value}>{task.title}</Text>
          <Text style={styles.label}>Tarih</Text>
          <Text style={styles.value}>{formatDateKeyForDisplay(task.dateKey)}</Text>
          <Text style={styles.label}>Durum</Text>
          <Text style={styles.value}>{task.done ? 'Tamamlandı' : 'Tamamlanmadı'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Ek Dosyalar</Text>
          <View style={styles.attachmentRow}>
            <TextInput
              style={styles.attachmentInput}
              value={attachmentDraft}
              onChangeText={setAttachmentDraft}
              placeholder="Dosya adı veya link ekle"
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
              <Text style={styles.attachmentBtnText}>Ekle</Text>
            </Pressable>
          </View>

          {(Array.isArray(task.attachments) ? task.attachments : []).length === 0 ? (
            <Text style={styles.muted}>Henüz ek dosya yok.</Text>
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
                  <Text style={styles.attachmentRemove}>Kaldır</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
