import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../components/common/PrimaryButton';
import ScreenHero from '../components/layout/ScreenHero';
import SectionHeader from '../components/layout/SectionHeader';
import SettingsToggleRow from '../components/settings/SettingsToggleRow';
import { useSupabaseSession } from '../context/SupabaseContext';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../context/ThemeContext';
import { fetchProfile, pushProfilePatch } from '../lib/profileRemote';
import { coerceBoolean } from '../lib/taskRemote';
import { cardShadow } from '../theme/shadows';
import { loadNotificationsEnabled, saveNotificationsEnabled } from '../utils/appSettingsStorage';

function createStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    body: {
      paddingHorizontal: 20,
      gap: 22,
      marginTop: -18,
      paddingBottom: 36,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
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
    footerNoteWrap: {
      marginTop: 8,
      paddingVertical: 16,
      paddingHorizontal: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceSubtle,
      alignItems: 'center',
    },
    footerNote: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, setThemeMode, applyRemoteTheme } = useTheme();
  const { supabaseConfigured, authReady, userId } = useSupabaseSession();
  const { tasksDataReady, applyRemoteCompletionTally, resetAllTaskData } = useTasks();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [notificationsOn, setNotificationsOn] = useState(true);

  const heroSubtitle = useMemo(
    () =>
      supabaseConfigured
        ? 'Tercihler cihazda saklanır; Supabase profiles ile senkron. Bu ekrana gelince sunucudan güncellenir.'
        : 'Tercihler cihazda saklanır. Bulut için EXPO_PUBLIC_SUPABASE_URL ve ANON_KEY ekleyin.',
    [supabaseConfigured],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadNotificationsEnabled().then((v) => {
        if (active) setNotificationsOn(v);
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
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <ScreenHero
        eyebrow="Tercihler"
        title="Ayarlar"
        subtitle={heroSubtitle}
        titleSize={30}
      />

      <View style={[styles.body, { paddingBottom: Math.max(insets.bottom, 24) }]}>
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

        <SectionHeader title="Premium" subtitle="Yakında genişleyecek özellikler." />
        <View style={styles.sectionCard}>
          <Text style={styles.premiumHint}>
            Özel temalar, yapay zekâ ile günlük plan ve gelişmiş istatistikler yakında burada olacak.
          </Text>
          <PrimaryButton
            title="Premium’a geç (yakında)"
            variant="outline"
            onPress={() =>
              Alert.alert('Premium', 'Bu özellik henüz hazır değil; uygulama geliştikçe buradan erişilecek.')
            }
          />
        </View>

        <SectionHeader title="Veri yönetimi" subtitle="Uygulama verisini temizleme araçları." />
        <View style={styles.sectionCard}>
          <Text style={styles.premiumHint}>
            Sorun giderme için görevler, tamamlanma puanı ve yerel önbellek tek dokunuşla temizlenir.
          </Text>
          <PrimaryButton title="Tüm veriyi sıfırla" variant="outline" onPress={onResetData} />
        </View>

        <View style={styles.footerNoteWrap}>
          <Text style={styles.footerNote}>DailyscheduleApp · planına uygun sade yapı</Text>
        </View>
      </View>
    </ScrollView>
  );
}
