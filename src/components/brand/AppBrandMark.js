import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

/**
 * v8 mağaza ikonu ile uyumlu P + onay işareti monogramı.
 */
export default function AppBrandMark({ size = 40 }) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          width: size,
          height: size,
        },
        image: {
          width: size,
          height: size,
          borderRadius: size * 0.22,
        },
      }),
    [size],
  );

  return (
    <View style={styles.wrap}>
      <Image source={require('../../../assets/brand-logo-source.png')} style={styles.image} resizeMode="cover" />
    </View>
  );
}
