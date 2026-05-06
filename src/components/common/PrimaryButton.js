import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

function createStyles(colors) {
  return StyleSheet.create({
    button: {
      borderRadius: 16,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
    },
    buttonOutline: {
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    pressed: {
      opacity: 0.88,
      transform: [{ scale: 0.995 }],
    },
    title: {
      color: colors.onPrimary,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.2,
    },
    titleOutline: {
      color: colors.textPrimary,
    },
  });
}

export default function PrimaryButton({ title, onPress, variant = 'primary' }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const outline = variant === 'outline';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        outline ? styles.buttonOutline : styles.buttonPrimary,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.title, outline && styles.titleOutline]}>{title}</Text>
    </Pressable>
  );
}
