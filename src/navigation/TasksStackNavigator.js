/**
 * Görevler sekmesi: liste → görev detayı.
 * Şema / örnek SQL: supabase/schema.sql, src/constants/tasksContextOperationsSql.js
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: '700',
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
        options={{
          headerShown: true,
          title: 'Görev detayı',
          headerBackTitle: 'Görevler',
        }}
      />
    </Stack.Navigator>
  );
}
