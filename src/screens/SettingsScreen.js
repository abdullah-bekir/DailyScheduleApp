import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation, useScrollToTop } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../components/common/PrimaryButton';
import ScreenHero from '../components/layout/ScreenHero';
import SectionHeader from '../components/layout/SectionHeader';
import SettingsToggleRow from '../components/settings/SettingsToggleRow';
import { useSupabaseSession } from '../context/SupabaseContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { fetchProfile, pushProfilePatch } from '../lib/profileRemote';
import { coerceBoolean } from '../lib/taskRemote';
import { cardShadow } from '../theme/shadows';
import {
  DAILY_PLAN_GOAL_OPTIONS,
  DEFAULT_DAILY_PLAN_GOAL,
  loadDailyPlanGoal,
  loadNotificationsEnabled,
  saveDailyPlanGoal,
  saveNotificationsEnabled,
} from '../utils/appSettingsStorage';

function createStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    body: {
      paddingHorizontal: 20,
      gap: 20,
      marginTop: -20,
      paddingBottom: 36,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 6,
      ...cardShadow(colors),
    },
    premiumHint: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 14,
      lineHeight: 21,
      paddingHorizontal: 2,
    },
    goalChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 2,
      marginBottom: 8,
    },
    goalChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceSubtle,
    },
    goalChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    goalChipText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    goalChipTextSelected: {
      color: colors.primary,
    },
  });
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { colors, isDark, setThemeMode, applyRemoteTheme } = useTheme();
  const { isPro } = useSubscription();
  const { supabaseConfigured, authReady, userId } = useSupabaseSession();
  const { tasksDataReady, applyRemoteCompletionTally, resetAllTaskData } = useTasks();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [dailyPlanGoal, setDailyPlanGoal] = useState(DEFAULT_DAILY_PLAN_GOAL);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadNotificationsEnabled().then((v) => {
        if (active) setNotificationsOn(v);
      });
      loadDailyPlanGoal().then((g) => {
        if (active) setDailyPlanGoal(g);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!supabaseConfigured || !authReady || !userId || !tasksDataReady) return undefined;
      let cancelled = false;
      (async () => {
        const profile = await fetchProfile();
        if (cancelled || !profile) return;
        applyRemoteTheme(profile.theme_mode);
        const notifyOn = coerceBoolean(profile.notifications_enabled, true);
        await saveNotificationsEnabled(notifyOn);
        setNotificationsOn(notifyOn);
        applyRemoteCompletionTally(profile.completion_tally);
      })();
      return () => {
        cancelled = true;
      };
    }, [
      supabaseConfigured,
      authReady,
      userId,
      tasksDataReady,
      applyRemoteTheme,
      applyRemoteCompletionTally,
    ]),
  );

  const onNotificationsChange = async (value) => {
    setNotificationsOn(value);
    await saveNotificationsEnabled(value);
    pushProfilePatch({ notifications_enabled: value });
  };

  const onResetData = useCallback(() => {
    Alert.alert(
      'Veriyi sıfırla',
      'Tüm görevler ve istatistik puanı temizlenecek. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            resetAllTaskData();
          },
        },
      ],
    );
  }, [resetAllTaskData]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHero eyebrow="Tercihler" title="Ayarlar" titleSize={30} />

      <View
        style={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom + tabBarHeight + 40, tabBarHeight + 56) },
        ]}
      >
        <SectionHeader title="Görünüm" subtitle="Okuma konforu ve tema seçimi." />
        <View style={styles.sectionCard}>
          <SettingsToggleRow
            title="Koyu tema"
            subtitle="Karanlık arka plan ile göz yorgunluğunu azalt."
            value={isDark}
            onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
          />
        </View>

        <SectionHeader title="Bildirimler" subtitle="Hatırlatıcılar için hazırlık." />
        <View style={styles.sectionCard}>
          <SettingsToggleRow
            title="Hatırlatıcı bildirimleri"
            subtitle="Şimdilik yalnızca tercih olarak kaydedilir; gerçek bildirim izni sonraki sürümde eklenecek."
            value={notificationsOn}
            onValueChange={onNotificationsChange}
          />
        </View>

        <SectionHeader
          title="Ana sayfa ilerlemesi"
          subtitle="«Bugünün özeti» çubuğunun plan yarısı; günlük rutinine uygun sayıyı seç."
        />
        <View style={styles.sectionCard}>
          <Text style={styles.premiumHint}>
            Kaç görevi “bir günlük plan dolusu” sayacağını seçersin. Küçük sayı (ör. 3) plan kısmını hızlı doldurur; 15–20
            yoğun günler için uygundur (çubuk aynı görev sayısında daha yavaş ilerler).
          </Text>
          <View style={styles.goalChipRow}>
            {DAILY_PLAN_GOAL_OPTIONS.map((n) => {
              const selected = dailyPlanGoal === n;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Günlük plan ölçüsü ${n} görev`}
                  style={[styles.goalChip, selected && styles.goalChipSelected]}
                  onPress={async () => {
                    setDailyPlanGoal(n);
                    await saveDailyPlanGoal(n);
                  }}
                >
                  <Text style={[styles.goalChipText, selected && styles.goalChipTextSelected]}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <SectionHeader title="Premium" subtitle="Abonelik RevenueCat üzerinden; entitlement ile reklamlar kapatılır." />
        <View style={styles.sectionCard}>
          <Text style={styles.premiumHint}>
            {isPro
              ? 'Premium aktif: tam ekran reklamlar ve app open kapalı.'
              : 'Paywall üzerinden aylık/yıllık plan; mağaza ve RevenueCat panelinde ürünleri tanımlamanız gerekir. Reklamları göstermek için .env içinde EXPO_PUBLIC_ADS_UI_ENABLED=true kullanın.'}
          </Text>
          <PrimaryButton
            title={isPro ? 'Premium aktif' : 'Premium’a geç'}
            variant="outline"
            onPress={() => navigation.navigate('Paywall')}
            mutedCta
          />
        </View>

        <SectionHeader title="Veri yönetimi" subtitle="Uygulama verisini temizleme araçları." />
        <View style={styles.sectionCard}>
          <Text style={styles.premiumHint}>
            Sorun giderme için görevler, tamamlanma puanı ve yerel önbellek tek dokunuşla temizlenir.
          </Text>
          <PrimaryButton title="Tüm veriyi sıfırla" variant="outline" onPress={onResetData} mutedCta />
        </View>
      </View>
    </ScrollView>
  );
}
