import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarScreenOptions = useMemo(() => {
    const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 10);
    const row = 58;
    return {
      headerShown: false,
      tabBarShowLabel: false,
      tabBarHideOnKeyboard: false,
      tabBarStyle: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopWidth: 0,
        borderTopColor: 'transparent',
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 0,
        shadowColor: 'transparent',
        backgroundColor: colors.surface,
        paddingTop: 12,
        paddingBottom: bottomInset,
        paddingHorizontal: 4,
        height: row + 12 + bottomInset,
      },
      sceneContainerStyle: {
        backgroundColor: colors.background,
      },
    };
  }, [colors.surface, colors.background, insets.bottom]);

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
              label={t('tabs.home')}
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
              label={t('tabs.tasks')}
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
              label={t('tabs.stats')}
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
              label={t('tabs.settings')}
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
