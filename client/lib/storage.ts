import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word } from "@/data/dictionary";
import {
  getDatabase,
  getStreakDataFromDB,
  saveStreakDataToDB,
  getWordConfidenceFromDB,
  saveWordConfidenceToDB,
  getUserDictionaryFromDB,
  addWordToDictionaryDB,
  removeWordFromDictionaryDB,
  getDeletedWordIdsFromDB,
  addDeletedWordDB,
  getPackStatusFromDB,
  setPackStatusDB,
  getDailyProgressFromDB,
  saveDailyProgressToDB,
  clearDailyProgressDB,
  getExtraWordsSessionFromDB,
  saveExtraWordsSessionToDB,
  clearExtraWordsSessionDB,
  hasMigratedFromAsyncStorage,
  markMigrationComplete,
} from "./database";

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
  ACCEPTED_PACKS: "accepted_packs",
  DISMISSED_PACKS: "dismissed_packs",
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

function getDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function initializeStorage(): Promise<void> {
  try {
    await getDatabase();
    const migrated = await hasMigratedFromAsyncStorage();
    if (!migrated) {
      await migrateFromAsyncStorage();
      await markMigrationComplete();
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error);
  }
}

async function migrateFromAsyncStorage(): Promise<void> {
  try {
    const streakRaw = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA);
    if (streakRaw) {
      const streakData = JSON.parse(streakRaw);
      await saveStreakDataToDB({
        currentStreak: streakData.currentStreak ?? 0,
        longestStreak: streakData.longestStreak ?? 0,
        lastCompletedDate: streakData.lastCompletedDate ?? null,
        streakFreezeAvailable: streakData.streakFreezeAvailable ?? true,
        streakFreezeUsedDate: streakData.streakFreezeUsedDate ?? null,
        history: (streakData.history ?? []).map((h: { date: string; status: string; wordsCompleted: number }) => ({
          date: h.date,
          status: h.status,
          wordsCompleted: h.wordsCompleted,
        })),
      });
    }

    const confidenceRaw = await AsyncStorage.getItem(STORAGE_KEYS.WORD_CONFIDENCE);
    if (confidenceRaw) {
      const confidence = JSON.parse(confidenceRaw) as Record<string, string>;
      for (const [wordId, level] of Object.entries(confidence)) {
        await saveWordConfidenceToDB(parseInt(wordId, 10), level);
      }
    }

    const deletedRaw = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_WORD_IDS);
    if (deletedRaw) {
      const deletedIds = JSON.parse(deletedRaw) as number[];
      for (const id of deletedIds) {
        await addDeletedWordDB(id);
      }
    }

    const acceptedRaw = await AsyncStorage.getItem(STORAGE_KEYS.ACCEPTED_PACKS);
    if (acceptedRaw) {
      const acceptedPacks = JSON.parse(acceptedRaw) as Array<{ id: string; version: number }>;
      for (const pack of acceptedPacks) {
        await setPackStatusDB(pack.id, "accepted");
      }
    }

    const dismissedRaw = await AsyncStorage.getItem(STORAGE_KEYS.DISMISSED_PACKS);
    if (dismissedRaw) {
      const dismissedPacks = JSON.parse(dismissedRaw) as Array<{ id: string; version: number }>;
      for (const pack of dismissedPacks) {
        await setPackStatusDB(pack.id, "dismissed");
      }
    }

    const userDictRaw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DICTIONARY);
    if (userDictRaw) {
      const userDict = JSON.parse(userDictRaw) as { words: Word[]; editedWords: Record<string, Word> };
      for (const word of userDict.words || []) {
        await addWordToDictionaryDB({
          english: word.english,
          mongolian: word.mongolian,
          pronunciation: word.pronunciation,
          category: word.category,
        });
      }
    }

    console.log("Migration from AsyncStorage complete");
  } catch (error) {
    console.error("Migration from AsyncStorage failed:", error);
  }
}

export async function getDailyProgress(): Promise<DailyProgress> {
  try {
    const row = await getDailyProgressFromDB();
    const todayStr = getTodayString();
    
    if (row && row.date === todayStr) {
      return {
        date: row.date,
        englishToMongolianCompleted: row.english_to_mongolian_completed === 1,
        mongolianToEnglishCompleted: row.mongolian_to_english_completed === 1,
        englishToMongolianProgress: JSON.parse(row.english_to_mongolian_progress),
        mongolianToEnglishProgress: JSON.parse(row.mongolian_to_english_progress),
      };
    }
    
    return {
      date: todayStr,
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
    await saveDailyProgressToDB(progress);
  } catch (error) {
    console.error("Failed to save daily progress:", error);
  }
}

export async function getExtraWordsSession(): Promise<ExtraWordsSession | null> {
  try {
    const row = await getExtraWordsSessionFromDB();
    const todayStr = getTodayString();
    
    if (row && row.date === todayStr) {
      return {
        sessionId: row.session_id,
        date: row.date,
        words: JSON.parse(row.words),
        englishToMongolianCompleted: row.english_to_mongolian_completed === 1,
        mongolianToEnglishCompleted: row.mongolian_to_english_completed === 1,
        englishToMongolianProgress: JSON.parse(row.english_to_mongolian_progress),
        mongolianToEnglishProgress: JSON.parse(row.mongolian_to_english_progress),
      };
    }
    
    if (row) {
      await clearExtraWordsSessionDB();
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveExtraWordsSession(session: ExtraWordsSession): Promise<void> {
  try {
    await saveExtraWordsSessionToDB(session);
  } catch (error) {
    console.error("Failed to save extra words session:", error);
  }
}

export async function clearExtraWordsSession(): Promise<void> {
  try {
    await clearExtraWordsSessionDB();
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
    const data = await getWordConfidenceFromDB();
    const result: WordConfidence = {};
    for (const [wordId, level] of Object.entries(data)) {
      result[parseInt(wordId, 10)] = level as ConfidenceLevel;
    }
    return result;
  } catch {
    return {};
  }
}

export async function saveWordConfidence(confidence: WordConfidence): Promise<void> {
  try {
    for (const [wordId, level] of Object.entries(confidence)) {
      await saveWordConfidenceToDB(parseInt(wordId, 10), level);
    }
  } catch (error) {
    console.error("Failed to save word confidence:", error);
  }
}

export async function updateWordConfidenceLevel(
  wordId: number,
  level: ConfidenceLevel
): Promise<WordConfidence> {
  await saveWordConfidenceToDB(wordId, level);
  return getWordConfidence();
}

export interface UserDictionary {
  words: Word[];
  editedWords: { [id: number]: Word };
  nextId: number;
}

export async function getUserDictionary(): Promise<UserDictionary> {
  try {
    const rows = await getUserDictionaryFromDB();
    const words: Word[] = rows.map(row => ({
      id: row.id + 1000,
      english: row.english,
      mongolian: row.mongolian,
      pronunciation: row.pronunciation ?? "",
      category: row.category,
    }));
    
    const userCreatedIds = words.map(w => w.id).filter(id => id >= 1000 && id < 100000);
    const maxUserCreatedId = userCreatedIds.length > 0 ? Math.max(...userCreatedIds) : 999;
    
    return {
      words,
      editedWords: {},
      nextId: Math.max(1000, maxUserCreatedId + 1),
    };
  } catch {
    return { words: [], editedWords: {}, nextId: 1000 };
  }
}

export async function saveUserDictionary(dict: UserDictionary): Promise<void> {
  console.log("saveUserDictionary called - individual operations now handled by specific functions");
}

export async function getDeletedWordIds(): Promise<number[]> {
  try {
    return await getDeletedWordIdsFromDB();
  } catch {
    return [];
  }
}

export async function saveDeletedWordIds(ids: number[]): Promise<void> {
  try {
    for (const id of ids) {
      await addDeletedWordDB(id);
    }
  } catch (error) {
    console.error("Failed to save deleted word IDs:", error);
  }
}

export async function addWord(word: Omit<Word, "id">): Promise<Word> {
  const dbId = await addWordToDictionaryDB({
    english: word.english,
    mongolian: word.mongolian,
    pronunciation: word.pronunciation,
    category: word.category,
  });
  
  return {
    id: dbId + 1000,
    ...word,
  };
}

export async function updateWord(word: Word): Promise<void> {
  const dict = await getUserDictionary();
  const existingWord = dict.words.find(w => w.id === word.id);
  if (existingWord) {
    const dbId = word.id - 1000;
    await removeWordFromDictionaryDB(dbId);
    await addWordToDictionaryDB({
      english: word.english,
      mongolian: word.mongolian,
      pronunciation: word.pronunciation,
      category: word.category,
    });
  }
}

export async function getUpdatedWord(wordId: number, baseWord: Word): Promise<Word> {
  const dict = await getUserDictionary();
  const userWord = dict.words.find(w => w.id === wordId);
  if (userWord) {
    return userWord;
  }
  return baseWord;
}

export async function deleteWord(wordId: number): Promise<void> {
  const dict = await getUserDictionary();
  const userWord = dict.words.find(w => w.id === wordId);
  
  if (userWord) {
    const dbId = wordId - 1000;
    await removeWordFromDictionaryDB(dbId);
  } else {
    await addDeletedWordDB(wordId);
  }
  
  const confidence = await getWordConfidence();
  if (confidence[wordId]) {
    delete confidence[wordId];
  }
}

export type BundleStateMap = Record<string, number>;

export async function getBundleAppliedMap(): Promise<BundleStateMap> {
  try {
    const packStatus = await getPackStatusFromDB();
    const result: BundleStateMap = {};
    for (const [packId, status] of Object.entries(packStatus)) {
      if (status === "accepted") {
        result[packId] = Date.now();
      }
    }
    return result;
  } catch {
    return {};
  }
}

export async function getBundleDismissedMap(): Promise<BundleStateMap> {
  try {
    const packStatus = await getPackStatusFromDB();
    const result: BundleStateMap = {};
    for (const [packId, status] of Object.entries(packStatus)) {
      if (status === "dismissed") {
        result[packId] = Date.now();
      }
    }
    return result;
  } catch {
    return {};
  }
}

export async function markBundleApplied(bundleId: string): Promise<void> {
  await setPackStatusDB(bundleId, "accepted");
}

export async function markBundleDismissed(bundleId: string): Promise<void> {
  await setPackStatusDB(bundleId, "dismissed");
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
    await addWordToDictionaryDB({
      english: w.english,
      mongolian: w.mongolian,
      pronunciation: w.pronunciation,
      category: w.category,
    });
    added++;
  }

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

function isSameWeek(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  const getWeekStart = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.getFullYear(), d.getMonth(), diff).getTime();
  };
  
  return getWeekStart(d1) === getWeekStart(d2);
}

export async function getStreakData(): Promise<StreakData> {
  try {
    const data = await getStreakDataFromDB();
    const today = getDateString(new Date());
    
    if (data.streakFreezeUsedDate && !isSameWeek(data.streakFreezeUsedDate, today)) {
      data.streakFreezeAvailable = true;
      data.streakFreezeUsedDate = null;
      await saveStreakData({
        ...data,
        history: data.history.map(h => ({
          date: h.date,
          status: h.status as DayStatus,
          wordsCompleted: h.wordsCompleted,
        })),
      });
    }
    
    return {
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      lastCompletedDate: data.lastCompletedDate,
      streakFreezeAvailable: data.streakFreezeAvailable,
      streakFreezeUsedDate: data.streakFreezeUsedDate,
      history: data.history.map(h => ({
        date: h.date,
        status: h.status as DayStatus,
        wordsCompleted: h.wordsCompleted,
      })),
    };
  } catch {
    return getDefaultStreakData();
  }
}

export async function saveStreakData(data: StreakData): Promise<void> {
  try {
    await saveStreakDataToDB({
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      lastCompletedDate: data.lastCompletedDate,
      streakFreezeAvailable: data.streakFreezeAvailable,
      streakFreezeUsedDate: data.streakFreezeUsedDate,
      history: data.history.map(h => ({
        date: h.date,
        status: h.status,
        wordsCompleted: h.wordsCompleted,
      })),
    });
  } catch (error) {
    console.error("Failed to save streak data:", error);
  }
}

export async function resetTodayProgress(): Promise<void> {
  try {
    const today = getDateString(new Date());
    
    await clearDailyProgressDB();
    await clearExtraWordsSessionDB();
    
    const streakData = await getStreakData();
    streakData.history = streakData.history.filter(h => h.date !== today);
    
    if (streakData.lastCompletedDate === today) {
      const previousDates = streakData.history
        .filter(h => h.status === "completed")
        .map(h => h.date)
        .sort()
        .reverse();
      streakData.lastCompletedDate = previousDates.length > 0 ? previousDates[0] : null;
      
      let streak = 0;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getDateString(yesterday);
      
      if (streakData.history.find(h => h.date === yesterdayStr && h.status === "completed")) {
        for (let i = 0; i < streakData.history.length; i++) {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - 1 - i);
          const checkDateStr = getDateString(checkDate);
          const entry = streakData.history.find(h => h.date === checkDateStr);
          if (entry && (entry.status === "completed" || entry.status === "paused")) {
            streak++;
          } else {
            break;
          }
        }
      }
      streakData.currentStreak = streak;
    }
    
    await saveStreakData(streakData);
  } catch (error) {
    console.error("Failed to reset today's progress:", error);
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

export type AcceptedPack = { id: string; version: number };

export async function getAcceptedPacks(): Promise<AcceptedPack[]> {
  try {
    const packStatus = await getPackStatusFromDB();
    const result: AcceptedPack[] = [];
    for (const [packId, status] of Object.entries(packStatus)) {
      if (status === "accepted") {
        result.push({ id: packId, version: 1 });
      }
    }
    return result;
  } catch {
    return [];
  }
}

export async function saveAcceptedPacks(packs: AcceptedPack[]): Promise<void> {
  try {
    for (const pack of packs) {
      await setPackStatusDB(pack.id, "accepted");
    }
  } catch (error) {
    console.error("Failed to save accepted packs:", error);
  }
}

export async function acceptPack(packId: string, version: number): Promise<void> {
  await setPackStatusDB(packId, "accepted");
}

export async function isPackAccepted(packId: string): Promise<AcceptedPack | null> {
  const packs = await getAcceptedPacks();
  return packs.find((p) => p.id === packId) ?? null;
}

export type DismissedPack = { id: string; version: number; timestamp: number };

export async function getDismissedPacks(): Promise<DismissedPack[]> {
  try {
    const packStatus = await getPackStatusFromDB();
    const result: DismissedPack[] = [];
    for (const [packId, status] of Object.entries(packStatus)) {
      if (status === "dismissed") {
        result.push({ id: packId, version: 1, timestamp: Date.now() });
      }
    }
    return result;
  } catch {
    return [];
  }
}

export async function saveDismissedPacks(packs: DismissedPack[]): Promise<void> {
  try {
    for (const pack of packs) {
      await setPackStatusDB(pack.id, "dismissed");
    }
  } catch (error) {
    console.error("Failed to save dismissed packs:", error);
  }
}

export async function dismissPack(packId: string, version: number): Promise<void> {
  await setPackStatusDB(packId, "dismissed");
}

export async function isPackDismissed(packId: string, version: number): Promise<boolean> {
  const packStatus = await getPackStatusFromDB();
  return packStatus[packId] === "dismissed";
}
