import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      minWidth: 36,
      minHeight: 32,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    focusedContainer: {
      backgroundColor: colors.primaryLight,
    },
  });
}

export default function TabBarIcon({ outline, filled, focused }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const name = focused ? filled : outline;

  return (
    <View style={[styles.container, focused && styles.focusedContainer]}>
      <Ionicons name={name} size={23} color={focused ? colors.primary : colors.textTertiary} />
    </View>
  );
}
