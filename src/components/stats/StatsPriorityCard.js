import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';

function createStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      gap: 14,
      ...cardShadow(colors),
    },
    title: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    row: {
      gap: 8,
    },
    rowHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    label: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    count: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textPrimary,
      fontVariant: ['tabular-nums'],
    },
    share: {
      width: 44,
      textAlign: 'right',
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      fontVariant: ['tabular-nums'],
    },
    track: {
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
    },
  });
}

/** Öncelik dağılımı: sayı + toplam içindeki pay (oransal çubuk). */
export default function StatsPriorityCard({ counts }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const rows = [
    { key: 'high', color: colors.danger, count: counts.high ?? 0 },
    { key: 'medium', color: colors.warning, count: counts.medium ?? 0 },
    { key: 'low', color: colors.success, count: counts.low ?? 0 },
  ];
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('stats.priority')}</Text>
      {rows.map((r) => {
        const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
        return (
          <View
            key={r.key}
            style={styles.row}
            accessible
            accessibilityLabel={`${t(`priority.${r.key}`)}: ${r.count} (${pct}%)`}
          >
            <View style={styles.rowHead}>
              <View style={[styles.dot, { backgroundColor: r.color }]} />
              <Text style={styles.label}>{t(`priority.${r.key}`)}</Text>
              <Text style={styles.count}>{r.count}</Text>
              <Text style={styles.share}>{pct}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%`, backgroundColor: r.color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
