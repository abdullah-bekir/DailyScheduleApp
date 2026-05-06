import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function TasksCloudLoadingBanner({ colors, visible }) {
  if (!visible) return null;
  return (
    <View
      style={[styles.wrap, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Görevler sunucudan yükleniyor"
    >
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Görevlerin Supabase ile eşitleniyor; tamamlanınca kayıtlı görevlerin görünür.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
