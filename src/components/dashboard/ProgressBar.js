import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../context/ThemeContext';

function createStyles(colors, variant) {
  const isFeatured = variant === 'featured';
  return StyleSheet.create({
    wrapper: {
      gap: isFeatured ? 14 : 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    title: {
      color: colors.textSecondary,
      fontSize: isFeatured ? 12 : 15,
      fontWeight: '700',
      letterSpacing: isFeatured ? 1 : 0,
      textTransform: isFeatured ? 'uppercase' : 'none',
    },
    percentWrap: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
    },
    percentNum: {
      color: isFeatured ? colors.textSecondary : colors.primary,
      fontSize: isFeatured ? 30 : 14,
      fontWeight: '800',
      letterSpacing: -1,
    },
    percentSign: {
      color: isFeatured ? colors.textSecondary : colors.primary,
      fontSize: isFeatured ? 14 : 14,
      fontWeight: '700',
      opacity: isFeatured ? 1 : 0.85,
    },
    track: {
      height: isFeatured ? 14 : 10,
      borderRadius: 999,
      // Ana sayfa özet / üst şerit ile uyumlu nötr gri; primary (köşe siyahı) kullanılmaz.
      backgroundColor: isFeatured ? colors.surfaceSubtle : colors.calendarMuted,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    fill: {
      height: isFeatured ? 14 : 10,
      backgroundColor: isFeatured ? colors.textSecondary : colors.primary,
      borderRadius: 999,
    },
    caption: {
      marginTop: 2,
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 21,
    },
    footnote: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: '500',
      color: colors.textTertiary,
      lineHeight: 17,
    },
  });
}

export default function ProgressBar({
  progress,
  variant = 'default',
  caption,
  footnote,
  headerTitle,
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, variant), [colors, variant]);
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const title =
    headerTitle ?? (variant === 'featured' ? t('home.progressTitle') : t('tasks.dayProgress'));

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.percentWrap}>
          <Text style={styles.percentNum}>{clampedProgress}</Text>
          <Text style={styles.percentSign}>%</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedProgress}%` }]} />
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
    </View>
  );
}
