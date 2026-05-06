import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

const DEFAULT_OPTIONS = [
  { id: 'all', label: 'Tümü' },
  { id: 'active', label: 'Bekleyen' },
  { id: 'done', label: 'Tamamlanan' },
];

function createStyles(colors, compact) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: compact ? 6 : 8,
    },
    chip: {
      paddingVertical: compact ? 6 : 9,
      paddingHorizontal: compact ? 11 : 15,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSubtle,
    },
    chipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    label: {
      fontSize: compact ? 12 : 13,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: -0.1,
    },
    labelSelected: {
      color: colors.primary,
    },
  });
}

export default function TaskFilterChips({ value, onChange, options = DEFAULT_OPTIONS, compact = false }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, compact), [colors, compact]);

  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = opt.id === value;
        return (
          <Pressable
            key={opt.id}
            accessibilityRole="button"
            accessibilityState={{ selected: Boolean(selected) }}
            onPress={() => onChange(opt.id)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
