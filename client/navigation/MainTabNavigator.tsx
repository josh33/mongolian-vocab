import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import TodayScreen from "@/screens/TodayScreen";
import DictionaryScreen from "@/screens/DictionaryScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useLocalization } from "@/hooks/useLocalization";
import { StreakBadge } from "@/components/StreakBadge";
import { useApp } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export type MainTabParamList = {
  TodayTab: undefined;
  DictionaryTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function StreakHeaderButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { streakData } = useApp();

  return (
    <StreakBadge
      count={streakData.currentStreak}
      onPress={() => navigation.navigate("Streak")}
      size="medium"
    />
  );
}

export default function MainTabNavigator() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const screenOptions = useScreenOptions();
  const { t } = useLocalization();

  return (
    <Tab.Navigator
      initialRouteName="TodayTab"
      screenOptions={{
        ...screenOptions,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: colors.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tab.Screen
        name="TodayTab"
        component={TodayScreen}
        options={{
          title: t("navigation.today"),
          headerTitle: () => <HeaderTitle title={t("navigation.appTitle")} />,
          headerRight: () => <StreakHeaderButton />,
          headerRightContainerStyle: { paddingRight: Spacing.lg },
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DictionaryTab"
        component={DictionaryScreen}
        options={{
          title: t("navigation.dictionary"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: t("navigation.settings"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
