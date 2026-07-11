import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

function createStyles(colors, muted, active) {
  return StyleSheet.create({
    container: {
      minWidth: 62,
      minHeight: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      paddingHorizontal: 4,
      paddingTop: 2,
      paddingBottom: 2,
    },
    focusedContainer: {
      backgroundColor: 'transparent',
    },
    label: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.1,
      color: muted,
      lineHeight: 12,
    },
    labelFocused: {
      color: active,
      fontWeight: '700',
    },
  });
}

export default function TabBarIcon({ outline, filled, focused, label }) {
  const { colors } = useTheme();
  const muted = colors.textTertiary;
  const active = colors.primary;
  const styles = useMemo(() => createStyles(colors, muted, active), [colors, muted, active]);
  const name = focused ? filled : outline;
  const iconColor = focused ? active : muted;

  return (
    <View style={[styles.container, focused && styles.focusedContainer]}>
      <Ionicons name={name} size={22} color={iconColor} />
      <Text style={[styles.label, focused && styles.labelFocused]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
