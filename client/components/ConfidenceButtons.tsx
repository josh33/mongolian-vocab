import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ConfidenceLevel } from "@/lib/storage";

interface ConfidenceButtonsProps {
  currentLevel: ConfidenceLevel | null;
  onSelect: (level: ConfidenceLevel) => void;
}

const CONFIDENCE_OPTIONS: {
  level: ConfidenceLevel;
  label: string;
  color: string;
}[] = [
  { level: "learning", label: "Learning", color: "#E57373" },
  { level: "familiar", label: "Familiar", color: "#FFB74D" },
  { level: "mastered", label: "Mastered", color: "#81C784" },
];

export function ConfidenceButtons({ currentLevel, onSelect }: ConfidenceButtonsProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const handlePress = (level: ConfidenceLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(level);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.title, { color: colors.textSecondary }]}>
        How well do you know this?
      </ThemedText>
      <View style={styles.buttonsRow}>
        {CONFIDENCE_OPTIONS.map((option) => {
          const isSelected = currentLevel === option.level;
          return (
            <Pressable
              key={option.level}
              onPress={() => handlePress(option.level)}
              style={[
                styles.button,
                {
                  backgroundColor: isSelected 
                    ? option.color 
                    : option.color + "20",
                  borderColor: option.color,
                  borderWidth: isSelected ? 0 : 1,
                },
              ]}
              testID={`confidence-${option.level}`}
            >
              <ThemedText
                style={[
                  styles.buttonText,
                  { color: isSelected ? "#FFFFFF" : option.color },
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  button: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    minWidth: 85,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
