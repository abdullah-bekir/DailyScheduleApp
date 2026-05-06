import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
      color: colors.primary,
      fontSize: isFeatured ? 30 : 14,
      fontWeight: '800',
      letterSpacing: -1,
    },
    percentSign: {
      color: colors.primary,
      fontSize: isFeatured ? 14 : 14,
      fontWeight: '700',
      opacity: 0.85,
    },
    track: {
      height: isFeatured ? 12 : 10,
      borderRadius: 999,
      backgroundColor: colors.calendarMuted,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    fill: {
      height: isFeatured ? 12 : 10,
      backgroundColor: colors.primary,
      borderRadius: 999,
    },
    caption: {
      marginTop: 2,
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 19,
    },
  });
}

export default function ProgressBar({ progress, variant = 'default', caption }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, variant), [colors, variant]);
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>{variant === 'featured' ? 'İlerleme' : 'Günlük ilerleme'}</Text>
        <View style={styles.percentWrap}>
          <Text style={styles.percentNum}>{clampedProgress}</Text>
          <Text style={styles.percentSign}>%</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedProgress}%` }]} />
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}
