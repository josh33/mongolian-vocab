import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word } from "@/data/dictionary";

const STORAGE_KEYS = {
  DAILY_PROGRESS: "daily_progress",
  THEME_PREFERENCE: "theme_preference",
  EXTRA_WORDS_SESSION: "extra_words_session",
  WORD_CONFIDENCE: "word_confidence",
};

export type ConfidenceLevel = "learning" | "familiar" | "mastered";

export interface WordConfidence {
  [wordId: number]: ConfidenceLevel;
}

export interface DailyProgress {
  date: string;
  englishToMongolianCompleted: boolean;
  mongolianToEnglishCompleted: boolean;
  englishToMongolianProgress: number[];
  mongolianToEnglishProgress: number[];
}

export interface ExtraWordsSession {
  sessionId: string;
  words: Word[];
  englishToMongolianCompleted: boolean;
  mongolianToEnglishCompleted: boolean;
  englishToMongolianProgress: number[];
  mongolianToEnglishProgress: number[];
}

function getTodayString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

export async function getDailyProgress(): Promise<DailyProgress> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
    if (stored) {
      const progress = JSON.parse(stored) as DailyProgress;
      if (progress.date === getTodayString()) {
        return progress;
      }
    }
    return {
      date: getTodayString(),
      englishToMongolianCompleted: false,
      mongolianToEnglishCompleted: false,
      englishToMongolianProgress: [],
      mongolianToEnglishProgress: [],
    };
  } catch {
    return {
      date: getTodayString(),
      englishToMongolianCompleted: false,
      mongolianToEnglishCompleted: false,
      englishToMongolianProgress: [],
      mongolianToEnglishProgress: [],
    };
  }
}

export async function saveDailyProgress(progress: DailyProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save daily progress:", error);
  }
}

export async function getExtraWordsSession(): Promise<ExtraWordsSession | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.EXTRA_WORDS_SESSION);
    if (stored) {
      return JSON.parse(stored) as ExtraWordsSession;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveExtraWordsSession(session: ExtraWordsSession): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXTRA_WORDS_SESSION, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save extra words session:", error);
  }
}

export async function clearExtraWordsSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.EXTRA_WORDS_SESSION);
  } catch (error) {
    console.error("Failed to clear extra words session:", error);
  }
}

export async function getThemePreference(): Promise<"light" | "dark" | "system"> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return "system";
  } catch {
    return "system";
  }
}

export async function saveThemePreference(theme: "light" | "dark" | "system"): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
  } catch (error) {
    console.error("Failed to save theme preference:", error);
  }
}

export async function getWordConfidence(): Promise<WordConfidence> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.WORD_CONFIDENCE);
    if (stored) {
      return JSON.parse(stored) as WordConfidence;
    }
    return {};
  } catch {
    return {};
  }
}

export async function saveWordConfidence(confidence: WordConfidence): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WORD_CONFIDENCE, JSON.stringify(confidence));
  } catch (error) {
    console.error("Failed to save word confidence:", error);
  }
}

export async function updateWordConfidenceLevel(
  wordId: number,
  level: ConfidenceLevel
): Promise<WordConfidence> {
  const current = await getWordConfidence();
  const updated = { ...current, [wordId]: level };
  await saveWordConfidence(updated);
  return updated;
}
