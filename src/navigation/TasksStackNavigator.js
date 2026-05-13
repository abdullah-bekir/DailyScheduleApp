/**
 * Görevler sekmesi: liste → görev detayı.
 * Şema / örnek SQL: supabase/sql/schema.sql, src/constants/tasksContextOperationsSql.js
 */
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet } from 'react-native';

import TaskDetailScreen from '../screens/TaskDetailScreen';
import TaskListScreen from '../screens/TaskListScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function TasksStackNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.primary,
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: '800',
          fontSize: 18,
          letterSpacing: -0.25,
        },
        headerBackTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Görev detayı',
          // Liste satırındaki sağ ok ile uyum: geri ok solda, başlık hemen yanında (sonda değil).
          headerBackTitleVisible: false,
          headerTitleAlign: 'left',
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              style={{ paddingLeft: 4, paddingVertical: 6, paddingRight: 6 }}
              accessibilityRole="button"
              accessibilityLabel="Görevlere dön"
            >
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </Pressable>
          ),
        })}
      />
    </Stack.Navigator>
  );
}
