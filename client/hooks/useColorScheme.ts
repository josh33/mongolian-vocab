import { useColorScheme as useRNColorScheme } from "react-native";
import { useApp } from "@/context/AppContext";

export function useColorScheme(): "light" | "dark" {
  const systemColorScheme = useRNColorScheme();
  const { themePreference } = useApp();

  if (themePreference === "system") {
    return systemColorScheme ?? "light";
  }

  return themePreference;
}
