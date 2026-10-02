import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../common/PrimaryButton';
import { useSupabaseSession } from '../../context/SupabaseContext';
import { useTheme } from '../../context/ThemeContext';

function createStyles(colors) {
  return StyleSheet.create({
    hint: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 19,
    },
    sessionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
    },
    sessionIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sessionText: {
      flex: 1,
      gap: 3,
      minWidth: 0,
    },
    sessionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    sessionSub: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 17,
    },
  });
}

export default function AccountAuthSection() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { supabaseConfigured, authReady, username, userEmail, isRegistered, signOutForLogin } =
    useSupabaseSession();
  const [busy, setBusy] = useState(false);

  if (!supabaseConfigured) {
    return <Text style={styles.hint}>{t('settings.accountNotConfigured')}</Text>;
  }

  if (!authReady) {
    return <Text style={styles.hint}>{t('settings.syncConnectingDetail')}</Text>;
  }

  if (!isRegistered) {
    return <Text style={styles.hint}>{t('auth.settingsSignedOutHint')}</Text>;
  }

  const displayName = username || userEmail || '—';

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.sessionRow}>
        <View style={styles.sessionIcon}>
          <Ionicons name="person-circle-outline" size={26} color={colors.primary} />
        </View>
        <View style={styles.sessionText}>
          <Text style={styles.sessionTitle}>{t('settings.accountRegisteredTitle')}</Text>
          <Text style={styles.sessionSub} numberOfLines={2}>
            {displayName}
          </Text>
        </View>
        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
      </View>
      <PrimaryButton
        title={t('settings.accountSignOutBtn')}
        variant="outline"
        mutedCta
        onPress={() => {
          Alert.alert(t('settings.accountSignOutBtn'), t('settings.accountSignOutBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('settings.accountSignOutBtn'),
              style: 'destructive',
              onPress: async () => {
                setBusy(true);
                try {
                  await signOutForLogin();
                } catch (e) {
                  Alert.alert(t('settings.syncError'), e?.message || t('auth.errorGeneric'));
                } finally {
                  setBusy(false);
                }
              },
            },
          ]);
        }}
        disabled={busy}
      />
    </View>
  );
}
