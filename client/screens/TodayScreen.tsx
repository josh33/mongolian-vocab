import React, { useCallback } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { PracticeModeCard } from "@/components/PracticeModeCard";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useTheme } from "@/hooks/useTheme";
import { useLocalization } from "@/hooks/useLocalization";
import { Colors, Spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { formatWordCount, getDateLocale, getModeLabel, getModeSubtitle } from "@/lib/i18n";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation = useNavigation<NavigationProp>();
  const { t, locale } = useLocalization();

  const {
    dailyWords,
    dailyProgress,
    extraSession,
    hasExtraSession,
    getProgressForMode,
    isModeCompleted,
    isBothModesCompleted,
    requestNewWords,
    refreshProgress,
  } = useApp();

  useFocusEffect(
    useCallback(() => {
      refreshProgress();
    }, [refreshProgress])
  );

  const today = new Date();
  const dateString = today.toLocaleDateString(getDateLocale(locale), {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleStartPractice = (mode: "englishToMongolian" | "mongolianToEnglish", isExtra = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Practice", { mode, isExtra });
  };

  const handleRequestNewWords = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await requestNewWords();
  };

  const dailyBothCompleted = isBothModesCompleted(false);
  const extraBothCompleted = hasExtraSession && isBothModesCompleted(true);
  const getProgressCount = (mode: "englishToMongolian" | "mongolianToEnglish", isExtra: boolean) =>
    getProgressForMode(mode, isExtra).length;
  const isModeDone = (
    mode: "englishToMongolian" | "mongolianToEnglish",
    isExtra: boolean,
    total: number
  ) => isModeCompleted(mode, isExtra) || getProgressCount(mode, isExtra) >= total;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
        {dateString}
      </ThemedText>

      {dailyBothCompleted ? (
        <View style={styles.celebrationContainer}>
          <Image
            source={require("../../assets/images/both-complete.png")}
            style={styles.celebrationImage}
            resizeMode="contain"
          />
          <ThemedText style={[styles.celebrationTitle, { color: colors.text }]}>
            {t("today.allDoneTitle")}
          </ThemedText>
          <ThemedText style={[styles.celebrationSubtitle, { color: colors.textSecondary }]}>
            {t("today.allDoneSubtitle")}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          {t("today.todaysWords")}
        </ThemedText>
        <ThemedText style={[styles.wordCount, { color: colors.textSecondary }]}>
          {formatWordCount(locale, dailyWords.length)}
        </ThemedText>
      </View>

      <View style={styles.cardsContainer}>
        <PracticeModeCard
          title={getModeLabel(locale, "englishToMongolian")}
          subtitle={getModeSubtitle(locale, "englishToMongolian")}
          progress={getProgressCount("englishToMongolian", false)}
          total={dailyWords.length}
          isCompleted={isModeDone("englishToMongolian", false, dailyWords.length)}
          onPress={() => handleStartPractice("englishToMongolian", false)}
          testID="button-english-to-mongolian"
        />

        <PracticeModeCard
          title={getModeLabel(locale, "mongolianToEnglish")}
          subtitle={getModeSubtitle(locale, "mongolianToEnglish")}
          progress={getProgressCount("mongolianToEnglish", false)}
          total={dailyWords.length}
          isCompleted={isModeDone("mongolianToEnglish", false, dailyWords.length)}
          onPress={() => handleStartPractice("mongolianToEnglish", false)}
          testID="button-mongolian-to-english"
        />
      </View>

      {hasExtraSession && extraSession ? (
        <>
          <View style={[styles.sectionHeader, { marginTop: Spacing["2xl"] }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              {t("today.extraPractice")}
            </ThemedText>
            <ThemedText style={[styles.wordCount, { color: colors.textSecondary }]}>
              {formatWordCount(locale, extraSession.words.length)}
            </ThemedText>
          </View>

          {extraBothCompleted ? (
            <View style={styles.miniCelebration}>
              <ThemedText style={[styles.miniCelebrationText, { color: colors.success }]}>
                {t("today.extraPracticeComplete")}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.cardsContainer}>
            <PracticeModeCard
              title={getModeLabel(locale, "englishToMongolian")}
              subtitle={t("today.extraWordsPractice")}
              progress={getProgressCount("englishToMongolian", true)}
              total={extraSession.words.length}
              isCompleted={isModeDone("englishToMongolian", true, extraSession.words.length)}
              onPress={() => handleStartPractice("englishToMongolian", true)}
              testID="button-extra-english-to-mongolian"
            />

            <PracticeModeCard
              title={getModeLabel(locale, "mongolianToEnglish")}
              subtitle={t("today.extraWordsPractice")}
              progress={getProgressCount("mongolianToEnglish", true)}
              total={extraSession.words.length}
              isCompleted={isModeDone("mongolianToEnglish", true, extraSession.words.length)}
              onPress={() => handleStartPractice("mongolianToEnglish", true)}
              testID="button-extra-mongolian-to-english"
            />
          </View>
        </>
      ) : null}

      <View style={styles.newWordsSection}>
        <SecondaryButton onPress={handleRequestNewWords}>
          {t("today.getNewWords")}
        </SecondaryButton>
        <ThemedText style={[styles.newWordsHint, { color: colors.textSecondary }]}>
          {t("today.newWordsHint")}
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  celebrationContainer: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    marginBottom: Spacing.xl,
  },
  celebrationImage: {
    width: 140,
    height: 140,
    marginBottom: Spacing.lg,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  celebrationSubtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  wordCount: {
    fontSize: 14,
  },
  cardsContainer: {
    gap: Spacing.md,
  },
  miniCelebration: {
    marginBottom: Spacing.md,
  },
  miniCelebrationText: {
    fontSize: 14,
    fontWeight: "600",
  },
  newWordsSection: {
    marginTop: Spacing["3xl"],
    gap: Spacing.sm,
  },
  newWordsHint: {
    fontSize: 13,
    textAlign: "center",
  },
});
