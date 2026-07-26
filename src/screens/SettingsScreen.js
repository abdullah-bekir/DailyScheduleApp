import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../components/common/PrimaryButton';
import ScreenHero from '../components/layout/ScreenHero';
import SettingsSectionCard from '../components/settings/SettingsSectionCard';
import SettingsToggleRow from '../components/settings/SettingsToggleRow';
import { useLocale } from '../context/LocaleContext';
import { useSupabaseSession } from '../context/SupabaseContext';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { pushProfilePatch } from '../lib/profileRemote';
import { cardShadow } from '../theme/shadows';
import {
  DAILY_PLAN_GOAL_OPTIONS,
  DEFAULT_DAILY_PLAN_GOAL,
  loadDailyPlanGoal,
  loadNotificationsEnabled,
  saveDailyPlanGoal,
  saveNotificationsEnabled,
} from '../utils/appSettingsStorage';

function createStyles(colors, isDark) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    body: {
      paddingHorizontal: 20,
      gap: 18,
      marginTop: -18,
    },
    overviewCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      gap: 14,
      ...cardShadow(colors),
    },
    overviewTitle: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    overviewPills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    goalHint: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 19,
    },
    goalPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 14,
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
    },
    goalPreviewText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 18,
    },
    goalChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'space-between',
    },
    goalChip: {
      width: '31%',
      minWidth: 88,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    goalChipSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? colors.primaryLight : colors.primary,
    },
    goalChipText: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    goalChipTextSelected: {
      color: isDark ? colors.primary : colors.onPrimary,
    },
    languageList: {
      gap: 8,
    },
    languageOption: {
      minHeight: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    languageOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    languageOptionText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    languageOptionTextSelected: {
      color: colors.primary,
    },
    languageSelector: {
      minHeight: 54,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceSubtle,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    languageSelectorText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    dangerNote: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.danger,
      lineHeight: 19,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: 2,
    },
    syncRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
    },
    syncDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    syncTextBlock: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    syncTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    syncSub: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 17,
    },
    versionText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 4,
    },
  });
}

export default function SettingsScreen() {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { colors, isDark, setThemeMode } = useTheme();
  const { language, setLanguage, supportedLanguages } = useLocale();
  const { supabaseConfigured, authReady, userId } = useSupabaseSession();
  const storageUserId = supabaseConfigured ? userId : null;
  const { tasksDataReady, tasksSyncError, retryCloudSync, resetAllTaskData, reportTasksSyncError } = useTasks();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [dailyPlanGoal, setDailyPlanGoal] = useState(DEFAULT_DAILY_PLAN_GOAL);
  const [syncBusy, setSyncBusy] = useState(false);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? Constants.manifest?.version ?? '—';

  const syncStatus = useMemo(() => {
    if (!supabaseConfigured) {
      return {
        tone: colors.textSecondary,
        label: t('settings.syncLocal'),
        detail: t('settings.syncLocalDetail'),
        icon: 'phone-portrait-outline',
      };
    }
    if (!authReady) {
      return {
        tone: colors.warning,
        label: t('settings.syncConnecting'),
        detail: t('settings.syncConnectingDetail'),
        icon: 'cloud-outline',
      };
    }
    if (!userId) {
      return {
        tone: colors.warning,
        label: t('settings.syncNoSession'),
        detail: t('settings.syncNoSessionDetail'),
        icon: 'cloud-offline-outline',
      };
    }
    if (!tasksDataReady) {
      return {
        tone: colors.primary,
        label: t('settings.syncProgress'),
        detail: t('settings.syncProgressDetail'),
        icon: 'sync-outline',
      };
    }
    if (tasksSyncError) {
      return {
        tone: colors.danger,
        label: t('settings.syncError'),
        detail: tasksSyncError,
        icon: 'alert-circle-outline',
      };
    }
    return {
      tone: colors.success,
      label: t('settings.syncActive'),
      detail: t('settings.syncActiveDetail'),
      icon: 'cloud-done-outline',
    };
  }, [supabaseConfigured, authReady, userId, tasksDataReady, tasksSyncError, colors, t]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadNotificationsEnabled(storageUserId).then((v) => {
        if (active) setNotificationsOn(v);
      });
      loadDailyPlanGoal(storageUserId).then((g) => {
        if (active) setDailyPlanGoal(g);
      });
      return () => {
        active = false;
      };
    }, [storageUserId]),
  );

  const onNotificationsChange = async (value) => {
    setNotificationsOn(value);
    await saveNotificationsEnabled(value, storageUserId);
    if (!supabaseConfigured) return;
    const result = await pushProfilePatch({ notifications_enabled: value });
    if (!result?.ok) reportTasksSyncError(result?.error);
  };

  const onSelectGoal = async (n) => {
    setDailyPlanGoal(n);
    await saveDailyPlanGoal(n, storageUserId);
  };

  const onManualSync = useCallback(async () => {
    if (!supabaseConfigured || !userId || syncBusy) return;
    setSyncBusy(true);
    try {
      await retryCloudSync();
    } finally {
      setSyncBusy(false);
    }
  }, [supabaseConfigured, userId, syncBusy, retryCloudSync]);

  const onResetData = useCallback(() => {
    Alert.alert(
      t('settings.resetTitle'),
      t('settings.resetBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.resetConfirm'),
          style: 'destructive',
          onPress: () => {
            resetAllTaskData();
          },
        },
      ],
    );
  }, [resetAllTaskData, t]);

  const scrollBottom = Math.max(insets.bottom + tabBarHeight + 40, tabBarHeight + 56);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHero
        eyebrow={t('settings.eyebrow')}
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        titleSize={30}
      />

      <View style={[styles.body, { paddingBottom: scrollBottom }]}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>{t('settings.overview')}</Text>
          <View style={styles.overviewPills}>
            <View style={styles.pill}>
              <Ionicons name="flag-outline" size={16} color={colors.primary} />
              <Text style={styles.pillText}>{t('settings.goalPill', { goal: dailyPlanGoal })}</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={16} color={colors.primary} />
              <Text style={styles.pillText}>{isDark ? t('settings.darkTheme') : t('settings.lightTheme')}</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name={notificationsOn ? 'notifications' : 'notifications-off-outline'} size={16} color={colors.primary} />
              <Text style={styles.pillText}>{notificationsOn ? t('settings.notifyOn') : t('settings.notifyOff')}</Text>
            </View>
          </View>
        </View>

        <SettingsSectionCard
          icon="cloud-outline"
          title={t('settings.syncTitle')}
          subtitle={t('settings.syncSubtitle')}
        >
          <View style={styles.syncRow}>
            <Ionicons name={syncStatus.icon} size={22} color={syncStatus.tone} />
            <View style={styles.syncTextBlock}>
              <Text style={styles.syncTitle}>{syncStatus.label}</Text>
              <Text style={styles.syncSub}>{syncStatus.detail}</Text>
            </View>
            <View style={[styles.syncDot, { backgroundColor: syncStatus.tone }]} />
          </View>
          {supabaseConfigured && userId ? (
            <PrimaryButton
              title={syncBusy ? t('settings.syncProgress') : t('settings.syncNow')}
              variant="outline"
              onPress={onManualSync}
              disabled={syncBusy}
              mutedCta
            />
          ) : null}
        </SettingsSectionCard>

        <SettingsSectionCard
          icon="color-palette-outline"
          title={t('settings.appearanceTitle')}
          subtitle={t('settings.appearanceSub')}
        >
          <SettingsToggleRow
            icon="moon-outline"
            title={t('settings.darkMode')}
            subtitle={t('settings.darkModeSub')}
            value={isDark}
            onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
          />
        </SettingsSectionCard>

        <SettingsSectionCard
          icon="notifications-outline"
          title={t('settings.notifyTitle')}
          subtitle={t('settings.notifySub')}
        >
          <SettingsToggleRow
            icon="alarm-outline"
            title={t('settings.notifyToggle')}
            subtitle={t('settings.notifyToggleSub')}
            value={notificationsOn}
            onValueChange={onNotificationsChange}
          />
        </SettingsSectionCard>

        <SettingsSectionCard
          icon="trending-up-outline"
          title={t('settings.goalTitle')}
          subtitle={t('settings.goalSub')}
        >
          <Text style={styles.goalHint}>{t('settings.goalHint')}</Text>
          <View style={styles.goalPreview}>
            <Ionicons name="analytics-outline" size={22} color={colors.primary} />
            <Text style={styles.goalPreviewText}>
              {t('settings.goalPreview', { goal: dailyPlanGoal })}
            </Text>
          </View>
          <View style={styles.goalChipRow}>
            {DAILY_PLAN_GOAL_OPTIONS.map((n) => {
              const selected = dailyPlanGoal === n;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={t('settings.goalA11y', { goal: n })}
                  style={[styles.goalChip, selected && styles.goalChipSelected]}
                  onPress={() => onSelectGoal(n)}
                >
                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={isDark ? colors.primary : colors.onPrimary}
                    />
                  ) : null}
                  <Text style={[styles.goalChipText, selected && styles.goalChipTextSelected]}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon="language-outline"
          title={t('settings.languageTitle')}
          subtitle={t('settings.languageSub')}
        >
          <Text style={styles.goalHint}>{t('settings.languageHint')}</Text>
          <Pressable
            style={styles.languageSelector}
            onPress={() => setLanguagePickerOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityState={{ expanded: languagePickerOpen }}
            accessibilityLabel={t('settings.languageTitle')}
          >
            <Ionicons name="language-outline" size={22} color={colors.primary} />
            <Text style={styles.languageSelectorText} numberOfLines={1}>
              {t(`languages.${language}`)}
            </Text>
            <Ionicons
              name={languagePickerOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>

          {languagePickerOpen ? (
            <View style={styles.languageList} accessibilityRole="radiogroup">
              {supportedLanguages.map(({ code }) => {
                const selected = language === code;
                return (
                  <Pressable
                    key={code}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={t(`languages.${code}`)}
                    style={[styles.languageOption, selected && styles.languageOptionSelected]}
                    onPress={() => {
                      setLanguagePickerOpen(false);
                      setLanguage(code);
                    }}
                  >
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={selected ? colors.primary : colors.textTertiary}
                    />
                    <Text style={[styles.languageOptionText, selected && styles.languageOptionTextSelected]} numberOfLines={1}>
                      {t(`languages.${code}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </SettingsSectionCard>

        <SettingsSectionCard
          icon="trash-outline"
          title={t('settings.dataTitle')}
          subtitle={t('settings.dataSub')}
          tone="danger"
        >
          <Text style={styles.dangerNote}>{t('settings.dataWarning')}</Text>
          <View style={styles.divider} />
          <PrimaryButton title={t('settings.resetBtn')} variant="outline" onPress={onResetData} />
        </SettingsSectionCard>

        <Text style={styles.versionText}>{t('settings.version', { version: appVersion })}</Text>
      </View>
    </ScrollView>
  );
}
