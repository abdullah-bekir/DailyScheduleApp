import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

function createStyles(colors, muted, active) {
  return StyleSheet.create({
    container: {
      minWidth: 58,
      minHeight: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: 4,
      paddingTop: 3,
      paddingBottom: 4,
    },
    focusedContainer: {
      backgroundColor: 'transparent',
    },
    label: {
      fontSize: 9,
      fontWeight: '600',
      letterSpacing: 0.1,
      color: muted,
      lineHeight: 11,
    },
    labelFocused: {
      color: active,
      fontWeight: '700',
    },
    activeIndicator: {
      marginTop: 2,
      width: 22,
      height: 2,
      borderRadius: 999,
      backgroundColor: active,
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
      <Ionicons name={name} size={20} color={iconColor} />
      <Text style={[styles.label, focused && styles.labelFocused]} numberOfLines={1}>
        {label}
      </Text>
      {focused ? <View style={styles.activeIndicator} /> : null}
    </View>
  );
}
