import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import PracticeScreen from "@/screens/PracticeScreen";
import CompletionScreen from "@/screens/CompletionScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { PracticeMode } from "@/context/AppContext";

export type RootStackParamList = {
  Main: undefined;
  Practice: { mode: PracticeMode; isExtra: boolean };
  Completion: { mode: PracticeMode; isExtra: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Completion"
        component={CompletionScreen}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
