import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../components/common/PrimaryButton';
import TextLink from '../components/common/TextLink';
import ScreenBackBar from '../components/layout/ScreenBackBar';
import AccountAuthSection from '../components/settings/AccountAuthSection';
import SettingsSectionCard from '../components/settings/SettingsSectionCard';
import SettingsSubscriptionSection from '../components/settings/SettingsSubscriptionSection';
import SettingsToggleRow from '../components/settings/SettingsToggleRow';
import useSyncStatus from '../components/settings/useSyncStatus';
import { PRIVACY_POLICY_URL, SUPPORT_EMAIL } from '../constants/legalUrls';
import { useAppSettings } from '../context/AppSettingsContext';
import { useLocale } from '../context/LocaleContext';
import { useSupabaseSession } from '../context/SupabaseContext';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { DAILY_PLAN_GOAL_OPTIONS } from '../utils/appSettingsStorage';
import {
  applyDailyReminderEnabled,
  cancelDailyReminder,
  DAILY_REMINDER_HOUR,
  requestDailyReminderPermissions,
} from '../utils/dailyReminderNotifications';
import { openExternalUrl, openSupportEmail } from '../utils/openExternalUrl';

function createStyles(colors, isDark) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 6,
      gap: 14,
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
    infoNote: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 19,
    },
    linkRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'center',
    },
    contactBlock: {
      gap: 6,
    },
    contactHeading: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textPrimary,
      marginTop: 4,
    },
    dataBullet: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 20,
      paddingLeft: 4,
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
  });
}

export default function SettingsDetailScreen({ route, navigation }) {
  const section = route?.params?.section ?? 'account';
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, isDark, setThemeMode } = useTheme();
  const { language, setLanguage, supportedLanguages } = useLocale();
  const { supabaseConfigured, userId } = useSupabaseSession();
  const {
    dailyPlanGoal,
    notificationsEnabled: notificationsOn,
    setDailyPlanGoal,
    setNotificationsEnabled,
  } = useAppSettings();
  const { retryCloudSync, resetAllTaskData, deleteCloudAccountAndData } = useTasks();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const syncStatus = useSyncStatus();
  const [syncBusy, setSyncBusy] = useState(false);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  const storeName = Platform.OS === 'ios' ? t('paywall.storeAppStore') : t('paywall.storeGooglePlay');

  const onNotificationsChange = async (value) => {
    if (value) {
      const perm = await requestDailyReminderPermissions();
      if (perm.expoGo) {
        Alert.alert(t('settings.notifyExpoGoTitle'), t('settings.notifyExpoGoBody'));
        return;
      }
      if (!perm.granted) {
        Alert.alert(t('settings.notifyPermissionTitle'), t('settings.notifyPermissionBody'));
        return;
      }
      const scheduled = await applyDailyReminderEnabled(true, {
        title: t('reminder.dailyTitle'),
        body: t('reminder.dailyBody'),
      });
      if (!scheduled.ok) {
        Alert.alert(t('settings.notifyTitle'), t('settings.notifyScheduleFailed'));
        return;
      }
    } else {
      await cancelDailyReminder();
    }
    const result = await setNotificationsEnabled(value);
    if (result && result.ok === false) {
      Alert.alert(t('settings.notifyTitle'), t('settings.notifyPrefSyncFailed'));
      if (value) {
        await cancelDailyReminder();
      }
    }
  };

  const onSelectGoal = (n) => {
    setDailyPlanGoal(n);
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
          onPress: async () => {
            const ok = await resetAllTaskData();
            if (!ok) {
              Alert.alert(t('settings.syncError'), t('settings.resetFailed'));
            }
          },
        },
      ],
    );
  }, [resetAllTaskData, t]);

  const onDeleteCloudAccount = useCallback(() => {
    if (!supabaseConfigured) {
      Alert.alert(t('settings.deleteCloudTitle'), t('settings.syncLocalDetail'));
      return;
    }
    Alert.alert(t('settings.deleteCloudTitle'), t('settings.deleteCloudBody', { store: storeName }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteCloudConfirm'),
        style: 'destructive',
        onPress: async () => {
          const ok = await deleteCloudAccountAndData();
          if (ok) {
            Alert.alert(t('settings.legalTitle'), t('settings.deleteCloudSuccess'), [{ text: t('common.ok') }]);
          } else {
            Alert.alert(t('settings.syncError'), t('settings.deleteCloudFailed'));
          }
        },
      },
    ]);
  }, [deleteCloudAccountAndData, storeName, supabaseConfigured, t]);

  const renderSection = () => {
    switch (section) {
      case 'account':
        return (
          <>
        <SettingsSectionCard
          icon="person-outline"
          title={t('settings.accountTitle')}
          subtitle={t('settings.accountSub')}
        >
          <AccountAuthSection />
        </SettingsSectionCard>
          </>
        );
      case 'premium':
        return (
          <>
        <SettingsSubscriptionSection />
          </>
        );
      case 'sync':
        return (
          <>
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
          </>
        );
      case 'appearance':
        return (
          <>
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
          </>
        );
      case 'notifications':
        return (
          <>
        <SettingsSectionCard
          icon="notifications-outline"
          title={t('settings.notifyTitle')}
          subtitle={t('settings.notifySub')}
        >
          <SettingsToggleRow
            icon="alarm-outline"
            title={t('settings.notifyToggle')}
            subtitle={t('settings.notifyToggleSub', { hour: String(DAILY_REMINDER_HOUR).padStart(2, '0') })}
            value={notificationsOn}
            onValueChange={onNotificationsChange}
          />
        </SettingsSectionCard>
          </>
        );
      case 'goal':
        return (
          <>
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
          </>
        );
      case 'language':
        return (
          <>
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
          </>
        );
      case 'legal':
        return (
          <>
        <SettingsSectionCard
          icon="document-text-outline"
          title={t('settings.legalTitle')}
          subtitle={t('settings.legalSub')}
        >
          <Text style={styles.infoNote}>{t('settings.legalIntro')}</Text>
          <TextLink
            title={t('settings.privacyPolicyLink')}
            onPress={() => openExternalUrl(PRIVACY_POLICY_URL)}
          />
          <View style={styles.contactBlock}>
            <Text style={styles.contactHeading}>{t('settings.supportContactLabel')}</Text>
            <Text style={styles.infoNote}>{t('settings.supportContactHint')}</Text>
            <Text style={styles.infoNote}>{t('settings.privacyContactHint')}</Text>
            <TextLink title={SUPPORT_EMAIL} onPress={() => openSupportEmail('Planly support')} />
          </View>
        </SettingsSectionCard>
          </>
        );
      case 'data':
        return (
          <>
        <SettingsSectionCard
          icon="trash-outline"
          title={t('settings.dataTitle')}
          subtitle={t('settings.dataSub')}
          tone="danger"
        >
          <Text style={styles.infoNote}>{t('settings.dataIntro')}</Text>
          <Text style={styles.dataBullet}>• {t('settings.dataResetDetail')}</Text>
          <Text style={styles.dataBullet}>• {t('settings.dataDeleteDetail')}</Text>
          <Text style={styles.infoNote}>{t('settings.dataSubscriptionNote', { store: storeName })}</Text>
          <Text style={styles.dangerNote}>{t('settings.dataWarning')}</Text>
          <View style={styles.divider} />
          <PrimaryButton title={t('settings.resetBtn')} variant="outline" onPress={onResetData} />
          {supabaseConfigured && userId ? (
            <>
              <View style={styles.divider} />
              <PrimaryButton
                title={t('settings.deleteCloudBtn')}
                variant="outline"
                onPress={onDeleteCloudAccount}
              />
            </>
          ) : null}
        </SettingsSectionCard>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenBackBar label={t('common.back')} onPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderSection()}
      </ScrollView>
    </View>
  );
}
