import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { FlashCard } from "@/components/FlashCard";
import { ProgressDots } from "@/components/ProgressDots";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLocalization } from "@/hooks/useLocalization";
import { Colors, Spacing } from "@/constants/theme";
import { useApp, PracticeMode } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Word } from "@/data/dictionary";
import { getModeLabel } from "@/lib/i18n";
import { 
  ConfidenceLevel, 
  WordConfidence, 
  getWordConfidence, 
  updateWordConfidenceLevel,
  getUpdatedWord
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
  const { t, locale } = useLocalization();

  const {
    getWordsForMode,
    markCardCompleted,
    markModeCompleted,
  } = useApp();

  const initialWords = useMemo(() => getWordsForMode(mode, isExtra), [getWordsForMode, mode, isExtra]);
  const [words, setWords] = useState<Word[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [wordConfidence, setWordConfidence] = useState<WordConfidence>({});
  const previousWordIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    setWords(initialWords);
  }, [initialWords]);

  useFocusEffect(
    useCallback(() => {
      const refreshCurrentWord = async () => {
        if (words.length > 0 && currentIndex < words.length) {
          const currentWord = words[currentIndex];
          const updatedWord = await getUpdatedWord(currentWord.id, currentWord);
          if (
            updatedWord.mongolian !== currentWord.mongolian ||
            updatedWord.english !== currentWord.english ||
            updatedWord.pronunciation !== currentWord.pronunciation
          ) {
            setWords(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
          }
        }
      };
      refreshCurrentWord();
    }, [currentIndex, words])
  );

  useEffect(() => {
    setCurrentIndex(0);
    setCompletedIndices([]);
    previousWordIdsRef.current = new Set(words.map(w => w.id));
    getWordConfidence().then(setWordConfidence);
  }, [mode, isExtra]);

  useEffect(() => {
    const currentWordIds = new Set(words.map(w => w.id));
    const previousWordIds = previousWordIdsRef.current;
    
    const deletedWordId = [...previousWordIds].find(id => !currentWordIds.has(id));
    
    if (deletedWordId !== undefined) {
      const deletedIndex = [...previousWordIds].indexOf(deletedWordId);
      
      if (deletedIndex >= 0 && deletedIndex < currentIndex) {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (deletedIndex === currentIndex && currentIndex >= words.length) {
        setCurrentIndex(Math.max(0, words.length - 1));
      }
      
      setCompletedIndices(prev => 
        prev.filter(idx => idx < words.length).map(idx => 
          idx > deletedIndex ? idx - 1 : idx
        )
      );
      
      setIsFlipped(false);
    }
    
    previousWordIdsRef.current = currentWordIds;
  }, [words]);

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleAdvance = useCallback(async () => {
    const currentWord = words[currentIndex];
    
    // Mark current card as completed in storage for progress tracking
    if (currentWord) {
      await markCardCompleted(mode, currentWord.id, isExtra);
    }
    
    // Mark current position as completed visually
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
    currentIndex,
    words,
    markCardCompleted,
    markModeCompleted,
    mode,
    isExtra,
    navigation,
  ]);

  const currentWord = words[currentIndex];
  const modeTitle = getModeLabel(locale, mode);
  
  const currentConfidence = currentWord 
    ? wordConfidence[currentWord.id] || null 
    : null;

  const handleConfidenceChange = useCallback(async (level: ConfidenceLevel) => {
    if (!currentWord) return;
    const updated = await updateWordConfidenceLevel(currentWord.id, level);
    setWordConfidence(updated);
  }, [currentWord]);

  const handleEditPress = useCallback(() => {
    if (!currentWord) return;
    navigation.navigate("EditWord", { word: currentWord, isNew: false, fromStudy: true, isExtra });
  }, [currentWord, navigation, isExtra]);

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
            {t("common.close")}
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
          onAdvance={handleAdvance}
          onEditPress={handleEditPress}
        />
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
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing["4xl"],
  },
});
