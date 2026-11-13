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
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isPremium ? colors.primary : isDanger ? colors.danger : colors.border,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 18,
      gap: 16,
      ...cardShadow(colors, isPremium ? 'sm' : undefined),
      ...(isDanger ? { borderColor: `${colors.danger}44` } : {}),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDanger ? `${colors.danger}14` : isPremium ? colors.surface : `${colors.primary}12`,
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
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDanger ? `${colors.danger}33` : colors.border,
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
      {children ? <View style={styles.divider} /> : null}
      {children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}
