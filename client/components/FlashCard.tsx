import React, { useEffect } from "react";
import { StyleSheet, Pressable, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { ConfidenceButtons } from "@/components/ConfidenceButtons";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Word } from "@/data/dictionary";
import { PracticeMode } from "@/context/AppContext";
import { ConfidenceLevel } from "@/lib/storage";

interface FlashCardProps {
  word: Word;
  mode: PracticeMode;
  isFlipped: boolean;
  onFlip: () => void;
  confidenceLevel: ConfidenceLevel | null;
  onConfidenceChange: (level: ConfidenceLevel) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const CARD_HEIGHT = 340;

export function FlashCard({ 
  word, 
  mode, 
  isFlipped, 
  onFlip, 
  confidenceLevel, 
  onConfidenceChange 
}: FlashCardProps) {
  const { theme, isDark } = useTheme();
  const rotation = useSharedValue(isFlipped ? 180 : 0);

  useEffect(() => {
    rotation.value = withTiming(isFlipped ? 180 : 0, { duration: 400 });
  }, [isFlipped]);

  const handlePress = () => {
    if (!isFlipped) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onFlip();
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [0, 180],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden" as const,
      opacity: interpolate(rotation.value, [0, 90, 180], [1, 0, 0]),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [180, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden" as const,
      opacity: interpolate(rotation.value, [0, 90, 180], [0, 0, 1]),
    };
  });

  const frontWord = mode === "englishToMongolian" ? word.english : word.mongolian;
  const frontLabel = mode === "englishToMongolian" ? "English" : "Mongolian";
  const backWord = mode === "englishToMongolian" ? word.mongolian : word.english;
  const backLabel = mode === "englishToMongolian" ? "Mongolian" : "English";
  const pronunciation = null;

  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Pressable onPress={handlePress} style={styles.container} testID="flashcard-pressable">
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          { backgroundColor: colors.backgroundDefault },
          frontAnimatedStyle,
        ]}
      >
        <View style={styles.topRow}>
          <View style={[styles.labelBadge, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.labelText}>{frontLabel}</ThemedText>
          </View>
          <View style={styles.confidenceContainer}>
            <ConfidenceIndicator level={confidenceLevel} />
          </View>
        </View>
        <View style={styles.wordContainer}>
          <ThemedText style={[styles.wordText, { color: colors.text }]}>
            {frontWord}
          </ThemedText>
        </View>
        <ThemedText style={[styles.tapHint, { color: colors.textSecondary }]}>
          Tap to reveal
        </ThemedText>
      </Animated.View>

      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          { backgroundColor: colors.cardBack },
          backAnimatedStyle,
        ]}
      >
        <View style={styles.patternOverlay}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.patternLine,
                {
                  backgroundColor: colors.patternAccent,
                  top: i * 40,
                  transform: [{ rotate: "45deg" }],
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.backTopRow}>
          <View style={[styles.labelBadge, { backgroundColor: colors.secondary }]}>
            <ThemedText style={[styles.labelText, { color: colors.primary }]}>
              {backLabel}
            </ThemedText>
          </View>
        </View>
        <View style={styles.wordContainer}>
          <ThemedText style={[styles.wordText, { color: colors.text }]}>
            {backWord}
          </ThemedText>
          {pronunciation ? (
            <ThemedText style={[styles.pronunciationText, { color: colors.textSecondary }]}>
              ({pronunciation})
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.confidenceButtonsContainer}>
          <ConfidenceButtons
            currentLevel={confidenceLevel}
            onSelect={onConfidenceChange}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: "center",
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  cardFront: {},
  cardBack: {},
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    overflow: "hidden",
  },
  patternLine: {
    position: "absolute",
    left: -100,
    width: 500,
    height: 2,
  },
  topRow: {
    position: "absolute",
    top: Spacing.xl,
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confidenceContainer: {
    alignItems: "flex-end",
  },
  backTopRow: {
    position: "absolute",
    top: Spacing.xl,
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  labelBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  confidenceButtonsContainer: {
    position: "absolute",
    bottom: Spacing.xl,
    left: Spacing.md,
    right: Spacing.md,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  wordContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  wordText: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 36,
  },
  pronunciationText: {
    fontSize: 18,
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  tapHint: {
    position: "absolute",
    bottom: Spacing.xl,
    fontSize: 14,
  },
});
