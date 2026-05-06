import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

function createStyles(colors) {
  return StyleSheet.create({
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: -0.1,
      textDecorationLine: 'underline',
      textDecorationColor: colors.primary,
    },
    pressed: {
      opacity: 0.72,
    },
  });
}

export default function TextLink({ title, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable onPress={onPress} hitSlop={10} style={({ pressed }) => pressed && styles.pressed}>
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}
