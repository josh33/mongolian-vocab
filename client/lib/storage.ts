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
  STREAK_DATA: "streak_data",
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
  date: string;
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
      const session = JSON.parse(stored) as ExtraWordsSession;
      if (session.date === getTodayString()) {
        return session;
      }
      await AsyncStorage.removeItem(STORAGE_KEYS.EXTRA_WORDS_SESSION);
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

export type DayStatus = "completed" | "paused" | "missed" | "pending" | "future";

export interface DayRecord {
  date: string;
  status: DayStatus;
  wordsCompleted: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  streakFreezeAvailable: boolean;
  streakFreezeUsedDate: string | null;
  history: DayRecord[];
}

function getDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDefaultStreakData(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    streakFreezeAvailable: true,
    streakFreezeUsedDate: null,
    history: [],
  };
}

export async function getStreakData(): Promise<StreakData> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA);
    if (stored) {
      return JSON.parse(stored) as StreakData;
    }
    return getDefaultStreakData();
  } catch {
    return getDefaultStreakData();
  }
}

export async function saveStreakData(data: StreakData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save streak data:", error);
  }
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateString(yesterday) === dateString;
}

function isToday(dateString: string): boolean {
  return getDateString(new Date()) === dateString;
}

export async function checkAndUpdateStreak(wordsCompletedToday: number): Promise<{
  streakIncremented: boolean;
  streakBroken: boolean;
  usedFreeze: boolean;
  newStreak: number;
}> {
  const data = await getStreakData();
  const today = getDateString(new Date());
  
  const existingTodayRecord = data.history.find(h => h.date === today);
  if (existingTodayRecord && existingTodayRecord.status === "completed") {
    existingTodayRecord.wordsCompleted = Math.max(existingTodayRecord.wordsCompleted, wordsCompletedToday);
    await saveStreakData(data);
    return {
      streakIncremented: false,
      streakBroken: false,
      usedFreeze: false,
      newStreak: data.currentStreak,
    };
  }
  
  const minWordsRequired = 5;
  const didCompleteToday = wordsCompletedToday >= minWordsRequired;
  
  if (!didCompleteToday) {
    return {
      streakIncremented: false,
      streakBroken: false,
      usedFreeze: false,
      newStreak: data.currentStreak,
    };
  }
  
  let streakIncremented = false;
  let streakBroken = false;
  let usedFreeze = false;
  
  if (data.lastCompletedDate === null) {
    data.currentStreak = 1;
    streakIncremented = true;
  } else if (isToday(data.lastCompletedDate)) {
    // Already completed today, just update word count
  } else if (isYesterday(data.lastCompletedDate)) {
    data.currentStreak += 1;
    streakIncremented = true;
  } else {
    const daysMissed = daysBetween(data.lastCompletedDate, today);
    
    if (daysMissed === 2 && data.streakFreezeAvailable && wordsCompletedToday >= 10) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getDateString(yesterday);
      
      data.history.push({
        date: yesterdayStr,
        status: "paused",
        wordsCompleted: 0,
      });
      
      data.streakFreezeAvailable = false;
      data.streakFreezeUsedDate = yesterdayStr;
      data.currentStreak += 1;
      usedFreeze = true;
      streakIncremented = true;
    } else {
      data.currentStreak = 1;
      streakBroken = true;
      streakIncremented = true;
    }
  }
  
  if (existingTodayRecord) {
    existingTodayRecord.status = "completed";
    existingTodayRecord.wordsCompleted = wordsCompletedToday;
  } else {
    data.history.push({
      date: today,
      status: "completed",
      wordsCompleted: wordsCompletedToday,
    });
  }
  
  data.lastCompletedDate = today;
  
  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }
  
  const maxHistoryDays = 30;
  if (data.history.length > maxHistoryDays) {
    data.history = data.history.slice(-maxHistoryDays);
  }
  
  await saveStreakData(data);
  
  return {
    streakIncremented,
    streakBroken,
    usedFreeze,
    newStreak: data.currentStreak,
  };
}

export function getWeekDays(referenceDate: Date = new Date()): { date: string; dayLabel: string }[] {
  const days: { date: string; dayLabel: string }[] = [];
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  
  const startOfWeek = new Date(referenceDate);
  const currentDay = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - currentDay);
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push({
      date: getDateString(day),
      dayLabel: dayLabels[i],
    });
  }
  
  return days;
}

export function getDayStatus(dateString: string, streakData: StreakData): DayStatus {
  const today = getDateString(new Date());
  const todayDate = new Date();
  const checkDate = new Date(dateString);
  
  if (checkDate > todayDate && dateString !== today) {
    return "future";
  }
  
  const record = streakData.history.find(h => h.date === dateString);
  if (record) {
    return record.status;
  }
  
  if (dateString === today) {
    return "pending";
  }
  
  return "missed";
}
