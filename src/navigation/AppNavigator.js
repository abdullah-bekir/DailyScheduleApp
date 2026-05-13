import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TabBarIcon from '../components/common/TabBarIcon';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import TaskListScreen from '../screens/TaskListScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarScreenOptions = useMemo(() => {
    const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8);
    const row = 52;
    return {
      headerShown: false,
      tabBarShowLabel: false,
      tabBarHideOnKeyboard: true,
      tabBarStyle: {
        borderTopWidth: 0,
        borderTopColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 0,
        shadowColor: 'transparent',
        backgroundColor: colors.surface,
        paddingTop: 10,
        paddingBottom: bottomInset,
        paddingHorizontal: 2,
        height: row + 10 + bottomInset,
      },
    };
  }, [colors.surface, insets.bottom]);

  return (
    <Tab.Navigator screenOptions={tabBarScreenOptions}>
      <Tab.Screen
        name="AnaSayfa"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              outline="home-outline"
              filled="home"
              focused={focused}
              label="Ana sayfa"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Gorevler"
        component={TaskListScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              outline="checkbox-outline"
              filled="checkbox"
              focused={focused}
              label="Görevler"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Istatistikler"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              outline="stats-chart-outline"
              filled="stats-chart"
              focused={focused}
              label="İstatistikler"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Ayarlar"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              outline="settings-outline"
              filled="settings"
              focused={focused}
              label="Ayarlar"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isDark, colors } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
        primary: colors.primary,
      },
    };
  }, [isDark, colors]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack />
    </NavigationContainer>
  );
}
