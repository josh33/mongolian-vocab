import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import PracticeScreen from "@/screens/PracticeScreen";
import CompletionScreen from "@/screens/CompletionScreen";
import EditWordScreen from "@/screens/EditWordScreen";
import DictionaryUpdatesScreen from "@/screens/DictionaryUpdatesScreen";
import StreakScreen from "@/screens/StreakScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useLocalization } from "@/hooks/useLocalization";
import { PracticeMode } from "@/context/AppContext";
import { Word } from "@/data/dictionary";

export type RootStackParamList = {
  Main: undefined;
  Practice: { mode: PracticeMode; isExtra: boolean };
  Completion: { mode: PracticeMode; isExtra: boolean };
  EditWord: { word?: Word; isNew: boolean; fromStudy?: boolean; isExtra?: boolean };
  DictionaryUpdates: undefined;
  Streak: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { t } = useLocalization();

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
      <Stack.Screen
        name="EditWord"
        component={EditWordScreen}
        options={({ route }) => ({
          headerTitle: route.params.isNew ? t("navigation.addWord") : t("navigation.editWord"),
        })}
      />
      <Stack.Screen
        name="DictionaryUpdates"
        component={DictionaryUpdatesScreen}
        options={{
          headerTitle: t("navigation.dictionaryUpdates"),
        }}
      />
      <Stack.Screen
        name="Streak"
        component={StreakScreen}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
