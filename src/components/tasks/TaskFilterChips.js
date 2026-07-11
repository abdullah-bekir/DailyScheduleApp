import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../context/ThemeContext';

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

export default function TaskFilterChips({ value, onChange, options, compact = false }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, compact), [colors, compact]);
  const defaultOptions = useMemo(
    () => [
      { id: 'all', label: t('filter.all') },
      { id: 'active', label: t('filter.pending') },
      { id: 'done', label: t('filter.completed') },
    ],
    [t],
  );
  const resolvedOptions = options ?? defaultOptions;

  return (
    <View style={styles.row}>
      {resolvedOptions.map((opt) => {
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
