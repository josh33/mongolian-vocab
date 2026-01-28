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
import { Colors, Spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation = useNavigation<NavigationProp>();

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
  const dateString = today.toLocaleDateString("en-US", {
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
            All Done for Today!
          </ThemedText>
          <ThemedText style={[styles.celebrationSubtitle, { color: colors.textSecondary }]}>
            You've completed both practice modes. Great work!
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Today's Words
        </ThemedText>
        <ThemedText style={[styles.wordCount, { color: colors.textSecondary }]}>
          {dailyWords.length} words
        </ThemedText>
      </View>

      <View style={styles.cardsContainer}>
        <PracticeModeCard
          title="English → Mongolian"
          subtitle="See English, guess Mongolian"
          progress={getProgressForMode("englishToMongolian", false).length}
          total={dailyWords.length}
          isCompleted={isModeCompleted("englishToMongolian", false)}
          onPress={() => handleStartPractice("englishToMongolian", false)}
          testID="button-english-to-mongolian"
        />

        <PracticeModeCard
          title="Mongolian → English"
          subtitle="See Mongolian, guess English"
          progress={getProgressForMode("mongolianToEnglish", false).length}
          total={dailyWords.length}
          isCompleted={isModeCompleted("mongolianToEnglish", false)}
          onPress={() => handleStartPractice("mongolianToEnglish", false)}
          testID="button-mongolian-to-english"
        />
      </View>

      {hasExtraSession && extraSession ? (
        <>
          <View style={[styles.sectionHeader, { marginTop: Spacing["2xl"] }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Extra Practice
            </ThemedText>
            <ThemedText style={[styles.wordCount, { color: colors.textSecondary }]}>
              {extraSession.words.length} words
            </ThemedText>
          </View>

          {extraBothCompleted ? (
            <View style={styles.miniCelebration}>
              <ThemedText style={[styles.miniCelebrationText, { color: colors.success }]}>
                Extra practice complete!
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.cardsContainer}>
            <PracticeModeCard
              title="English → Mongolian"
              subtitle="Extra words practice"
              progress={getProgressForMode("englishToMongolian", true).length}
              total={extraSession.words.length}
              isCompleted={isModeCompleted("englishToMongolian", true)}
              onPress={() => handleStartPractice("englishToMongolian", true)}
              testID="button-extra-english-to-mongolian"
            />

            <PracticeModeCard
              title="Mongolian → English"
              subtitle="Extra words practice"
              progress={getProgressForMode("mongolianToEnglish", true).length}
              total={extraSession.words.length}
              isCompleted={isModeCompleted("mongolianToEnglish", true)}
              onPress={() => handleStartPractice("mongolianToEnglish", true)}
              testID="button-extra-mongolian-to-english"
            />
          </View>
        </>
      ) : null}

      <View style={styles.newWordsSection}>
        <SecondaryButton onPress={handleRequestNewWords}>
          Get 5 New Words
        </SecondaryButton>
        <ThemedText style={[styles.newWordsHint, { color: colors.textSecondary }]}>
          Practice more than your daily 5 words
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
