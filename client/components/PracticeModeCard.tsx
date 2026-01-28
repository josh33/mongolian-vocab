import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface PracticeModeCardProps {
  title: string;
  subtitle: string;
  progress: number;
  total: number;
  isCompleted: boolean;
  onPress: () => void;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PracticeModeCard({
  title,
  subtitle,
  progress,
  total,
  isCompleted,
  onPress,
  testID,
}: PracticeModeCardProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const progressPercentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundDefault,
          borderColor: isCompleted ? colors.success : colors.primary,
          borderWidth: isCompleted ? 2 : 0,
        },
        animatedStyle,
      ]}
      testID={testID}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </ThemedText>
        </View>
        {isCompleted ? (
          <View style={[styles.checkContainer, { backgroundColor: colors.success }]}>
            <Feather name="check" size={20} color="#FFFFFF" />
          </View>
        ) : (
          <View style={[styles.arrowContainer, { backgroundColor: colors.primary }]}>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={[styles.progressBar, { backgroundColor: colors.backgroundSecondary }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: isCompleted ? colors.success : colors.secondary,
                width: `${progressPercentage}%`,
              },
            ]}
          />
        </View>
        <ThemedText style={[styles.progressText, { color: colors.textSecondary }]}>
          {progress}/{total} completed
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
  },
  checkContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  progressSection: {
    gap: Spacing.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
  },
});
