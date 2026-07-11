import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';

function createStyles(colors, tone) {
  const isPremium = tone === 'premium';
  const isDanger = tone === 'danger';

  return StyleSheet.create({
    card: {
      backgroundColor: isPremium ? colors.primaryLight : colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: isPremium ? colors.primary : isDanger ? colors.danger : colors.border,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 16,
      gap: 12,
      ...cardShadow(colors, isPremium ? 'sm' : undefined),
      ...(isDanger ? { borderColor: `${colors.danger}44` } : {}),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isPremium ? colors.surface : colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerText: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 18,
    },
    body: {
      gap: 12,
    },
  });
}

export default function SettingsSectionCard({ icon, title, subtitle, tone = 'default', children }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, tone), [colors, tone]);

  const iconColor =
    tone === 'premium' ? colors.primary : tone === 'danger' ? colors.danger : colors.primary;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}
