import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";
import { useApp } from "@/context/AppContext";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme(): "light" | "dark" {
  const [hasHydrated, setHasHydrated] = useState(false);
  const systemColorScheme = useRNColorScheme();
  const { themePreference } = useApp();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return "light";
  }

  if (themePreference === "system") {
    return systemColorScheme ?? "light";
  }

  return themePreference;
}
