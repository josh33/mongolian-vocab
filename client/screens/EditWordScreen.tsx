import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Word } from "@/data/dictionary";
import {
  ConfidenceLevel,
  getWordConfidence,
  updateWord,
  addWord,
  deleteWord,
} from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "EditWord">;

const CATEGORIES = [
  "greetings",
  "phrases",
  "numbers",
  "family",
  "nature",
  "animals",
  "food",
  "colors",
  "time",
  "weather",
  "body",
  "objects",
  "verbs",
  "adjectives",
  "places",
  "travel",
  "custom",
];

const CONFIDENCE_CONFIG = {
  learning: { label: "Learning", color: "#E57373" },
  familiar: { label: "Familiar", color: "#FFB74D" },
  mastered: { label: "Mastered", color: "#81C784" },
};

export default function EditWordScreen({ navigation, route }: Props) {
  const { word, isNew } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const [english, setEnglish] = useState(word?.english ?? "");
  const [mongolian, setMongolian] = useState(word?.mongolian ?? "");
  const [pronunciation, setPronunciation] = useState(word?.pronunciation ?? "");
  const [category, setCategory] = useState(word?.category ?? "custom");
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  useEffect(() => {
    if (word) {
      getWordConfidence().then((confidence) => {
        setConfidenceLevel(confidence[word.id] ?? null);
      });
    }
  }, [word]);

  const handleSave = async () => {
    if (!english.trim() || !mongolian.trim()) {
      setShowValidationModal(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isNew) {
      await addWord({
        english: english.trim(),
        mongolian: mongolian.trim(),
        pronunciation: pronunciation.trim(),
        category: category,
      });
    } else if (word) {
      await updateWord({
        id: word.id,
        english: english.trim(),
        mongolian: mongolian.trim(),
        pronunciation: pronunciation.trim(),
        category: category,
      });
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (!word) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!word) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await deleteWord(word.id);
    setShowDeleteModal(false);
    navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSave} hitSlop={8} testID="save-word-button">
          <ThemedText style={[styles.saveButton, { color: colors.secondary }]}>
            Save
          </ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, english, mongolian, pronunciation, category, colors]);

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {!isNew && confidenceLevel ? (
          <View style={styles.confidenceSection}>
            <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              Confidence Level
            </ThemedText>
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
          </View>
        ) : null}

        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            English <ThemedText style={{ color: colors.secondary }}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundDefault, color: colors.text },
            ]}
            value={english}
            onChangeText={setEnglish}
            placeholder="Enter English word or phrase"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="sentences"
            testID="input-english"
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Mongolian <ThemedText style={{ color: colors.secondary }}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundDefault, color: colors.text },
            ]}
            value={mongolian}
            onChangeText={setMongolian}
            placeholder="Enter Mongolian translation"
            placeholderTextColor={colors.textSecondary}
            testID="input-mongolian"
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Pronunciation
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundDefault, color: colors.text },
            ]}
            value={pronunciation}
            onChangeText={setPronunciation}
            placeholder="How to pronounce (optional)"
            placeholderTextColor={colors.textSecondary}
            testID="input-pronunciation"
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Category
          </ThemedText>
          <Pressable
            style={[
              styles.categorySelector,
              { backgroundColor: colors.backgroundDefault },
            ]}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            testID="category-selector"
          >
            <ThemedText style={[styles.categoryText, { color: colors.text }]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </ThemedText>
            <Feather
              name={showCategoryPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>

          {showCategoryPicker ? (
            <View
              style={[
                styles.categoryPicker,
                { backgroundColor: colors.backgroundDefault },
              ]}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryOption,
                    category === cat && { backgroundColor: colors.backgroundSecondary },
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                    Haptics.selectionAsync();
                  }}
                >
                  <ThemedText
                    style={[
                      styles.categoryOptionText,
                      { color: category === cat ? colors.secondary : colors.text },
                    ]}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </ThemedText>
                  {category === cat ? (
                    <Feather name="check" size={18} color={colors.secondary} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {!isNew && word ? (
          <Pressable
            style={[styles.deleteButton, { backgroundColor: colors.backgroundDefault }]}
            onPress={handleDelete}
            testID="delete-word-button"
          >
            <Feather name="trash-2" size={20} color="#E57373" />
            <ThemedText style={styles.deleteText}>Delete Word</ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Word"
        message={`Are you sure you want to delete "${word?.english ?? ""}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ConfirmModal
        visible={showValidationModal}
        title="Required Fields"
        message="Please fill in both English and Mongolian fields."
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowValidationModal(false)}
        onCancel={() => setShowValidationModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  saveButton: {
    fontSize: 17,
    fontWeight: "600",
  },
  confidenceSection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  categorySelector: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryText: {
    fontSize: 16,
  },
  categoryPicker: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  categoryOptionText: {
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xl,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#E57373",
  },
});
