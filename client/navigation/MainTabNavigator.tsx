import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";

import TodayScreen from "@/screens/TodayScreen";
import DictionaryScreen from "@/screens/DictionaryScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/theme";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type MainTabParamList = {
  TodayTab: undefined;
  DictionaryTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const screenOptions = useScreenOptions();

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
          title: "Today",
          headerTitle: () => <HeaderTitle title="Mongolian Vocab" />,
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DictionaryTab"
        component={DictionaryScreen}
        options={{
          title: "Dictionary",
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
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
