import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';

function createStyles(colors, isRtl) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      direction: isRtl ? 'rtl' : 'ltr',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingBottom: 6,
      gap: 2,
    },
    btn: {
      flexDirection: 'row',
      direction: isRtl ? 'rtl' : 'ltr',
      alignItems: 'center',
      paddingVertical: 8,
      paddingRight: 10,
      paddingLeft: 4,
      gap: 2,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
  });
}

export default function ScreenBackBar({ onPress, label = 'Geri' }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isRtl } = useLocale();
  const styles = useMemo(() => createStyles(colors, isRtl), [colors, isRtl]);

  return (
    <View style={[styles.row, { paddingTop: Math.max(insets.top, 8) }]}>
      <Pressable
        style={styles.btn}
        onPress={onPress}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons name={isRtl ? 'chevron-forward' : 'chevron-back'} size={24} color={colors.primary} />
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </View>
  );
}
