import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

function createStyles(colors, compact) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: compact ? 9 : 14,
      marginTop: compact ? 2 : 6,
      paddingRight: 4,
    },
    accent: {
      width: 3,
      height: compact ? 22 : 28,
      borderRadius: 999,
      backgroundColor: colors.primary,
      opacity: 0.95,
    },
    block: {
      flex: 1,
      gap: compact ? 3 : 5,
      minWidth: 0,
    },
    title: {
      color: colors.textPrimary,
      fontSize: compact ? 16 : 19,
      fontWeight: '800',
      letterSpacing: compact ? -0.35 : -0.45,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: compact ? 12 : 13,
      fontWeight: '500',
      lineHeight: compact ? 16 : 19,
    },
  });
}

export default function SectionHeader({ title, subtitle, compact = false }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, compact), [colors, compact]);

  return (
    <View style={styles.row}>
      <View style={styles.accent} />
      <View style={styles.block}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}
