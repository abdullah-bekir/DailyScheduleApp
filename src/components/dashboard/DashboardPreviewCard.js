import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';

function createStyles(colors, variant, compact) {
  const rich = variant === 'rich';
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: compact ? 9 : rich ? 14 : 12,
      backgroundColor: colors.surface,
      borderRadius: compact ? 16 : rich ? 20 : 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: compact ? 11 : rich ? 17 : 14,
      paddingHorizontal: compact ? 11 : rich ? 16 : 14,
      minHeight: compact ? 78 : rich ? 88 : undefined,
      flex: compact ? 1 : undefined,
      alignSelf: compact ? 'stretch' : undefined,
      ...(rich && !compact ? cardShadow(colors, 'sm') : compact ? cardShadow(colors, 'sm') : {}),
    },
    cardDisabled: {
      opacity: 0.7,
    },
    cardPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.992 }],
    },
    iconBadge: {
      width: compact ? 38 : rich ? 50 : undefined,
      height: compact ? 38 : rich ? 50 : undefined,
      borderRadius: compact ? 12 : rich ? 16 : 0,
      backgroundColor: rich || compact ? colors.primaryLight : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: rich || compact ? 1 : 0,
      borderColor: rich || compact ? colors.border : 'transparent',
      flexShrink: 0,
    },
    icon: {
      fontSize: compact ? 19 : rich ? 24 : 22,
    },
    textBlock: {
      flex: 1,
      gap: compact ? 2 : rich ? 6 : 4,
      minWidth: 0,
      justifyContent: 'center',
    },
    title: {
      fontSize: compact ? 13 : rich ? 16 : 15,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: compact ? -0.15 : rich ? -0.25 : 0,
    },
    subtitle: {
      fontSize: compact ? 11 : 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: compact ? 14 : 18,
    },
    muted: {
      color: colors.textTertiary,
    },
    chevronWrap: {
      marginLeft: compact ? 0 : 4,
      opacity: 0.85,
      flexShrink: 0,
    },
    soonPill: {
      alignSelf: 'flex-start',
      marginTop: 4,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
    },
    soonPillText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textSecondary,
      letterSpacing: 0.6,
    },
  });
}

export default function DashboardPreviewCard({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
  variant = 'default',
  showSoonBadge,
  compact = false,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, variant, compact), [colors, variant, compact]);
  const rich = variant === 'rich';

  const iconEl = rich || compact ? (
    <View style={styles.iconBadge}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
  ) : (
    <Text style={styles.icon}>{icon}</Text>
  );

  const inner = (
    <>
      {iconEl}
      <View style={styles.textBlock}>
        <Text style={[styles.title, disabled && styles.muted]} numberOfLines={compact ? 2 : undefined}>
          {title}
        </Text>
        <Text
          style={[styles.subtitle, disabled && styles.muted]}
          numberOfLines={compact ? 2 : 2}
          ellipsizeMode="tail"
        >
          {subtitle}
        </Text>
        {disabled && showSoonBadge ? (
          <View style={styles.soonPill}>
            <Text style={styles.soonPillText}>YAKINDA</Text>
          </View>
        ) : null}
      </View>
      {!disabled ? (
        <View style={styles.chevronWrap}>
          <Ionicons name="chevron-forward" size={compact ? 18 : 22} color={colors.primary} />
        </View>
      ) : null}
    </>
  );

  if (disabled) {
    return <View style={[styles.card, styles.cardDisabled]}>{inner}</View>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {inner}
    </Pressable>
  );
}
