import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';

function createStyles(colors) {
  return StyleSheet.create({
    strip: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 22,
      paddingBottom: 30,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    eyebrow: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 2.2,
      color: colors.primary,
      opacity: 0.92,
      marginBottom: 10,
      textTransform: 'uppercase',
    },
    title: {
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -1.2,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textSecondary,
      lineHeight: 23,
      letterSpacing: -0.1,
    },
  });
}

export default function ScreenHero({ eyebrow, title, subtitle, titleSize = 32 }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const showEyebrow = Boolean(eyebrow && String(eyebrow).trim());

  return (
    <View style={[styles.strip, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
      {showEyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={[styles.title, { fontSize: titleSize }, !showEyebrow && { marginTop: 2 }]}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
