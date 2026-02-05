import React, { useState, useCallback } from "react";
import { StyleSheet, View, Switch, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemeSegmentedControl } from "@/components/ThemeSegmentedControl";
import { useTheme } from "@/hooks/useTheme";
import { useLocalization } from "@/hooks/useLocalization";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { resetTodayProgress, getOTAUpdatesEnabled, setOTAUpdatesEnabled } from "@/lib/storage";
import { formatWordCount } from "@/lib/i18n";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { themePreference, setThemePreference, refreshStreakData, mongolModeEnabled, setMongolModeEnabled } = useApp();
  const { t, locale } = useLocalization();
  const [otaUpdatesEnabled, setOtaUpdatesEnabledState] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const otaEnabled = await getOTAUpdatesEnabled();
          setOtaUpdatesEnabledState(otaEnabled);
        } catch (error) {
          console.error("Failed to load settings:", error);
        }
      };

      loadSettings();
    }, [])
  );

  const themeOptions = [t("settings.light"), t("settings.dark"), t("settings.system")];
  const selectedThemeIndex = themePreference === "light" ? 0 : themePreference === "dark" ? 1 : 2;

  const handleThemeChange = async (index: number) => {
    Haptics.selectionAsync();
    const newTheme = index === 0 ? "light" : index === 1 ? "dark" : "system";
    await setThemePreference(newTheme);
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

  const handleMongolModeToggle = async (value: boolean) => {
    Haptics.selectionAsync();
    await setMongolModeEnabled(value);
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
        {t("settings.appearance")}
      </ThemedText>

      <View style={[styles.settingsCard, { backgroundColor: colors.backgroundDefault }]}>
        <View style={styles.themeSettingRow}>
          <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
            {t("settings.theme")}
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

        <View style={[styles.divider, { backgroundColor: colors.backgroundSecondary }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingLabelColumn}>
            <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
              {t("settings.mongolMode")}
            </ThemedText>
            <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {t("settings.mongolModeDescription")}
            </ThemedText>
          </View>
          <Switch
            value={mongolModeEnabled}
            onValueChange={handleMongolModeToggle}
            trackColor={{ false: colors.primary + "40", true: colors.primary }}
            thumbColor="#FFFFFF"
            testID="mongol-mode-toggle"
          />
        </View>
      </View>

      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: Spacing["2xl"] }]}>
        {t("settings.dictionary")}
      </ThemedText>

      <View style={[styles.settingsCard, { backgroundColor: colors.backgroundDefault }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLabelColumn}>
            <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
              {t("settings.autoDownload")}
            </ThemedText>
            <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {t("settings.autoDownloadDescription")}
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
        {t("settings.debug")}
      </ThemedText>

      <View style={[styles.settingsCard, { backgroundColor: colors.backgroundDefault }]}>
        <Pressable
          style={styles.settingRow}
          onPress={handleResetToday}
          testID="reset-today-button"
        >
          <ThemedText style={[styles.settingLabel, { color: colors.patternAccent }]}>
            {t("settings.resetToday")}
          </ThemedText>
          <Feather name="refresh-cw" size={20} color={colors.patternAccent} />
        </Pressable>
      </View>

      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: Spacing["2xl"] }]}>
        {t("settings.about")}
      </ThemedText>

      <View style={[styles.settingsCard, { backgroundColor: colors.backgroundDefault }]}>
        <View style={styles.settingRow}>
          <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
            {t("settings.version")}
          </ThemedText>
          <ThemedText style={[styles.settingValue, { color: colors.textSecondary }]}>
            {appVersion}
          </ThemedText>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.backgroundSecondary }]} />

        <View style={styles.settingRow}>
          <ThemedText style={[styles.settingLabel, { color: colors.text }]}>
            {t("settings.dictionarySize")}
          </ThemedText>
          <ThemedText style={[styles.settingValue, { color: colors.textSecondary }]}>
            {formatWordCount(locale, 600)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
          {t("settings.footerTitle")}
        </ThemedText>
        <ThemedText style={[styles.footerSubtext, { color: colors.textSecondary }]}>
          {t("settings.footerSubtext")}
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
  settingLabelColumn: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
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
