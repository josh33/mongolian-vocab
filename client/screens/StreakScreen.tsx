import React, { useCallback } from "react";
import { StyleSheet, View, Pressable, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay 
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { getWeekDays, getDayStatus, DayStatus } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

import horseArcherImage from "../../assets/images/horse-archer.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function DayIndicator({ 
  dayLabel, 
  status, 
  isToday 
}: { 
  dayLabel: string; 
  status: DayStatus; 
  isToday: boolean;
}) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return colors.success;
      case "paused":
        return colors.secondary;
      case "missed":
        return colors.patternAccent;
      case "pending":
        return isToday ? colors.primary : colors.textSecondary;
      case "future":
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getIcon = () => {
    switch (status) {
      case "completed":
        return <Feather name="check" size={16} color="#FFFFFF" />;
      case "paused":
        return <Feather name="pause" size={14} color="#FFFFFF" />;
      case "missed":
        return <Feather name="x" size={14} color="#FFFFFF" />;
      default:
        return null;
    }
  };

  const statusColor = getStatusColor();
  const isFilled = status === "completed" || status === "paused" || status === "missed";

  return (
    <View style={styles.dayIndicatorContainer}>
      <ThemedText style={[styles.dayLabel, { color: colors.textSecondary }]}>
        {dayLabel}
      </ThemedText>
      <View
        style={[
          styles.dayCircle,
          {
            backgroundColor: isFilled ? statusColor : "transparent",
            borderColor: statusColor,
            borderWidth: isFilled ? 0 : 2,
          },
          isToday && status === "pending" && {
            borderStyle: "dashed" as any,
          },
        ]}
      >
        {getIcon()}
      </View>
    </View>
  );
}

export default function StreakScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { streakData, refreshStreakData } = useApp();

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      refreshStreakData();
    }, [refreshStreakData])
  );

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    opacity.value = withDelay(100, withSpring(1));
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const weekDays = getWeekDays();
  const today = new Date().toLocaleDateString('en-CA');
  const todayFormatted = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

  const hasActiveStreak = streakData.currentStreak > 0;
  const isStreakAtRisk = !streakData.history.find(h => h.date === todayFormatted && h.status === "completed");

  const getMessage = () => {
    if (streakData.currentStreak === 0) {
      return "Start your journey! Practice 5 words today.";
    }
    if (isStreakAtRisk) {
      return "Practice today to keep your streak alive!";
    }
    return "You're on a roll! Come back tomorrow to continue.";
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable 
          onPress={handleClose} 
          style={styles.closeButton}
          testID="button-close-streak"
        >
          <Feather name="x" size={24} color={colors.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
          Streak
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Animated.View style={[styles.mainContent, animatedStyle]}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: hasActiveStreak ? `${colors.secondary}20` : `${colors.textSecondary}10` }]}>
              <Image
                source={horseArcherImage}
                style={[
                  styles.horseImage,
                  { tintColor: hasActiveStreak ? colors.secondary : colors.textSecondary },
                ]}
                resizeMode="contain"
              />
            </View>
          </View>

          <ThemedText style={[styles.streakCount, { color: colors.text }]}>
            {streakData.currentStreak} Day Streak{streakData.currentStreak !== 1 ? "s" : ""}!
          </ThemedText>

          <View style={styles.weekContainer}>
            {weekDays.map((day) => (
              <DayIndicator
                key={day.date}
                dayLabel={day.dayLabel}
                status={getDayStatus(day.date, streakData)}
                isToday={day.date === todayFormatted}
              />
            ))}
          </View>

          <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
            {getMessage()}
          </ThemedText>

          {streakData.longestStreak > 0 ? (
            <View style={[styles.statsContainer, { backgroundColor: colors.backgroundSecondary, marginTop: Spacing["2xl"] }]}>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, { color: colors.secondary }]}>
                  {streakData.longestStreak}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Longest Streak
                </ThemedText>
              </View>
              {streakData.streakFreezeAvailable ? (
                <View style={styles.statItem}>
                  <Feather name="shield" size={24} color={colors.primary} />
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Freeze Available
                  </ThemedText>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Feather name="info" size={18} color={colors.primary} />
            <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
              Practice at least 5 words daily to maintain your streak. Miss a day? Practice 10 words the next day to use your streak freeze!
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 32,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  mainContent: {
    alignItems: "center",
    width: "100%",
  },
  iconContainer: {
    marginTop: Spacing["3xl"],
    marginBottom: Spacing.xl,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  horseImage: {
    width: 80,
    height: 80,
  },
  streakCount: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    marginTop: Spacing.md,
    marginBottom: Spacing["2xl"],
    textAlign: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: 2,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  dayIndicatorContainer: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing["2xl"],
  },
  statItem: {
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    paddingHorizontal: Spacing.xs,
    paddingBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
    width: "100%",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
