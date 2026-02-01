import React, { useState, useCallback } from "react";
import { StyleSheet, View, Switch, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemeSegmentedControl } from "@/components/ThemeSegmentedControl";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { bundledWordBundles } from "@/data/bundles";
import { getBundleAppliedMap, getBundleDismissedMap, resetTodayProgress, getOTAUpdatesEnabled, setOTAUpdatesEnabled } from "@/lib/storage";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { themePreference, setThemePreference, refreshStreakData } = useApp();
  const [pendingBundleCount, setPendingBundleCount] = useState(0);
  const [otaUpdatesEnabled, setOtaUpdatesEnabledState] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkPendingBundles = async () => {
        try {
          const [appliedMap, dismissedMap, otaEnabled] = await Promise.all([
            getBundleAppliedMap(),
            getBundleDismissedMap(),
            getOTAUpdatesEnabled(),
          ]);
          const pending = bundledWordBundles.filter(
            (b) => !appliedMap[b.bundleId] && !dismissedMap[b.bundleId]
          );
          setPendingBundleCount(pending.length);
          setOtaUpdatesEnabledState(otaEnabled);
        } catch (error) {
          console.error("Failed to check pending bundles:", error);
        }
      };
      checkPendingBundles();
    }, [])
  );

  const themeOptions = ["Light", "Dark", "System"];
  const selectedThemeIndex = themePreference === "light" ? 0 : themePreference === "dark" ? 1 : 2;

  const handleThemeChange = async (index: number) => {
    Haptics.selectionAsync();
    const newTheme = index === 0 ? "light" : index === 1 ? "dark" : "system";
    await setThemePreference(newTheme);
  };

  const handleDictionaryUpdates = () => {
    Haptics.selectionAsync();
    navigation.navigate("DictionaryUpdates");
  };

  const handleResetToday = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await resetTodayProgress();
    await refreshStreakData();
  };

  const handleOTAToggle = async (value: boolean) => {
    Haptics.selectionAsync();
    setOtaUpdatesEnabledState(value);
    await setOTAUpdatesEnabled(value);
  };

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing["4xl"],
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        Appearance
      </ThemedText>

      <View style={[styles.settingsCard, { backgroundColor: colors.backgroundDefault }]}>
        <View style={styles.themeSettingRow}>
          <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
            Theme
          </ThemedText>
          <ThemeSegmentedControl
            values={themeOptions}
            selectedIndex={selectedThemeIndex}
            onValueChange={handleThemeChange}
            tintColor={colors.primary}
            textColor={colors.text}
            activeTextColor="#FFFFFF"
            backgroundColor={colors.backgroundSecondary}
            testID="theme-segmented-control"
          />
        </View>
      </View>

      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: Spacing["2xl"] }]}>
        Dictionary
      </ThemedText>

      <View style={[styles.settingsCard, { backgroundColor: colors.backgroundDefault }]}>
        <Pressable
          style={styles.settingRow}
          onPress={handleDictionaryUpdates}
          testID="dictionary-updates-button"
        >
          <View style={styles.settingLabelWithBadge}>
            <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
              Dictionary Updates
            </ThemedText>
            {pendingBundleCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.badgeText}>{pendingBundleCount}</ThemedText>
              </View>
            ) : null}
          </View>
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        </Pressable>

        <View style={[styles.divider, { backgroundColor: colors.backgroundSecondary }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingLabelColumn}>
            <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
              Auto-download New Packs
            </ThemedText>
            <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Check for new word packs when online
            </ThemedText>
          </View>
          <Switch
            value={otaUpdatesEnabled}
            onValueChange={handleOTAToggle}
            trackColor={{ false: colors.primary + "40", true: colors.primary }}
            thumbColor="#FFFFFF"
            testID="ota-updates-toggle"
          />
        </View>
      </View>

      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: Spacing["2xl"] }]}>
        Debug
      </ThemedText>

      <View style={[styles.settingsCard, { backgroundColor: colors.backgroundDefault }]}>
        <Pressable
          style={styles.settingRow}
          onPress={handleResetToday}
          testID="reset-today-button"
        >
          <ThemedText style={[styles.settingLabel, { color: colors.patternAccent }]}>
            Reset Today's Progress
          </ThemedText>
          <Feather name="refresh-cw" size={20} color={colors.patternAccent} />
        </Pressable>
      </View>

      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: Spacing["2xl"] }]}>
        About
      </ThemedText>

      <View style={[styles.settingsCard, { backgroundColor: colors.backgroundDefault }]}>
        <View style={styles.settingRow}>
          <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
            Version
          </ThemedText>
          <ThemedText style={[styles.settingValue, { color: colors.textSecondary }]}>
            {appVersion}
          </ThemedText>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.backgroundSecondary }]} />

        <View style={styles.settingRow}>
          <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
            Dictionary Size
          </ThemedText>
          <ThemedText style={[styles.settingValue, { color: colors.textSecondary }]}>
            600 words
          </ThemedText>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
          Learn 5 new Mongolian words every day
        </ThemedText>
        <ThemedText style={[styles.footerSubtext, { color: colors.textSecondary }]}>
          All data stored locally on your device
        </ThemedText>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  settingsCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  themeSettingRow: {
    flexDirection: "column",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  segmentedControl: {
    width: "100%",
  },
  settingLabel: {
    fontSize: 16,
  },
  settingLabelWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  settingLabelColumn: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  settingValue: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.lg,
  },
  footer: {
    marginTop: Spacing["4xl"],
    alignItems: "center",
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
  },
  footerSubtext: {
    fontSize: 12,
    textAlign: "center",
  },
});
