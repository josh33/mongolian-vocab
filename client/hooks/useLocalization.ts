import { useCallback } from "react";
import { useOptionalApp } from "@/context/AppContext";
import { getLocaleFromMongolMode, translate, Locale } from "@/lib/i18n";

export function useLocalization() {
  const app = useOptionalApp();
  const isMongolMode = app?.mongolModeEnabled ?? false;
  const locale: Locale = getLocaleFromMongolMode(isMongolMode);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale]
  );

  return { t, locale, isMongolMode };
}
