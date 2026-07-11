import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * v7 mağaza ikonu ile uyumlu mini P monogram (beyaz + koyu gri).
 */
export default function AppBrandMark({ size = 40 }) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: size,
          height: size,
          borderRadius: size * 0.22,
          backgroundColor: '#525358',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        letter: {
          color: '#FFFFFF',
          fontSize: size * 0.52,
          fontWeight: '800',
          lineHeight: size * 0.56,
          marginTop: -size * 0.02,
          letterSpacing: -0.5,
        },
      }),
    [size],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.letter}>P</Text>
    </View>
  );
}
