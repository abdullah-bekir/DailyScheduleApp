import { Ionicons } from '@expo/vector-icons';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';

function createStyles(colors, tone) {
  const isPremium = tone === 'premium';
  const isDanger = tone === 'danger';
  const accent = isDanger ? colors.danger : colors.primary;

  return StyleSheet.create({
    row: {
      minHeight: 68,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDanger ? `${colors.danger}44` : isPremium ? colors.primary : colors.border,
      backgroundColor: isPremium ? colors.primaryLight : colors.surface,
      ...cardShadow(colors, 'sm'),
    },
    rowPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.99 }],
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isPremium ? colors.surface : `${accent}14`,
    },
    text: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: isDanger ? colors.danger : colors.textPrimary,
      letterSpacing: -0.25,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    badge: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: colors.primary,
      textTransform: 'uppercase',
    },
    dot: {
      width: 9,
      height: 9,
      borderRadius: 999,
    },
  });
}

/**
 * Ayarlar ana listesindeki ince, uzun satır butonu.
 * @param {'default' | 'premium' | 'danger'} [tone]
 */
function SettingsRow({ icon, title, subtitle, onPress, tone = 'default', badge, statusColor }) {
  const { colors } = useTheme();
  const { isRtl } = useLocale();
  const styles = useMemo(() => createStyles(colors, tone), [colors, tone]);
  const iconColor = tone === 'danger' ? colors.danger : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      {statusColor ? <View style={[styles.dot, { backgroundColor: statusColor }]} /> : null}
      <Ionicons
        name={isRtl ? 'chevron-back' : 'chevron-forward'}
        size={20}
        color={colors.textTertiary}
      />
    </Pressable>
  );
}

export default memo(SettingsRow);
