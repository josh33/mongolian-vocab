import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { StyleSheet, View, FlatList, TextInput, Pressable, Image, InputAccessoryView, Platform, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { dictionary as baseDictionary, Word } from "@/data/dictionary";
import {
  ConfidenceLevel,
  WordConfidence,
  getWordConfidence,
  getUserDictionary,
  getDeletedWordIds,
} from "@/lib/storage";
import { getAcceptedPackWords } from "@/lib/packWords";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const CONFIDENCE_CONFIG = {
  learning: { label: "Learning", color: "#E57373" },
  familiar: { label: "Familiar", color: "#FFB74D" },
  mastered: { label: "Mastered", color: "#81C784" },
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DictionaryScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const navigation = useNavigation<NavigationProp>();
  const searchInputRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [wordConfidence, setWordConfidence] = useState<WordConfidence>({});
  const [allWords, setAllWords] = useState<Word[]>(baseDictionary);

  const loadData = useCallback(async () => {
    const [confidence, userDict, deletedIds, packWords] = await Promise.all([
      getWordConfidence(),
      getUserDictionary(),
      getDeletedWordIds(),
      getAcceptedPackWords(),
    ]);

    setWordConfidence(confidence);

    const baseWords = baseDictionary
      .filter((w) => !deletedIds.includes(w.id))
      .map((w) => userDict.editedWords[w.id] ?? w);

    const packWordsMerged = packWords
      .filter((w) => !deletedIds.includes(w.id))
      .map((w) => userDict.editedWords[w.id] ?? w);

    const combined = [...baseWords, ...packWordsMerged, ...userDict.words];
    setAllWords(combined);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredWords = useMemo(() => {
    let words = allWords;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      words = allWords.filter(
        (word) =>
          word.english.toLowerCase().includes(query) ||
          word.mongolian.toLowerCase().includes(query) ||
          word.pronunciation.toLowerCase().includes(query)
      );
    }
    return words.sort((a, b) => a.english.localeCompare(b.english));
  }, [searchQuery, allWords]);

  const handleWordPress = (word: Word) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("EditWord", { word, isNew: false });
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("EditWord", { isNew: true });
  };

  const renderItem = ({ item }: { item: Word }) => (
    <WordRow
      word={item}
      colors={colors}
      confidenceLevel={wordConfidence[item.id] ?? null}
      onPress={() => handleWordPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../../assets/images/empty-search.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
        No words found
      </ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Try a different search term
      </ThemedText>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <View style={[styles.headerContainer, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.headerRow}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
            Dictionary
          </ThemedText>
          <Pressable
            onPress={handleAddPress}
            style={[styles.addButton, { backgroundColor: colors.secondary }]}
            hitSlop={8}
            testID="add-word-button"
          >
            <Feather name="plus" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
        <Pressable 
          style={[styles.searchInputContainer, { backgroundColor: colors.backgroundDefault }]}
          onPress={() => searchInputRef.current?.focus()}
        >
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search words..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            testID="search-input"
            inputAccessoryViewID={Platform.OS === "ios" ? "dictionarySearchAccessory" : undefined}
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </Pressable>
      </View>

      {Platform.OS === "ios" ? (
        <InputAccessoryView nativeID="dictionarySearchAccessory">
          <View style={[styles.accessoryContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <Pressable
              onPress={() => Keyboard.dismiss()}
              style={styles.accessoryButton}
              hitSlop={8}
            >
              <Feather name="chevron-down" size={20} color={colors.primary} />
              <ThemedText style={[styles.accessoryButtonText, { color: colors.primary }]}>
                Done
              </ThemedText>
            </Pressable>
          </View>
        </InputAccessoryView>
      ) : null}

      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + Spacing.xl,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.backgroundSecondary }]} />
        )}
      />
    </View>
  );
}

interface WordRowProps {
  word: Word;
  colors: typeof Colors.light;
  confidenceLevel: ConfidenceLevel | null;
  onPress: () => void;
}

function WordRow({ word, colors, confidenceLevel, onPress }: WordRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.wordRow,
        pressed && { backgroundColor: colors.backgroundSecondary },
      ]}
      onPress={onPress}
      testID={`word-row-${word.id}`}
    >
      <View style={styles.wordContent}>
        <View style={styles.englishRow}>
          <ThemedText style={[styles.englishText, { color: colors.text }]}>
            {word.english}
          </ThemedText>
          {confidenceLevel ? (
            <View
              style={[
                styles.confidenceBadge,
                { backgroundColor: CONFIDENCE_CONFIG[confidenceLevel].color + "20" },
              ]}
            >
              <View
                style={[
                  styles.confidenceDot,
                  { backgroundColor: CONFIDENCE_CONFIG[confidenceLevel].color },
                ]}
              />
              <ThemedText
                style={[
                  styles.confidenceText,
                  { color: CONFIDENCE_CONFIG[confidenceLevel].color },
                ]}
              >
                {CONFIDENCE_CONFIG[confidenceLevel].label}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <View style={styles.mongolianContainer}>
          <ThemedText style={[styles.mongolianText, { color: colors.text }]}>
            {word.mongolian}
          </ThemedText>
          {word.pronunciation ? (
            <ThemedText style={[styles.pronunciationText, { color: colors.textSecondary }]}>
              ({word.pronunciation})
            </ThemedText>
          ) : null}
        </View>
      </View>
      <View style={styles.rightContent}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={[styles.categoryText, { color: colors.textSecondary }]}>
            {word.category}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    height: "100%",
  },
  wordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  wordContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  englishRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
    flexWrap: "wrap",
  },
  englishText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: "600",
  },
  mongolianContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.xs,
  },
  mongolianText: {
    fontSize: 15,
  },
  pronunciationText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  categoryText: {
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    marginLeft: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing["4xl"],
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  accessoryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  accessoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  accessoryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
