import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { ConfidenceLevel } from "@/lib/storage";

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel | null;
}

const CONFIDENCE_CONFIG = {
  learning: {
    label: "Learning",
    color: "#E57373",
  },
  familiar: {
    label: "Familiar",
    color: "#FFB74D",
  },
  mastered: {
    label: "Mastered",
    color: "#81C784",
  },
};

export function ConfidenceIndicator({ level }: ConfidenceIndicatorProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  if (level === null) {
    return (
      <View style={[styles.newBadge, { backgroundColor: colors.secondary }]}>
        <ThemedText style={styles.newText}>First Time!</ThemedText>
      </View>
    );
  }

  const config = CONFIDENCE_CONFIG[level];

  return (
    <View style={[styles.container, { backgroundColor: config.color + "20" }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <ThemedText style={[styles.label, { color: config.color }]}>
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  newBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  newText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
