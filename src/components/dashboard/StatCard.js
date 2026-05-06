import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';

function accentBorder(colors, accent) {
  if (!accent || accent === 'none') return {};
  const map = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    muted: colors.textSecondary,
  };
  const c = map[accent];
  if (!c) return {};
  return { borderLeftWidth: 3, borderLeftColor: c };
}

function createStyles(colors, accent) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 15,
      paddingVertical: 11,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
      minWidth: 0,
      ...cardShadow(colors, 'sm'),
      ...accentBorder(colors, accent),
    },
    value: {
      fontSize: 21,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.6,
    },
    label: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '700',
      letterSpacing: 0.2,
      lineHeight: 14,
    },
  });
}

export default function StatCard({ label, value, accent = 'none' }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, accent), [colors, accent]);

  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
