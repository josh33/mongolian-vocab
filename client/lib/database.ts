import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "mongolian_vocab.db";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await initializeTables(db);
  }
  return db;
}

async function initializeTables(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS streak_data (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_completed_date TEXT,
      streak_freeze_available INTEGER NOT NULL DEFAULT 1,
      streak_freeze_used_date TEXT
    );

    CREATE TABLE IF NOT EXISTS streak_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      words_completed INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS word_confidence (
      word_id INTEGER PRIMARY KEY,
      level TEXT NOT NULL DEFAULT 'learning'
    );

    CREATE TABLE IF NOT EXISTS user_dictionary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      english TEXT NOT NULL,
      mongolian TEXT NOT NULL,
      pronunciation TEXT,
      category TEXT NOT NULL DEFAULT 'custom',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS deleted_words (
      word_id INTEGER PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS pack_status (
      pack_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_progress (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      date TEXT NOT NULL,
      english_to_mongolian_completed INTEGER NOT NULL DEFAULT 0,
      mongolian_to_english_completed INTEGER NOT NULL DEFAULT 0,
      english_to_mongolian_progress TEXT NOT NULL DEFAULT '[]',
      mongolian_to_english_progress TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS extra_words_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      session_id TEXT NOT NULL,
      date TEXT NOT NULL,
      words TEXT NOT NULL,
      english_to_mongolian_completed INTEGER NOT NULL DEFAULT 0,
      mongolian_to_english_completed INTEGER NOT NULL DEFAULT 0,
      english_to_mongolian_progress TEXT NOT NULL DEFAULT '[]',
      mongolian_to_english_progress TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS migration_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      migrated_from_async_storage INTEGER NOT NULL DEFAULT 0,
      migration_date TEXT
    );

    INSERT OR IGNORE INTO streak_data (id, current_streak, longest_streak, streak_freeze_available) 
    VALUES (1, 0, 0, 1);
  `);
}

export interface StreakDataRow {
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  streak_freeze_available: number;
  streak_freeze_used_date: string | null;
}

export interface StreakHistoryRow {
  date: string;
  status: string;
  words_completed: number;
}

export interface WordConfidenceRow {
  word_id: number;
  level: string;
}

export interface UserDictionaryRow {
  id: number;
  english: string;
  mongolian: string;
  pronunciation: string | null;
  category: string;
  created_at: string;
}

export interface DailyProgressRow {
  date: string;
  english_to_mongolian_completed: number;
  mongolian_to_english_completed: number;
  english_to_mongolian_progress: string;
  mongolian_to_english_progress: string;
}

export interface ExtraWordsSessionRow {
  session_id: string;
  date: string;
  words: string;
  english_to_mongolian_completed: number;
  mongolian_to_english_completed: number;
  english_to_mongolian_progress: string;
  mongolian_to_english_progress: string;
}

export async function getStreakDataFromDB(): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  streakFreezeAvailable: boolean;
  streakFreezeUsedDate: string | null;
  history: Array<{ date: string; status: string; wordsCompleted: number }>;
}> {
  const database = await getDatabase();
  
  const streakRow = await database.getFirstAsync<StreakDataRow>(
    "SELECT * FROM streak_data WHERE id = 1"
  );
  
  const historyRows = await database.getAllAsync<StreakHistoryRow>(
    "SELECT date, status, words_completed FROM streak_history ORDER BY date DESC LIMIT 30"
  );
  
  return {
    currentStreak: streakRow?.current_streak ?? 0,
    longestStreak: streakRow?.longest_streak ?? 0,
    lastCompletedDate: streakRow?.last_completed_date ?? null,
    streakFreezeAvailable: (streakRow?.streak_freeze_available ?? 1) === 1,
    streakFreezeUsedDate: streakRow?.streak_freeze_used_date ?? null,
    history: historyRows.map(row => ({
      date: row.date,
      status: row.status,
      wordsCompleted: row.words_completed,
    })),
  };
}

export async function saveStreakDataToDB(data: {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  streakFreezeAvailable: boolean;
  streakFreezeUsedDate: string | null;
  history: Array<{ date: string; status: string; wordsCompleted: number }>;
}): Promise<void> {
  const database = await getDatabase();
  
  await database.runAsync(
    `UPDATE streak_data SET 
      current_streak = ?, 
      longest_streak = ?, 
      last_completed_date = ?,
      streak_freeze_available = ?,
      streak_freeze_used_date = ?
    WHERE id = 1`,
    [
      data.currentStreak,
      data.longestStreak,
      data.lastCompletedDate,
      data.streakFreezeAvailable ? 1 : 0,
      data.streakFreezeUsedDate,
    ]
  );
  
  for (const record of data.history) {
    await database.runAsync(
      `INSERT OR REPLACE INTO streak_history (date, status, words_completed) VALUES (?, ?, ?)`,
      [record.date, record.status, record.wordsCompleted]
    );
  }
}

export async function getWordConfidenceFromDB(): Promise<Record<number, string>> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<WordConfidenceRow>(
    "SELECT word_id, level FROM word_confidence"
  );
  
  const result: Record<number, string> = {};
  for (const row of rows) {
    result[row.word_id] = row.level;
  }
  return result;
}

export async function saveWordConfidenceToDB(wordId: number, level: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR REPLACE INTO word_confidence (word_id, level) VALUES (?, ?)",
    [wordId, level]
  );
}

export async function getUserDictionaryFromDB(): Promise<UserDictionaryRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<UserDictionaryRow>(
    "SELECT * FROM user_dictionary ORDER BY created_at DESC"
  );
}

export async function addWordToDictionaryDB(word: {
  english: string;
  mongolian: string;
  pronunciation?: string;
  category?: string;
}): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    "INSERT INTO user_dictionary (english, mongolian, pronunciation, category) VALUES (?, ?, ?, ?)",
    [word.english, word.mongolian, word.pronunciation ?? null, word.category ?? "custom"]
  );
  return result.lastInsertRowId;
}

export async function removeWordFromDictionaryDB(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM user_dictionary WHERE id = ?", [id]);
}

export async function getDeletedWordIdsFromDB(): Promise<number[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ word_id: number }>(
    "SELECT word_id FROM deleted_words"
  );
  return rows.map(row => row.word_id);
}

export async function addDeletedWordDB(wordId: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR IGNORE INTO deleted_words (word_id) VALUES (?)",
    [wordId]
  );
}

export async function getPackStatusFromDB(): Promise<Record<string, "accepted" | "dismissed">> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ pack_id: string; status: string }>(
    "SELECT pack_id, status FROM pack_status"
  );
  
  const result: Record<string, "accepted" | "dismissed"> = {};
  for (const row of rows) {
    result[row.pack_id] = row.status as "accepted" | "dismissed";
  }
  return result;
}

export async function setPackStatusDB(packId: string, status: "accepted" | "dismissed"): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT OR REPLACE INTO pack_status (pack_id, status, updated_at) VALUES (?, ?, datetime('now'))",
    [packId, status]
  );
}

export async function getDailyProgressFromDB(): Promise<DailyProgressRow | null> {
  const database = await getDatabase();
  return database.getFirstAsync<DailyProgressRow>(
    "SELECT * FROM daily_progress WHERE id = 1"
  );
}

export async function saveDailyProgressToDB(progress: {
  date: string;
  englishToMongolianCompleted: boolean;
  mongolianToEnglishCompleted: boolean;
  englishToMongolianProgress: number[];
  mongolianToEnglishProgress: number[];
}): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO daily_progress 
      (id, date, english_to_mongolian_completed, mongolian_to_english_completed, 
       english_to_mongolian_progress, mongolian_to_english_progress)
    VALUES (1, ?, ?, ?, ?, ?)`,
    [
      progress.date,
      progress.englishToMongolianCompleted ? 1 : 0,
      progress.mongolianToEnglishCompleted ? 1 : 0,
      JSON.stringify(progress.englishToMongolianProgress),
      JSON.stringify(progress.mongolianToEnglishProgress),
    ]
  );
}

export async function clearDailyProgressDB(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM daily_progress WHERE id = 1");
}

export async function getExtraWordsSessionFromDB(): Promise<ExtraWordsSessionRow | null> {
  const database = await getDatabase();
  return database.getFirstAsync<ExtraWordsSessionRow>(
    "SELECT * FROM extra_words_session WHERE id = 1"
  );
}

export async function saveExtraWordsSessionToDB(session: {
  sessionId: string;
  date: string;
  words: unknown[];
  englishToMongolianCompleted: boolean;
  mongolianToEnglishCompleted: boolean;
  englishToMongolianProgress: number[];
  mongolianToEnglishProgress: number[];
}): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO extra_words_session 
      (id, session_id, date, words, english_to_mongolian_completed, mongolian_to_english_completed,
       english_to_mongolian_progress, mongolian_to_english_progress)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.sessionId,
      session.date,
      JSON.stringify(session.words),
      session.englishToMongolianCompleted ? 1 : 0,
      session.mongolianToEnglishCompleted ? 1 : 0,
      JSON.stringify(session.englishToMongolianProgress),
      JSON.stringify(session.mongolianToEnglishProgress),
    ]
  );
}

export async function clearExtraWordsSessionDB(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync("DELETE FROM extra_words_session WHERE id = 1");
}

export async function hasMigratedFromAsyncStorage(): Promise<boolean> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ migrated_from_async_storage: number }>(
    "SELECT migrated_from_async_storage FROM migration_status WHERE id = 1"
  );
  return (row?.migrated_from_async_storage ?? 0) === 1;
}

export async function markMigrationComplete(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO migration_status (id, migrated_from_async_storage, migration_date) 
     VALUES (1, 1, datetime('now'))`
  );
}
