import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { FlashCard } from "@/components/FlashCard";
import { ProgressDots } from "@/components/ProgressDots";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, Shadows } from "@/constants/theme";
import { useApp, PracticeMode } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Word } from "@/data/dictionary";
import { 
  ConfidenceLevel, 
  WordConfidence, 
  getWordConfidence, 
  updateWordConfidenceLevel 
} from "@/lib/storage";

type PracticeRouteProp = RouteProp<RootStackParamList, "Practice">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PracticeRouteProp>();
  const { mode, isExtra } = route.params;
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const {
    getWordsForMode,
    markModeCompleted,
  } = useApp();

  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [wordConfidence, setWordConfidence] = useState<WordConfidence>({});

  useEffect(() => {
    const wordsForMode = getWordsForMode(mode, isExtra);
    setWords(wordsForMode);
    setCurrentIndex(0);
    setCompletedIndices([]);
    
    getWordConfidence().then(setWordConfidence);
  }, [mode, isExtra, getWordsForMode]);

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleNext = useCallback(async () => {
    if (!isFlipped) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Mark current position as completed
    setCompletedIndices((prev) => 
      prev.includes(currentIndex) ? prev : [...prev, currentIndex]
    );

    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      await markModeCompleted(mode, isExtra);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace("Completion", { mode, isExtra });
    }
  }, [
    isFlipped,
    currentIndex,
    words.length,
    markModeCompleted,
    mode,
    isExtra,
    navigation,
  ]);

  const currentWord = words[currentIndex];
  const modeTitle =
    mode === "englishToMongolian"
      ? "English → Mongolian"
      : "Mongolian → English";

  const isLastCard = currentIndex >= words.length - 1;
  const buttonText = isLastCard ? "Finish" : "Next";
  
  const currentConfidence = currentWord 
    ? wordConfidence[currentWord.id] || null 
    : null;

  const handleConfidenceChange = useCallback(async (level: ConfidenceLevel) => {
    if (!currentWord) return;
    const updated = await updateWordConfidenceLevel(currentWord.id, level);
    setWordConfidence(updated);
  }, [currentWord]);

  if (!currentWord) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          hitSlop={16}
        >
          <ThemedText style={[styles.closeText, { color: colors.text }]}>
            Close
          </ThemedText>
        </Pressable>
        <ThemedText style={[styles.modeTitle, { color: colors.text }]}>
          {modeTitle}
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ProgressDots
        total={words.length}
        completed={completedIndices}
        currentIndex={currentIndex}
      />

      <View style={styles.cardContainer}>
        <FlashCard
          key={`${currentWord.id}-${currentIndex}`}
          word={currentWord}
          mode={mode}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          confidenceLevel={currentConfidence}
          onConfidenceChange={handleConfidenceChange}
        />
      </View>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Button
          onPress={handleNext}
          disabled={!isFlipped}
          testID={isLastCard ? "button-finish" : "button-next"}
          style={[
            styles.nextButton,
            {
              backgroundColor: isFlipped ? colors.primary : colors.backgroundSecondary,
              ...Shadows.button,
              shadowColor: colors.primary,
            },
          ]}
        >
          {buttonText}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modeTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  placeholder: {
    width: 50,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  bottomContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  nextButton: {
    borderRadius: 12,
  },
});
