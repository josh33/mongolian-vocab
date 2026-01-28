import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Colors, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface ProgressDotsProps {
  total: number;
  completed: number[];
  currentIndex: number;
}

export function ProgressDots({ total, completed, currentIndex }: ProgressDotsProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = completed.includes(index);
        const isCurrent = index === currentIndex;

        return (
          <Dot
            key={index}
            isCompleted={isCompleted}
            isCurrent={isCurrent}
            activeColor={colors.secondary}
            inactiveColor={colors.textSecondary}
          />
        );
      })}
    </View>
  );
}

interface DotProps {
  isCompleted: boolean;
  isCurrent: boolean;
  activeColor: string;
  inactiveColor: string;
}

function Dot({ isCompleted, isCurrent, activeColor, inactiveColor }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(isCompleted ? activeColor : `${inactiveColor}33`, {
        duration: 200,
      }),
      transform: [
        {
          scale: withSpring(isCurrent ? 1.3 : 1, {
            damping: 15,
            stiffness: 200,
          }),
        },
      ],
      borderWidth: isCurrent ? 2 : 0,
      borderColor: activeColor,
    };
  }, [isCompleted, isCurrent]);

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
