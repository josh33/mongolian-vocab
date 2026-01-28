import React, { useState, useMemo } from "react";
import { StyleSheet, View, FlatList, TextInput, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { dictionary, Word } from "@/data/dictionary";

export default function DictionaryScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState("");

  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) {
      return dictionary.sort((a, b) => a.english.localeCompare(b.english));
    }
    const query = searchQuery.toLowerCase();
    return dictionary
      .filter(
        (word) =>
          word.english.toLowerCase().includes(query) ||
          word.mongolian.toLowerCase().includes(query) ||
          word.pronunciation.toLowerCase().includes(query)
      )
      .sort((a, b) => a.english.localeCompare(b.english));
  }, [searchQuery]);

  const renderItem = ({ item }: { item: Word }) => (
    <WordRow word={item} colors={colors} />
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
      <View style={[styles.searchContainer, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.backgroundDefault }]}>
          <Feather name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search words..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

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
}

function WordRow({ word, colors }: WordRowProps) {
  return (
    <View style={styles.wordRow}>
      <View style={styles.wordContent}>
        <ThemedText style={[styles.englishText, { color: colors.text }]}>
          {word.english}
        </ThemedText>
        <View style={styles.mongolianContainer}>
          <ThemedText style={[styles.mongolianText, { color: colors.text }]}>
            {word.mongolian}
          </ThemedText>
          <ThemedText style={[styles.pronunciationText, { color: colors.textSecondary }]}>
            ({word.pronunciation})
          </ThemedText>
        </View>
      </View>
      <View style={[styles.categoryBadge, { backgroundColor: colors.backgroundSecondary }]}>
        <ThemedText style={[styles.categoryText, { color: colors.textSecondary }]}>
          {word.category}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
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
  englishText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
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
});
