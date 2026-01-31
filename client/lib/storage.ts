import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word } from "@/data/dictionary";

const STORAGE_KEYS = {
  DAILY_PROGRESS: "daily_progress",
  THEME_PREFERENCE: "theme_preference",
  EXTRA_WORDS_SESSION: "extra_words_session",
  WORD_CONFIDENCE: "word_confidence",
  USER_DICTIONARY: "user_dictionary",
  DELETED_WORD_IDS: "deleted_word_ids",
  BUNDLE_APPLIED: "word_bundle_applied",
  BUNDLE_DISMISSED: "word_bundle_dismissed",
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

export interface UserDictionary {
  words: Word[];
  editedWords: { [id: number]: Word };
  nextId: number;
}

export async function getUserDictionary(): Promise<UserDictionary> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_DICTIONARY);
    if (stored) {
      const dict = JSON.parse(stored) as UserDictionary;
      const userCreatedIds = dict.words
        .map((w) => w.id)
        .filter((id) => id >= 1000 && id < 100000);
      const maxUserCreatedId = userCreatedIds.length > 0 ? Math.max(...userCreatedIds) : 999;
      dict.nextId = Math.max(dict.nextId ?? 1000, maxUserCreatedId + 1);
      return dict;
    }
    return { words: [], editedWords: {}, nextId: 1000 };
  } catch {
    return { words: [], editedWords: {}, nextId: 1000 };
  }
}

export async function saveUserDictionary(dict: UserDictionary): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DICTIONARY, JSON.stringify(dict));
  } catch (error) {
    console.error("Failed to save user dictionary:", error);
  }
}

export async function getDeletedWordIds(): Promise<number[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_WORD_IDS);
    if (stored) {
      return JSON.parse(stored) as number[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveDeletedWordIds(ids: number[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DELETED_WORD_IDS, JSON.stringify(ids));
  } catch (error) {
    console.error("Failed to save deleted word IDs:", error);
  }
}

export async function addWord(word: Omit<Word, "id">): Promise<Word> {
  const dict = await getUserDictionary();
  const newWord: Word = {
    id: dict.nextId,
    ...word,
  };
  dict.words.push(newWord);
  dict.nextId += 1;
  await saveUserDictionary(dict);
  return newWord;
}

export async function updateWord(word: Word): Promise<void> {
  const dict = await getUserDictionary();
  const userWordIndex = dict.words.findIndex((w) => w.id === word.id);
  if (userWordIndex >= 0) {
    dict.words[userWordIndex] = word;
  } else {
    dict.editedWords[word.id] = word;
  }
  await saveUserDictionary(dict);
}

export async function getUpdatedWord(wordId: number, baseWord: Word): Promise<Word> {
  const dict = await getUserDictionary();
  const userWord = dict.words.find((w) => w.id === wordId);
  if (userWord) {
    return userWord;
  }
  const editedWord = dict.editedWords[wordId];
  if (editedWord) {
    return editedWord;
  }
  return baseWord;
}

export async function deleteWord(wordId: number): Promise<void> {
  const dict = await getUserDictionary();
  const userWordIndex = dict.words.findIndex((w) => w.id === wordId);
  if (userWordIndex >= 0) {
    dict.words.splice(userWordIndex, 1);
    await saveUserDictionary(dict);
  } else {
    const deletedIds = await getDeletedWordIds();
    if (!deletedIds.includes(wordId)) {
      deletedIds.push(wordId);
      await saveDeletedWordIds(deletedIds);
    }
  }
  const confidence = await getWordConfidence();
  if (confidence[wordId]) {
    delete confidence[wordId];
    await saveWordConfidence(confidence);
  }
}

export type BundleStateMap = Record<string, number>;

async function getBundleMap(key: string): Promise<BundleStateMap> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as BundleStateMap) : {};
  } catch {
    return {};
  }
}

async function setBundleMap(key: string, map: BundleStateMap): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(map));
  } catch (error) {
    console.error("Failed to save bundle map:", error);
  }
}

export async function getBundleAppliedMap(): Promise<BundleStateMap> {
  return getBundleMap(STORAGE_KEYS.BUNDLE_APPLIED);
}

export async function getBundleDismissedMap(): Promise<BundleStateMap> {
  return getBundleMap(STORAGE_KEYS.BUNDLE_DISMISSED);
}

export async function markBundleApplied(bundleId: string): Promise<void> {
  const map = await getBundleAppliedMap();
  map[bundleId] = Date.now();
  await setBundleMap(STORAGE_KEYS.BUNDLE_APPLIED, map);
}

export async function markBundleDismissed(bundleId: string): Promise<void> {
  const map = await getBundleDismissedMap();
  map[bundleId] = Date.now();
  await setBundleMap(STORAGE_KEYS.BUNDLE_DISMISSED, map);
}

export type WordBundle = {
  bundleId: string;
  title: string;
  description?: string;
  words: Word[];
};

export async function applyWordBundle(
  bundle: WordBundle
): Promise<{ added: number; skipped: number }> {
  const dict = await getUserDictionary();
  const existingIds = new Set(dict.words.map((w) => w.id));

  let added = 0;
  let skipped = 0;

  for (const w of bundle.words) {
    if (w.id < 100000) {
      console.warn(`Skipping word with invalid bundle ID ${w.id} (must be >= 100000)`);
      skipped++;
      continue;
    }
    if (existingIds.has(w.id)) {
      skipped++;
      continue;
    }
    dict.words.push(w);
    existingIds.add(w.id);
    added++;
  }

  await saveUserDictionary(dict);
  await markBundleApplied(bundle.bundleId);

  return { added, skipped };
}
