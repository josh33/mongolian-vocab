import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";

interface StreakBadgeProps {
  count: number;
  onPress: () => void;
  size?: "small" | "medium" | "large";
}

function HorseIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 6C22 6 20.5 5 19 5C17.5 5 16 6 16 6L15 8L13 7C13 7 12 3 8 3C8 3 8 6 9 8L8 9L6 8C6 8 4 9 3 11C2 13 2 15 3 17C4 19 6 20 8 20L10 21L12 20C12 20 14 21 16 20C18 19 19 17 19 15L20 13L21 14C21 14 22 13 22 11C22 9 21 8 21 8L22 6Z"
        fill={color}
      />
      <Path
        d="M19 7.5C19.5523 7.5 20 7.05228 20 6.5C20 5.94772 19.5523 5.5 19 5.5C18.4477 5.5 18 5.94772 18 6.5C18 7.05228 18.4477 7.5 19 7.5Z"
        fill={color === "#D4AF37" ? "#1B3A6B" : "#FFFFFF"}
      />
    </Svg>
  );
}

export function StreakBadge({ count, onPress, size = "medium" }: StreakBadgeProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  
  const isActive = count > 0;
  const iconColor = isActive ? colors.secondary : colors.textSecondary;
  
  const dimensions = {
    small: { icon: 18, text: 12, padding: Spacing.xs },
    medium: { icon: 22, text: 14, padding: Spacing.sm },
    large: { icon: 28, text: 18, padding: Spacing.md },
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
      <HorseIcon size={dim.icon} color={iconColor} />
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
