import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
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

import { useLocale } from '../../context/LocaleContext';
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
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlayBackdrop,
    },
    sheetOuter: {
      maxHeight: '90%',
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
      paddingVertical: Platform.OS === 'android' ? 14 : 14,
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceSubtle,
      fontWeight: '500',
      minHeight: 52,
      maxHeight: 120,
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
  const { t } = useTranslation();
  const { dateLocale } = useLocale();
  const insets = useSafeAreaInsets();
  const titleRef = useRef(null);
  const scrollRef = useRef(null);
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(() => timeStringToDate('09:00'));
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
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
      timeoutId = setTimeout(() => titleRef.current?.focus?.(), 280);
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [visible, dateKey]);

  const scrollTitleIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo?.({ y: 0, animated: true });
    });
  }, []);

  async function handleSave() {
    if (!title.trim()) {
      setError(t('addTask.titleRequired'));
      scrollTitleIntoView();
      titleRef.current?.focus?.();
      return;
    }
    Keyboard.dismiss();
    const saved = await onSave({ title, time: dateToTimeString(time), priority, dateKey });
    if (saved) {
      onClose();
    } else {
      setError(t('settings.syncError'));
    }
  }

  const dateLabel = formatDateKeyForDisplay(dateKey, dateLocale);
  const sheetPadBottom = Math.max(insets.bottom, 12) + 12;
  const timeLabel = dateToTimeString(time);
  const keyboardOffset = Platform.OS === 'ios' ? insets.top : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetOuter}
          keyboardVerticalOffset={keyboardOffset}
        >
          <Pressable onPress={() => {}} accessibilityViewIsModal>
            <ScrollView
              ref={scrollRef}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled
            >
              <View style={[styles.sheet, { paddingBottom: sheetPadBottom }]}>
                <View style={styles.handle} />
                <View style={styles.headerRow}>
                  <View style={styles.headerIconWrap}>
                    <Ionicons name="create-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.headerTextBlock}>
                    <Text style={styles.sheetTitle}>{t('addTask.title')}</Text>
                    {dateLabel ? <Text style={styles.dateLine}>{dateLabel}</Text> : null}
                  </View>
                </View>

                <Text style={styles.fieldLabel}>{t('addTask.fieldTask')}</Text>
                <TextInput
                  ref={titleRef}
                  style={styles.input}
                  placeholder={t('addTask.placeholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (error) setError('');
                  }}
                  onFocus={scrollTitleIntoView}
                  autoCorrect
                  autoCapitalize="sentences"
                  returnKeyType="done"
                  submitBehavior="blurAndSubmit"
                  blurOnSubmit
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  importantForAutofill="yes"
                />

                <Text style={styles.fieldLabel}>{t('addTask.fieldPriority')}</Text>
                <PriorityChips value={priority} onChange={setPriority} />

                <View style={styles.planBox}>
                  <Text style={styles.planBoxTitle}>{t('addTask.planTimeTitle')}</Text>
                  <Text style={styles.planBoxHint}>{t('addTask.planTimeHint')}</Text>
                  <Pressable
                    onPress={() => setTimeExpanded((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={timeExpanded ? t('addTask.timeHide') : t('addTask.timeShow')}
                    style={styles.timeSummaryRow}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.timeSummaryText}>{timeLabel}</Text>
                      <Text style={styles.timeSummarySub}>
                        {timeExpanded ? t('addTask.timeTapClose') : t('addTask.timeTapOpen')}
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
                        display="spinner"
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
                    <PrimaryButton title={t('common.cancel')} variant="outline" onPress={onClose} />
                  </View>
                  <View style={styles.actionGrow}>
                    <PrimaryButton title={t('common.save')} onPress={handleSave} mutedCta />
                  </View>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
