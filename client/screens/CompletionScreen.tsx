import React, { useEffect } from "react";
import { StyleSheet, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type CompletionRouteProp = RouteProp<RootStackParamList, "Completion">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CompletionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CompletionRouteProp>();
  const { mode, isExtra } = route.params;
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { isBothModesCompleted } = useApp();
  const bothCompleted = isBothModesCompleted(isExtra);

  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withSpring(1);
    textOpacity.value = withDelay(300, withSpring(1));
  }, [scale, opacity, textOpacity]);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const handleContinue = () => {
    navigation.popToTop();
    navigation.navigate("Main");
  };

  const modeLabel =
    mode === "englishToMongolian"
      ? "English → Mongolian"
      : "Mongolian → English";

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.imageContainer, imageStyle]}>
          <Image
            source={
              bothCompleted
                ? require("../../assets/images/both-complete.png")
                : require("../../assets/images/success-mongolian.png")
            }
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.textContainer, textStyle]}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            {bothCompleted ? "All Done!" : "Mode Complete!"}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            {bothCompleted
              ? isExtra
                ? "You've finished your extra practice. Amazing dedication!"
                : "You've completed both modes for today. Outstanding work!"
              : `You've finished ${modeLabel}. Keep going!`}
          </ThemedText>
        </Animated.View>
      </View>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Button onPress={handleContinue} style={styles.button}>
          Continue
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  imageContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  image: {
    width: 180,
    height: 180,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: Spacing.lg,
  },
  button: {
    borderRadius: 12,
  },
});
