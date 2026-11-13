import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenHero from '../components/layout/ScreenHero';
import SettingsRow from '../components/settings/SettingsRow';
import useSyncStatus from '../components/settings/useSyncStatus';
import { DAILY_REMINDER_HOUR } from '../utils/dailyReminderNotifications';
import { useAppSettings } from '../context/AppSettingsContext';
import { useLocale } from '../context/LocaleContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useSupabaseSession } from '../context/SupabaseContext';
import { useTheme } from '../context/ThemeContext';

function createStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      paddingHorizontal: 20,
      gap: 10,
      marginTop: -6,
    },
    spacer: {
      height: 6,
    },
  });
}

/** Ayarlar ana ekranı: ince satır butonları; her biri kendi detay ekranını açar. */
export default function SettingsScreen() {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { colors, isDark } = useTheme();
  const { language } = useLocale();
  const { supabaseConfigured, authReady, isRegistered, username, userEmail } = useSupabaseSession();
  const { dailyPlanGoal, notificationsEnabled } = useAppSettings();
  const { isPro, billingConfigured } = useSubscription();
  const syncStatus = useSyncStatus();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const open = (section) => () => navigation.navigate('SettingsDetail', { section });

  const accountSubtitle = !supabaseConfigured
    ? t('settings.syncLocal')
    : !authReady
      ? t('settings.syncConnecting')
      : isRegistered
        ? username || userEmail || t('settings.accountRegisteredTitle')
        : t('settings.syncNoSession');

  const reminderHour = String(DAILY_REMINDER_HOUR).padStart(2, '0');
  const scrollBottom = Math.max(insets.bottom + tabBarHeight + 40, tabBarHeight + 56);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: scrollBottom }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        eyebrow={t('settings.eyebrow')}
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        titleSize={30}
      />

      <View style={styles.list}>
        <View style={styles.spacer} />
        <SettingsRow
          icon="person-outline"
          title={t('settings.accountTitle')}
          subtitle={accountSubtitle}
          statusColor={isRegistered ? colors.success : undefined}
          onPress={open('account')}
        />
        <SettingsRow
          icon={isPro ? 'diamond' : 'diamond-outline'}
          title={t('settings.subTitle')}
          subtitle={
            !billingConfigured
              ? t('paywall.billingNotConfigured')
              : isPro
                ? t('settings.subStatusActive')
                : t('settings.subStatusFree')
          }
          tone="premium"
          badge={isPro ? 'Premium' : undefined}
          onPress={open('premium')}
        />
        <SettingsRow
          icon={syncStatus.icon}
          title={t('settings.syncTitle')}
          subtitle={syncStatus.label}
          statusColor={syncStatus.tone}
          onPress={open('sync')}
        />
        <SettingsRow
          icon={isDark ? 'moon-outline' : 'sunny-outline'}
          title={t('settings.appearanceTitle')}
          subtitle={isDark ? t('settings.darkTheme') : t('settings.lightTheme')}
          onPress={open('appearance')}
        />
        <SettingsRow
          icon={notificationsEnabled ? 'notifications-outline' : 'notifications-off-outline'}
          title={t('settings.notifyTitle')}
          subtitle={
            notificationsEnabled ? `${t('settings.notifyOn')} · ${reminderHour}:00` : t('settings.notifyOff')
          }
          onPress={open('notifications')}
        />
        <SettingsRow
          icon="trending-up-outline"
          title={t('settings.goalTitle')}
          subtitle={t('settings.goalPill', { goal: dailyPlanGoal })}
          onPress={open('goal')}
        />
        <SettingsRow
          icon="language-outline"
          title={t('settings.languageTitle')}
          subtitle={t(`languages.${language}`)}
          onPress={open('language')}
        />
        <SettingsRow
          icon="document-text-outline"
          title={t('settings.legalTitle')}
          subtitle={t('settings.legalSub')}
          onPress={open('legal')}
        />
        <SettingsRow
          icon="trash-outline"
          title={t('settings.dataTitle')}
          subtitle={t('settings.dataSub')}
          tone="danger"
          onPress={open('data')}
        />
      </View>
    </ScrollView>
  );
}
