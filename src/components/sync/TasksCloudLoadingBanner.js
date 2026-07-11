import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

export default function TasksCloudLoadingBanner({ colors, visible, error, onRetry, retryBusy }) {
  const { t } = useTranslation();

  if (!visible && !error) return null;

  if (error) {
    return (
      <View
        style={[styles.wrap, styles.errorWrap, { borderColor: colors.danger, backgroundColor: colors.surfaceSubtle }]}
        accessibilityRole="alert"
        accessibilityLabel={t('sync.errorA11y')}
      >
        <Ionicons name="cloud-offline-outline" size={20} color={colors.danger} />
        <View style={styles.textBlock}>
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>{t('sync.errorTitle')}</Text>
          <Text style={[styles.text, { color: colors.textSecondary }]} numberOfLines={2}>
            {error}
          </Text>
        </View>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            disabled={retryBusy}
            style={[styles.retryBtn, { borderColor: colors.primary, opacity: retryBusy ? 0.6 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel={t('sync.retryA11y')}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              {retryBusy ? '…' : t('common.retry')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[styles.wrap, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
      accessibilityRole="progressbar"
      accessibilityLabel={t('sync.loadingA11y')}
    >
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>{t('sync.loading')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  errorWrap: {
    alignItems: 'flex-start',
  },
  textBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  retryBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: 'center',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
