import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word, dictionary } from "@/data/dictionary";
import { PACKS, getPackWords } from "@/data/packs";
import {
  getDatabase,
  getStreakDataFromDB,
  saveStreakDataToDB,
  getWordConfidenceFromDB,
  saveWordConfidenceToDB,
  deleteWordConfidenceFromDB,
  getWordOverridesFromDB,
  getWordOverrideFromDB,
  saveWordOverrideToDB,
  deleteWordOverrideFromDB,
  deleteWordOverridesByIds,
  getUserDictionaryFromDB,
  addWordToDictionaryDB,
  updateWordInDictionaryDB,
  removeWordFromDictionaryDB,
  getDeletedWordIdsFromDB,
  addDeletedWordDB,
  deleteDeletedWordsByIds,
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
  isNativePlatform,
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
  OTA_UPDATES_ENABLED: "ota_updates_enabled",
  MONGOL_MODE_ENABLED: "mongol_mode_enabled",
};

export type ConfidenceLevel = "learning" | "familiar" | "mastered";

export interface WordConfidence {
  [wordId: number]: ConfidenceLevel;
}

export interface WordOverrideMap {
  [wordId: number]: Word;
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

function parseDateStringLocal(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isCustomWordId(wordId: number): boolean {
  return wordId >= 1000 && wordId < 100000;
}

function isBundleWordId(wordId: number): boolean {
  return wordId >= 100000 && wordId < 200000;
}

export async function initializeStorage(): Promise<void> {
  try {
    if (!isNativePlatform()) {
      console.log("Web platform detected - using AsyncStorage");
      return;
    }
    
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
  const todayStr = getTodayString();
  const defaultProgress: DailyProgress = {
    date: todayStr,
    englishToMongolianCompleted: false,
    mongolianToEnglishCompleted: false,
    englishToMongolianProgress: [],
    mongolianToEnglishProgress: [],
  };

  try {
    if (!isNativePlatform()) {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
      if (stored) {
        const progress = JSON.parse(stored) as DailyProgress;
        if (progress.date === todayStr) {
          return progress;
        }
      }
      return defaultProgress;
    }

    const row = await getDailyProgressFromDB();
    
    if (row && row.date === todayStr) {
      return {
        date: row.date,
        englishToMongolianCompleted: row.english_to_mongolian_completed === 1,
        mongolianToEnglishCompleted: row.mongolian_to_english_completed === 1,
        englishToMongolianProgress: JSON.parse(row.english_to_mongolian_progress),
        mongolianToEnglishProgress: JSON.parse(row.mongolian_to_english_progress),
      };
    }
    
    return defaultProgress;
  } catch {
    return defaultProgress;
  }
}

export async function saveDailyProgress(progress: DailyProgress): Promise<void> {
  try {
    if (!isNativePlatform()) {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(progress));
      return;
    }
    await saveDailyProgressToDB(progress);
  } catch (error) {
    console.error("Failed to save daily progress:", error);
  }
}

export async function getExtraWordsSession(): Promise<ExtraWordsSession | null> {
  const todayStr = getTodayString();
  
  try {
    if (!isNativePlatform()) {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.EXTRA_WORDS_SESSION);
      if (stored) {
        const session = JSON.parse(stored) as ExtraWordsSession;
        if (session.date === todayStr) {
          return session;
        }
        await AsyncStorage.removeItem(STORAGE_KEYS.EXTRA_WORDS_SESSION);
      }
      return null;
    }

    const row = await getExtraWordsSessionFromDB();
    
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
    if (!isNativePlatform()) {
      await AsyncStorage.setItem(STORAGE_KEYS.EXTRA_WORDS_SESSION, JSON.stringify(session));
      return;
    }
    await saveExtraWordsSessionToDB(session);
  } catch (error) {
    console.error("Failed to save extra words session:", error);
  }
}

export async function clearExtraWordsSession(): Promise<void> {
  try {
    if (!isNativePlatform()) {
      await AsyncStorage.removeItem(STORAGE_KEYS.EXTRA_WORDS_SESSION);
      return;
    }
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
    if (!isNativePlatform()) {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WORD_CONFIDENCE);
      if (stored) {
        return JSON.parse(stored) as WordConfidence;
      }
      return {};
    }
    
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
    if (!isNativePlatform()) {
      await AsyncStorage.setItem(STORAGE_KEYS.WORD_CONFIDENCE, JSON.stringify(confidence));
      return;
    }
    for (const [wordId, level] of Object.entries(confidence)) {
      await saveWordConfidenceToDB(parseInt(wordId, 10), level);
    }
  } catch (error) {
    console.error("Failed to save word confidence:", error);
  }
}

export async function deleteWordConfidenceLevel(wordId: number): Promise<void> {
  try {
    if (!isNativePlatform()) {
      const current = await getWordConfidence();
      if (current[wordId]) {
        delete current[wordId];
        await saveWordConfidence(current);
      }
      return;
    }
    await deleteWordConfidenceFromDB(wordId);
  } catch (error) {
    console.error("Failed to delete word confidence:", error);
  }
}

export async function getWordOverrides(): Promise<WordOverrideMap> {
  try {
    if (!isNativePlatform()) {
      const dict = await getUserDictionary();
      return dict.editedWords ?? {};
    }
    const rows = await getWordOverridesFromDB();
    const result: WordOverrideMap = {};
    for (const [wordId, row] of Object.entries(rows)) {
      const id = parseInt(wordId, 10);
      result[id] = {
        id,
        english: row.english,
        mongolian: row.mongolian,
        pronunciation: row.pronunciation ?? "",
        category: row.category,
      };
    }
    return result;
  } catch {
    return {};
  }
}

export async function getWordOverride(wordId: number): Promise<Word | null> {
  try {
    if (!isNativePlatform()) {
      const dict = await getUserDictionary();
      return dict.editedWords[wordId] ?? null;
    }
    const row = await getWordOverrideFromDB(wordId);
    if (!row) return null;
    return {
      id: row.word_id,
      english: row.english,
      mongolian: row.mongolian,
      pronunciation: row.pronunciation ?? "",
      category: row.category,
    };
  } catch {
    return null;
  }
}

export async function saveWordOverride(word: Word): Promise<void> {
  if (!isNativePlatform()) {
    const dict = await getUserDictionary();
    dict.editedWords[word.id] = word;
    await saveUserDictionary(dict);
    return;
  }
  await saveWordOverrideToDB(word);
}

export async function removeWordOverride(wordId: number): Promise<void> {
  if (!isNativePlatform()) {
    const dict = await getUserDictionary();
    if (dict.editedWords[wordId]) {
      delete dict.editedWords[wordId];
      await saveUserDictionary(dict);
    }
    return;
  }
  await deleteWordOverrideFromDB(wordId);
}

export async function removeWordOverridesByIds(wordIds: number[]): Promise<void> {
  if (wordIds.length === 0) return;
  if (!isNativePlatform()) {
    const dict = await getUserDictionary();
    let changed = false;
    for (const id of wordIds) {
      if (dict.editedWords[id]) {
        delete dict.editedWords[id];
        changed = true;
      }
    }
    if (changed) {
      await saveUserDictionary(dict);
    }
    return;
  }
  await deleteWordOverridesByIds(wordIds);
}

export async function updateWordConfidenceLevel(
  wordId: number,
  level: ConfidenceLevel
): Promise<WordConfidence> {
  if (!isNativePlatform()) {
    const current = await getWordConfidence();
    const updated = { ...current, [wordId]: level };
    await saveWordConfidence(updated);
    return updated;
  }
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
    if (!isNativePlatform()) {
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
    }

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
  if (!isNativePlatform()) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DICTIONARY, JSON.stringify(dict));
    } catch (error) {
      console.error("Failed to save user dictionary:", error);
    }
    return;
  }
  console.log("saveUserDictionary called - individual operations now handled by specific functions");
}

export async function getDeletedWordIds(): Promise<number[]> {
  try {
    if (!isNativePlatform()) {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_WORD_IDS);
      if (stored) {
        return JSON.parse(stored) as number[];
      }
      return [];
    }
    return await getDeletedWordIdsFromDB();
  } catch {
    return [];
  }
}

export async function saveDeletedWordIds(ids: number[]): Promise<void> {
  try {
    if (!isNativePlatform()) {
      await AsyncStorage.setItem(STORAGE_KEYS.DELETED_WORD_IDS, JSON.stringify(ids));
      return;
    }
    for (const id of ids) {
      await addDeletedWordDB(id);
    }
  } catch (error) {
    console.error("Failed to save deleted word IDs:", error);
  }
}

export async function removeDeletedWordIds(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    if (!isNativePlatform()) {
      const existing = await getDeletedWordIds();
      const filtered = existing.filter(id => !ids.includes(id));
      await AsyncStorage.setItem(STORAGE_KEYS.DELETED_WORD_IDS, JSON.stringify(filtered));
      return;
    }
    await deleteDeletedWordsByIds(ids);
  } catch (error) {
    console.error("Failed to remove deleted word IDs:", error);
  }
}

export async function addWord(word: Omit<Word, "id">): Promise<Word> {
  if (!isNativePlatform()) {
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
  
  if (!isNativePlatform()) {
    const userWordIndex = dict.words.findIndex((w) => w.id === word.id);
    if (userWordIndex >= 0) {
      dict.words[userWordIndex] = word;
    } else {
      dict.editedWords[word.id] = word;
    }
    await saveUserDictionary(dict);
    return;
  }
  const existingWord = dict.words.find(w => w.id === word.id);
  if (existingWord && isCustomWordId(word.id)) {
    const dbId = word.id - 1000;
    await updateWordInDictionaryDB({
      id: dbId,
      english: word.english,
      mongolian: word.mongolian,
      pronunciation: word.pronunciation,
      category: word.category,
    });
    return;
  }

  await saveWordOverride(word);
}

export async function getUpdatedWord(wordId: number, baseWord: Word): Promise<Word> {
  const dict = await getUserDictionary();
  const userWord = dict.words.find(w => w.id === wordId);
  if (userWord) {
    return userWord;
  }
  if (!isNativePlatform()) {
    const edited = dict.editedWords[wordId];
    return edited ?? baseWord;
  }
  const override = await getWordOverride(wordId);
  return override ?? baseWord;
}

export type WordSourceInfo =
  | { type: "custom" }
  | { type: "pack"; packId: string; packTitle: string; packVersion: number }
  | { type: "base" }
  | { type: "bundle" }
  | { type: "unknown" };

export async function getWordSourceInfo(wordId: number): Promise<WordSourceInfo> {
  const dict = await getUserDictionary();
  if (dict.words.some(w => w.id === wordId) || isCustomWordId(wordId)) {
    return { type: "custom" };
  }

  const accepted = await getAcceptedPacks();
  for (const pack of accepted) {
    const words = getPackWords(pack.id, pack.version);
    if (words.some(w => w.id === wordId)) {
      const meta = PACKS.find(p => p.id === pack.id);
      return {
        type: "pack",
        packId: pack.id,
        packTitle: meta?.title ?? pack.id,
        packVersion: pack.version,
      };
    }
  }

  if (dictionary.some(w => w.id === wordId)) {
    return { type: "base" };
  }

  if (isBundleWordId(wordId)) {
    return { type: "bundle" };
  }

  return { type: "unknown" };
}

export async function deleteWord(wordId: number): Promise<void> {
  const dict = await getUserDictionary();
  
  if (!isNativePlatform()) {
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
    if (dict.editedWords[wordId]) {
      delete dict.editedWords[wordId];
      await saveUserDictionary(dict);
    }
    const confidence = await getWordConfidence();
    if (confidence[wordId]) {
      delete confidence[wordId];
      await saveWordConfidence(confidence);
    }
    return;
  }

  const userWord = dict.words.find(w => w.id === wordId);
  
  if (userWord) {
    const dbId = wordId - 1000;
    await removeWordFromDictionaryDB(dbId);
  } else {
    await addDeletedWordDB(wordId);
  }
  
  await removeWordOverride(wordId);
  
  await deleteWordConfidenceLevel(wordId);
}

export type BundleStateMap = Record<string, number>;

async function getBundleMapFromAsync(key: string): Promise<BundleStateMap> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as BundleStateMap) : {};
  } catch {
    return {};
  }
}

async function setBundleMapToAsync(key: string, map: BundleStateMap): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(map));
  } catch (error) {
    console.error("Failed to save bundle map:", error);
  }
}

export async function getBundleAppliedMap(): Promise<BundleStateMap> {
  try {
    if (!isNativePlatform()) {
      return getBundleMapFromAsync(STORAGE_KEYS.BUNDLE_APPLIED);
    }
    const packStatus = await getPackStatusFromDB();
    const result: BundleStateMap = {};
    for (const [packId, data] of Object.entries(packStatus)) {
      if (data.status === "accepted") {
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
    if (!isNativePlatform()) {
      return getBundleMapFromAsync(STORAGE_KEYS.BUNDLE_DISMISSED);
    }
    const packStatus = await getPackStatusFromDB();
    const result: BundleStateMap = {};
    for (const [packId, data] of Object.entries(packStatus)) {
      if (data.status === "dismissed") {
        result[packId] = Date.now();
      }
    }
    return result;
  } catch {
    return {};
  }
}

export async function markBundleApplied(bundleId: string): Promise<void> {
  if (!isNativePlatform()) {
    const map = await getBundleAppliedMap();
    map[bundleId] = Date.now();
    await setBundleMapToAsync(STORAGE_KEYS.BUNDLE_APPLIED, map);
    return;
  }
  await setPackStatusDB(bundleId, "accepted");
}

export async function markBundleDismissed(bundleId: string): Promise<void> {
  if (!isNativePlatform()) {
    const map = await getBundleDismissedMap();
    map[bundleId] = Date.now();
    await setBundleMapToAsync(STORAGE_KEYS.BUNDLE_DISMISSED, map);
    return;
  }
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
    const today = getDateString(new Date());

    if (!isNativePlatform()) {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA);
      if (stored) {
        const data = JSON.parse(stored) as StreakData;
        if (data.streakFreezeUsedDate && !isSameWeek(data.streakFreezeUsedDate, today)) {
          data.streakFreezeAvailable = true;
          data.streakFreezeUsedDate = null;
          await saveStreakData(data);
        }
        return data;
      }
      return getDefaultStreakData();
    }

    const data = await getStreakDataFromDB();
    
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
    if (!isNativePlatform()) {
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(data));
      return;
    }
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
    
    if (!isNativePlatform()) {
      await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_PROGRESS);
      await AsyncStorage.removeItem(STORAGE_KEYS.EXTRA_WORDS_SESSION);
    } else {
      await clearDailyProgressDB();
      await clearExtraWordsSessionDB();
    }
    
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

export function getWeekDays(
  referenceDate: Date = new Date(),
  dayLabels: string[] = ["S", "M", "T", "W", "T", "F", "S"]
): { date: string; dayLabel: string }[] {
  const days: { date: string; dayLabel: string }[] = [];
  
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
  const checkDate = parseDateStringLocal(dateString);
  
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
    if (!isNativePlatform()) {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACCEPTED_PACKS);
      return raw ? (JSON.parse(raw) as AcceptedPack[]) : [];
    }
    const packStatus = await getPackStatusFromDB();
    const result: AcceptedPack[] = [];
    for (const [packId, data] of Object.entries(packStatus)) {
      if (data.status === "accepted") {
        result.push({ id: packId, version: data.version });
      }
    }
    return result;
  } catch {
    return [];
  }
}

export async function saveAcceptedPacks(packs: AcceptedPack[]): Promise<void> {
  try {
    if (!isNativePlatform()) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCEPTED_PACKS, JSON.stringify(packs));
      return;
    }
    for (const pack of packs) {
      await setPackStatusDB(pack.id, "accepted");
    }
  } catch (error) {
    console.error("Failed to save accepted packs:", error);
  }
}

function getPackWordMap(packId: string, version: number): Record<number, Word> {
  const words = getPackWords(packId, version);
  const map: Record<number, Word> = {};
  for (const w of words) {
    map[w.id] = w;
  }
  return map;
}

function getWordDiffIds(oldMap: Record<number, Word>, newMap: Record<number, Word>): {
  removed: number[];
  changed: number[];
} {
  const removed: number[] = [];
  const changed: number[] = [];
  for (const [idStr, oldWord] of Object.entries(oldMap)) {
    const id = parseInt(idStr, 10);
    const newWord = newMap[id];
    if (!newWord) {
      removed.push(id);
      continue;
    }
    if (
      oldWord.english !== newWord.english ||
      oldWord.mongolian !== newWord.mongolian ||
      oldWord.pronunciation !== newWord.pronunciation ||
      oldWord.category !== newWord.category
    ) {
      changed.push(id);
    }
  }
  return { removed, changed };
}

async function transferConfidence(oldId: number, newId: number): Promise<void> {
  const confidence = await getWordConfidence();
  const level = confidence[oldId];
  if (!level) return;
  if (!isNativePlatform()) {
    delete confidence[oldId];
    confidence[newId] = level;
    await saveWordConfidence(confidence);
    return;
  }
  await deleteWordConfidenceLevel(oldId);
  await saveWordConfidenceToDB(newId, level);
}

export async function getPackModificationSummary(packId: string, version: number): Promise<{
  hasEdits: boolean;
  hasDeletions: boolean;
}> {
  const [overrides, deleted] = await Promise.all([
    getWordOverrides(),
    getDeletedWordIds(),
  ]);
  const packWords = getPackWords(packId, version);
  const ids = new Set(packWords.map(w => w.id));
  let hasEdits = false;
  let hasDeletions = false;

  for (const id of ids) {
    if (!hasEdits && overrides[id]) hasEdits = true;
    if (!hasDeletions && deleted.includes(id)) hasDeletions = true;
    if (hasEdits && hasDeletions) break;
  }

  return { hasEdits, hasDeletions };
}

export type PackUpgradeMode = "reset" | "new_words";

export async function upgradePack(
  packId: string,
  newVersion: number,
  mode: PackUpgradeMode
): Promise<{
  addedCustom: number;
  removedOverrides: number;
  restoredDeletes: number;
  resetConfidences: number;
}> {
  const accepted = await getAcceptedPacks();
  const current = accepted.find(p => p.id === packId);
  const oldVersion = current?.version ?? newVersion;

  const oldMap = getPackWordMap(packId, oldVersion);
  const newMap = getPackWordMap(packId, newVersion);
  const { removed, changed } = getWordDiffIds(oldMap, newMap);

  const overrides = await getWordOverrides();
  let addedCustom = 0;
  let removedOverrides = 0;
  let restoredDeletes = 0;
  let resetConfidences = 0;
  const removedOverrideIds = new Set<number>();

  for (const id of removed) {
    const override = overrides[id];
    if (override) {
      const newWord = await addWord({
        english: override.english,
        mongolian: override.mongolian,
        pronunciation: override.pronunciation,
        category: override.category,
      });
      await transferConfidence(id, newWord.id);
      await removeWordOverride(id);
      removedOverrideIds.add(id);
      removedOverrides += 1;
      addedCustom += 1;
    }
  }

  if (mode === "reset") {
    const oldIds = Object.keys(oldMap).map(id => parseInt(id, 10));
    const overrideIds = oldIds.filter(id => overrides[id] && !removedOverrideIds.has(id));
    await removeWordOverridesByIds(overrideIds);
    removedOverrides += overrideIds.length;

    const deletedIds = await getDeletedWordIds();
    const restoreIds = oldIds.filter(id => deletedIds.includes(id));
    await removeDeletedWordIds(restoreIds);
    restoredDeletes = restoreIds.length;

    for (const id of changed) {
      await deleteWordConfidenceLevel(id);
      resetConfidences += 1;
    }
  }

  await acceptPack(packId, newVersion);

  return { addedCustom, removedOverrides, restoredDeletes, resetConfidences };
}

export async function acceptPack(packId: string, version: number): Promise<void> {
  if (!isNativePlatform()) {
    const packs = await getAcceptedPacks();
    const existingIndex = packs.findIndex((p) => p.id === packId);
    if (existingIndex >= 0) {
      packs[existingIndex].version = version;
    } else {
      packs.push({ id: packId, version });
    }
    await saveAcceptedPacks(packs);
    return;
  }
  await setPackStatusDB(packId, "accepted", version);
}

export async function isPackAccepted(packId: string): Promise<AcceptedPack | null> {
  const packs = await getAcceptedPacks();
  return packs.find((p) => p.id === packId) ?? null;
}

export type DismissedPack = { id: string; version: number; timestamp: number };

export async function getDismissedPacks(): Promise<DismissedPack[]> {
  try {
    if (!isNativePlatform()) {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.DISMISSED_PACKS);
      return raw ? (JSON.parse(raw) as DismissedPack[]) : [];
    }
    const packStatus = await getPackStatusFromDB();
    const result: DismissedPack[] = [];
    for (const [packId, data] of Object.entries(packStatus)) {
      if (data.status === "dismissed") {
        result.push({ id: packId, version: data.version, timestamp: Date.now() });
      }
    }
    return result;
  } catch {
    return [];
  }
}

export async function saveDismissedPacks(packs: DismissedPack[]): Promise<void> {
  try {
    if (!isNativePlatform()) {
      await AsyncStorage.setItem(STORAGE_KEYS.DISMISSED_PACKS, JSON.stringify(packs));
      return;
    }
    for (const pack of packs) {
      await setPackStatusDB(pack.id, "dismissed");
    }
  } catch (error) {
    console.error("Failed to save dismissed packs:", error);
  }
}

export async function dismissPack(packId: string, version: number): Promise<void> {
  if (!isNativePlatform()) {
    const packs = await getDismissedPacks();
    const existingIndex = packs.findIndex((p) => p.id === packId);
    if (existingIndex >= 0) {
      packs[existingIndex] = { id: packId, version, timestamp: Date.now() };
    } else {
      packs.push({ id: packId, version, timestamp: Date.now() });
    }
    await saveDismissedPacks(packs);
    return;
  }
  await setPackStatusDB(packId, "dismissed", version);
}

export async function isPackDismissed(packId: string, version: number): Promise<boolean> {
  if (!isNativePlatform()) {
    const packs = await getDismissedPacks();
    const dismissed = packs.find((p) => p.id === packId);
    return dismissed ? dismissed.version === version : false;
  }
  const packStatus = await getPackStatusFromDB();
  const data = packStatus[packId];
  return data?.status === "dismissed" && data?.version === version;
}

export async function getOTAUpdatesEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.OTA_UPDATES_ENABLED);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setOTAUpdatesEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.OTA_UPDATES_ENABLED, enabled ? "true" : "false");
  } catch (error) {
    console.error("Failed to save OTA updates preference:", error);
  }
}

export async function getMongolModeEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.MONGOL_MODE_ENABLED);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setMongolModeEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MONGOL_MODE_ENABLED, enabled ? "true" : "false");
  } catch (error) {
    console.error("Failed to save Mongol mode preference:", error);
  }
}
