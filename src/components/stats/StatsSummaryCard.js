import { Ionicons } from '@expo/vector-icons';
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
      gap: 16,
      ...cardShadow(colors),
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    rateRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
    },
    rateValue: {
      fontSize: 44,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -1.5,
      lineHeight: 48,
      fontVariant: ['tabular-nums'],
    },
    rateUnit: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.textSecondary,
    },
    rateCaption: {
      flex: 1,
      textAlign: 'right',
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      lineHeight: 18,
      paddingBottom: 6,
    },
    track: {
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    tile: {
      width: '48.5%',
      flexGrow: 1,
      backgroundColor: colors.surfaceSubtle,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 8,
    },
    tileHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    tileIcon: {
      width: 28,
      height: 28,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tileLabel: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    tileValue: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.6,
      fontVariant: ['tabular-nums'],
    },
    tierBox: {
      gap: 8,
      paddingTop: 2,
    },
    tierRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    tierLevel: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
    },
    tierSub: {
      flex: 1,
      textAlign: 'right',
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    hint: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textTertiary,
      lineHeight: 18,
    },
  });
}

function Tile({ styles, colors, icon, label, value }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.tileHead}>
        <View style={styles.tileIcon}>
          <Ionicons name={icon} size={15} color={colors.primary} />
        </View>
        <Text style={styles.tileLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}

/**
 * İstatistikler üst özeti: tamamlanma oranı, ana sayaçlar, seviye ilerlemesi.
 */
export default function StatsSummaryCard({ stats, points, tier, tierSize, hintParams }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const rate = Math.max(0, Math.min(100, Number(stats.rate) || 0));

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{t('stats.general')}</Text>

      <View style={styles.rateRow}>
        <Text style={styles.rateValue} accessibilityLabel={`${t('stats.completionRate')}: ${rate}%`}>
          {rate}
          <Text style={styles.rateUnit}>%</Text>
        </Text>
        <Text style={styles.rateCaption} numberOfLines={2}>
          {t('stats.summaryDone', { done: stats.done, total: stats.total })}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${rate}%` }]} />
      </View>

      <View style={styles.grid}>
        <Tile styles={styles} colors={colors} icon="layers-outline" label={t('common.total')} value={stats.total} />
        <Tile
          styles={styles}
          colors={colors}
          icon="checkmark-done-outline"
          label={t('common.completed')}
          value={stats.done}
        />
        <Tile styles={styles} colors={colors} icon="hourglass-outline" label={t('stats.pending')} value={stats.pending} />
        <Tile
          styles={styles}
          colors={colors}
          icon="sparkles-outline"
          label={t('stats.completionPoints')}
          value={points}
        />
      </View>

      <View style={styles.tierBox}>
        <View style={styles.tierRow}>
          <Text style={styles.tierLevel}>{t('stats.tier', { level: tier.level })}</Text>
          <Text style={styles.tierSub} numberOfLines={2}>
            {t('stats.tierSub', { within: tier.within, size: tierSize, toNext: tier.toNext })}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${tier.pct}%` }]} />
        </View>
      </View>

      <Text style={styles.hint}>{t('stats.pointsHint', hintParams)}</Text>
    </View>
  );
}
