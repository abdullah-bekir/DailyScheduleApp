import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { formatDateKeyForDisplay } from '../../utils/dateKey';
import PrimaryButton from '../common/PrimaryButton';
import PriorityChips from './PriorityChips';

function normalizeTime(raw) {
  const s = raw.trim().replace(',', ':').replace(/\s/g, '');
  const match = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  let m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function createStyles(colors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlayBackdrop,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingHorizontal: 22,
      paddingTop: 12,
      paddingBottom: 30,
      gap: 12,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: colors.borderStrong,
      marginBottom: 4,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 4,
    },
    headerIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextBlock: {
      flex: 1,
      gap: 4,
      minWidth: 0,
    },
    sheetTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.4,
    },
    dateLine: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      letterSpacing: 0.1,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textSecondary,
      marginTop: 4,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceSubtle,
      fontWeight: '500',
    },
    error: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: '600',
      marginTop: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 18,
    },
    actionGrow: {
      flex: 1,
    },
  });
}

export default function AddTaskModal({ visible, onClose, onSave, dateKey }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTitle('');
    setTime('09:00');
    setPriority('medium');
    setError('');
  }, [visible, dateKey]);

  function handleSave() {
    if (!title.trim()) {
      setError('Görev başlığı zorunlu.');
      return;
    }
    const t = normalizeTime(time);
    if (!t) {
      setError('Saat GG:DD biçiminde olmalı (örnek 09:30).');
      return;
    }
    onSave({ title, time: t, priority, dateKey });
    onClose();
  }

  const dateLabel = formatDateKeyForDisplay(dateKey);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View style={styles.headerIconWrap}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.sheetTitle}>Yeni görev</Text>
              {dateLabel ? <Text style={styles.dateLine}>{dateLabel}</Text> : null}
            </View>
          </View>

          <Text style={styles.fieldLabel}>Başlık</Text>
          <TextInput
            style={styles.input}
            placeholder="Ne yapacaksın?"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (error) setError('');
            }}
            autoFocus
          />

          <Text style={styles.fieldLabel}>Saat</Text>
          <TextInput
            style={styles.input}
            placeholder="09:30"
            placeholderTextColor={colors.textTertiary}
            value={time}
            onChangeText={(text) => {
              setTime(text);
              if (error) setError('');
            }}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.fieldLabel}>Öncelik</Text>
          <PriorityChips value={priority} onChange={setPriority} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <View style={styles.actionGrow}>
              <PrimaryButton title="İptal" variant="outline" onPress={onClose} />
            </View>
            <View style={styles.actionGrow}>
              <PrimaryButton title="Kaydet" onPress={handleSave} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
