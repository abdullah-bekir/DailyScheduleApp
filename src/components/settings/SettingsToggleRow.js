import { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

function createStyles(colors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 4,
    },
    textBlock: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });
}

export default function SettingsToggleRow({ title, subtitle, value, onValueChange }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={Boolean(value)}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={Boolean(value) ? colors.primary : colors.surface}
      />
    </View>
  );
}
