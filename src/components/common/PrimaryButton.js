import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

function createStyles(colors, mutedCta) {
  const fill = mutedCta && colors.ctaMuted ? colors.ctaMuted : colors.primary;
  const onFill = mutedCta && colors.onCtaMuted ? colors.onCtaMuted : colors.onPrimary;
  const outlineBorder = mutedCta && colors.ctaMuted ? colors.ctaMuted : colors.borderStrong;
  const outlineLabel = mutedCta && colors.ctaMuted ? colors.ctaMuted : colors.textPrimary;

  return StyleSheet.create({
    button: {
      borderRadius: 18,
      paddingVertical: 15,
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPrimary: {
      backgroundColor: fill,
    },
    buttonOutline: {
      backgroundColor: colors.surfaceSubtle,
      borderWidth: 1,
      borderColor: outlineBorder,
    },
    pressed: {
      opacity: 0.88,
      transform: [{ scale: 0.995 }],
    },
    title: {
      color: onFill,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.2,
    },
    titleOutline: {
      color: outlineLabel,
    },
  });
}

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  /** Açık temada header ile aynı gri dolgu / çerçeve; koyu temada etkisiz (normal primary/outline) */
  mutedCta = false,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, mutedCta), [colors, mutedCta]);
  const outline = variant === 'outline';

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        outline ? styles.buttonOutline : styles.buttonPrimary,
        pressed && !disabled && styles.pressed,
        disabled && { opacity: 0.55 },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.title, outline && styles.titleOutline]}>{title}</Text>
    </Pressable>
  );
}
