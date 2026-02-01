import React from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ThemeSegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onValueChange: (index: number) => void;
  tintColor: string;
  textColor: string;
  activeTextColor: string;
  backgroundColor: string;
  testID?: string;
}

export function ThemeSegmentedControl({
  values,
  selectedIndex,
  onValueChange,
  tintColor,
  textColor,
  activeTextColor,
  backgroundColor,
  testID,
}: ThemeSegmentedControlProps) {
  return (
    <View 
      style={[styles.container, { backgroundColor }]}
      testID={testID}
    >
      {values.map((value, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Pressable
            key={value}
            style={[
              styles.segment,
              isSelected && { backgroundColor: tintColor },
            ]}
            onPress={() => onValueChange(index)}
            testID={`${testID}-${value.toLowerCase()}`}
          >
            <ThemedText
              style={[
                styles.segmentText,
                { color: isSelected ? activeTextColor : textColor },
              ]}
            >
              {value}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md - 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
