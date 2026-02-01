import * as Updates from "expo-updates";
import { AppState, AppStateStatus } from "react-native";
import { getOTAUpdatesEnabled } from "./storage";

let hasCheckedThisSession = false;

export async function checkAndApplyOTAUpdate(): Promise<void> {
  try {
    if (hasCheckedThisSession) return;
    hasCheckedThisSession = true;

    if (!Updates.isEnabled) {
      return;
    }

    const isEnabled = await getOTAUpdatesEnabled();
    if (!isEnabled) {
      return;
    }

    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch {
    // Swallow errors silently - OTA failures shouldn't disrupt the app
  }
}

export function registerOTAAppStateListener(): () => void {
  const handleAppStateChange = (state: AppStateStatus) => {
    if (state === "active") {
      hasCheckedThisSession = false;
      checkAndApplyOTAUpdate();
    }
  };

  const subscription = AppState.addEventListener("change", handleAppStateChange);

  return () => {
    subscription.remove();
  };
}
