import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";

import horseArcherImage from "../../assets/images/horse-archer.png";

interface StreakBadgeProps {
  count: number;
  onPress: () => void;
  size?: "small" | "medium" | "large";
}

export function StreakBadge({ count, onPress, size = "medium" }: StreakBadgeProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  
  const isActive = count > 0;
  const iconColor = isActive ? colors.secondary : colors.textSecondary;
  
  const dimensions = {
    small: { icon: 20, text: 12, padding: Spacing.xs },
    medium: { icon: 26, text: 14, padding: Spacing.sm },
    large: { icon: 32, text: 18, padding: Spacing.md },
  };
  
  const dim = dimensions[size];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: isActive 
            ? (isDark ? "rgba(212, 175, 55, 0.15)" : "rgba(212, 175, 55, 0.12)")
            : "transparent",
          paddingHorizontal: dim.padding,
          paddingVertical: dim.padding / 2,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      testID="button-streak-badge"
    >
      <Image
        source={horseArcherImage}
        style={[
          { width: dim.icon, height: dim.icon },
          { tintColor: iconColor },
        ]}
        resizeMode="contain"
      />
      <ThemedText
        style={[
          styles.count,
          {
            color: isActive ? colors.secondary : colors.textSecondary,
            fontSize: dim.text,
            fontWeight: isActive ? "700" : "500",
          },
        ]}
      >
        {count}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    gap: 4,
  },
  count: {
    marginLeft: 2,
  },
});
