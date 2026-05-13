import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { formatDateKeyForDisplay } from '../../utils/dateKey';
import PrimaryButton from '../common/PrimaryButton';
import PriorityChips from './PriorityChips';

function dateToTimeString(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function timeStringToDate(time) {
  const [hoursRaw, minutesRaw] = String(time || '').split(':');
  const hours = parseInt(hoursRaw, 10);
  const minutes = parseInt(minutesRaw, 10);
  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(Number.isNaN(hours) ? 9 : hours, Number.isNaN(minutes) ? 0 : minutes);
  return d;
}

function createStyles(colors, isDark) {
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
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 22,
      paddingTop: 12,
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
      borderRadius: 16,
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
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'android' ? 12 : 14,
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceSubtle,
      fontWeight: '500',
      minHeight: 48,
    },
    planBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor: colors.surfaceSubtle,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    planBoxTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 0.2,
    },
    planBoxHint: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 17,
    },
    timeSummaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
    },
    timeSummaryText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      flex: 1,
    },
    timeSummarySub: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 2,
    },
    pickerWrap: {
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 16,
      backgroundColor: isDark ? '#000000' : colors.surface,
      paddingHorizontal: 2,
      paddingVertical: 4,
      overflow: 'hidden',
    },
    picker: {
      color: colors.textPrimary,
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
      marginTop: 8,
      marginBottom: 4,
    },
    actionGrow: {
      flex: 1,
    },
  });
}

export default function AddTaskModal({ visible, onClose, onSave, dateKey }) {
  const insets = useSafeAreaInsets();
  const titleRef = useRef(null);
  const scrollRef = useRef(null);
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(() => timeStringToDate('09:00'));
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  /** Saat tekerleği kapalı başlar; kullanıcı önce görevini yazar, plan kutusundan saat açar. */
  const [timeExpanded, setTimeExpanded] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTitle('');
    setTime(timeStringToDate('09:00'));
    setPriority('medium');
    setError('');
    setTimeExpanded(false);
  }, [visible, dateKey]);

  useEffect(() => {
    if (!visible) return;
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
    let timeoutId;
    const rafId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => titleRef.current?.focus?.(), 120);
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [visible, dateKey]);

  function handleSave() {
    if (!title.trim()) {
      setError('Görev başlığı zorunlu.');
      return;
    }
    onSave({ title, time: dateToTimeString(time), priority, dateKey });
    onClose();
  }

  const dateLabel = formatDateKeyForDisplay(dateKey);
  const sheetPadBottom = Math.max(insets.bottom, 12) + 8;
  const timeLabel = dateToTimeString(time);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={{ maxHeight: '88%' }}
          contentContainerStyle={{ paddingBottom: sheetPadBottom }}
        >
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

            <Text style={styles.fieldLabel}>Görev</Text>
            <TextInput
              ref={titleRef}
              style={styles.input}
              placeholder="Bugün ne yapacaksın? Buraya yaz…"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (error) setError('');
              }}
              autoCorrect
              autoCapitalize="sentences"
              returnKeyType="done"
              blurOnSubmit={false}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>Öncelik</Text>
            <PriorityChips value={priority} onChange={setPriority} />

            <View style={styles.planBox}>
              <Text style={styles.planBoxTitle}>Görev planı · saat</Text>
              <Text style={styles.planBoxHint}>
                Saat burada; önce görevini yaz. İstersen aşağıdan saati açıp değiştir.
              </Text>
              <Pressable
                onPress={() => setTimeExpanded((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={timeExpanded ? 'Saat seçiciyi gizle' : 'Saat seçiciyi göster'}
                style={styles.timeSummaryRow}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.timeSummaryText}>{timeLabel}</Text>
                  <Text style={styles.timeSummarySub}>
                    {timeExpanded ? 'Kapatmak için dokun' : 'Saati değiştirmek için dokun'}
                  </Text>
                </View>
                <Ionicons
                  name={timeExpanded ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={colors.primary}
                />
              </Pressable>
              {timeExpanded ? (
                <View style={styles.pickerWrap}>
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
                    style={styles.picker}
                    textColor={isDark ? '#FFFFFF' : colors.textPrimary}
                    themeVariant={isDark ? 'dark' : 'light'}
                    is24Hour
                    onChange={(_event, selectedDate) => {
                      if (selectedDate) setTime(selectedDate);
                    }}
                    minuteInterval={5}
                  />
                </View>
              ) : null}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <View style={styles.actionGrow}>
                <PrimaryButton title="İptal" variant="outline" onPress={onClose} />
              </View>
              <View style={styles.actionGrow}>
                <PrimaryButton title="Kaydet" onPress={handleSave} mutedCta />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
