import React from "react";
import { StyleSheet, View, Switch, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { themePreference, setThemePreference } = useApp();

  const handleThemeToggle = async (value: boolean) => {
    Haptics.selectionAsync();
    await setThemePreference(value ? "dark" : "light");
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
        <View style={styles.settingRow}>
          <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
            Dark Mode
          </ThemedText>
          <Switch
            value={themePreference === "dark" || (themePreference === "system" && isDark)}
            onValueChange={handleThemeToggle}
            trackColor={{ false: colors.backgroundSecondary, true: colors.secondary }}
            thumbColor="#FFFFFF"
          />
        </View>
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
  settingLabel: {
    fontSize: 16,
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
