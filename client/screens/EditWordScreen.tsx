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
import { useLocalization } from "@/hooks/useLocalization";
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
import { useApp } from "@/context/AppContext";
import { getCategoryLabel } from "@/lib/i18n";

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

export default function EditWordScreen({ navigation, route }: Props) {
  const { word, isNew, fromStudy, isExtra } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { deleteWordDuringStudy } = useApp();
  const { t, locale } = useLocalization();

  const confidenceConfig = {
    learning: { label: t("confidence.learning"), color: "#E57373" },
    familiar: { label: t("confidence.familiar"), color: "#FFB74D" },
    mastered: { label: t("confidence.mastered"), color: "#81C784" },
  };

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
    
    if (fromStudy) {
      await deleteWordDuringStudy(word.id, isExtra ?? false);
    } else {
      await deleteWord(word.id);
    }
    
    setShowDeleteModal(false);
    navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSave} hitSlop={8} testID="save-word-button">
          <ThemedText style={[styles.saveButton, { color: colors.secondary }]}>
            {t("editWord.save")}
          </ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, english, mongolian, pronunciation, category, colors, t]);

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
              {t("editWord.confidenceLevel")}
            </ThemedText>
            <View
              style={[
                styles.confidenceBadge,
                { backgroundColor: confidenceConfig[confidenceLevel].color + "20" },
              ]}
            >
              <View
                style={[
                  styles.confidenceDot,
                  { backgroundColor: confidenceConfig[confidenceLevel].color },
                ]}
              />
              <ThemedText
                style={[
                  styles.confidenceText,
                  { color: confidenceConfig[confidenceLevel].color },
                ]}
              >
                {confidenceConfig[confidenceLevel].label}
              </ThemedText>
            </View>
          </View>
        ) : null}

        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t("editWord.englishLabel")} <ThemedText style={{ color: colors.secondary }}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundDefault, color: colors.text },
            ]}
            value={english}
            onChangeText={setEnglish}
            placeholder={t("editWord.englishPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="sentences"
            testID="input-english"
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t("editWord.mongolianLabel")} <ThemedText style={{ color: colors.secondary }}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundDefault, color: colors.text },
            ]}
            value={mongolian}
            onChangeText={setMongolian}
            placeholder={t("editWord.mongolianPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            testID="input-mongolian"
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t("editWord.pronunciationLabel")}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.backgroundDefault, color: colors.text },
            ]}
            value={pronunciation}
            onChangeText={setPronunciation}
            placeholder={t("editWord.pronunciationPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            testID="input-pronunciation"
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t("editWord.categoryLabel")}
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
              {getCategoryLabel(locale, category)}
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
                    {getCategoryLabel(locale, cat)}
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
            <ThemedText style={styles.deleteText}>{t("editWord.deleteWord")}</ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        title={t("editWord.deleteTitle")}
        message={t("editWord.deleteMessage", { word: word?.english ?? "" })}
        confirmText={t("editWord.deleteConfirm")}
        cancelText={t("editWord.cancel")}
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ConfirmModal
        visible={showValidationModal}
        title={t("editWord.requiredTitle")}
        message={t("editWord.requiredMessage")}
        confirmText={t("editWord.ok")}
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
