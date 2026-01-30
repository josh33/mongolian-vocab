import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Word, getDailyWords, dictionary, shuffleArray } from "@/data/dictionary";
import {
  DailyProgress,
  ExtraWordsSession,
  getDailyProgress,
  saveDailyProgress,
  getExtraWordsSession,
  saveExtraWordsSession,
  clearExtraWordsSession,
  getThemePreference,
  saveThemePreference,
  deleteWord,
  getDeletedWordIds,
  getUserDictionary,
} from "@/lib/storage";

export type PracticeMode = "englishToMongolian" | "mongolianToEnglish";

interface AppContextType {
  dailyWords: Word[];
  dailyProgress: DailyProgress;
  extraSession: ExtraWordsSession | null;
  themePreference: "light" | "dark" | "system";
  isLoading: boolean;
  setThemePreference: (theme: "light" | "dark" | "system") => Promise<void>;
  markCardCompleted: (mode: PracticeMode, wordId: number, isExtra?: boolean) => Promise<void>;
  markModeCompleted: (mode: PracticeMode, isExtra?: boolean) => Promise<void>;
  getWordsForMode: (mode: PracticeMode, isExtra?: boolean) => Word[];
  getProgressForMode: (mode: PracticeMode, isExtra?: boolean) => number[];
  isModeCompleted: (mode: PracticeMode, isExtra?: boolean) => boolean;
  isBothModesCompleted: (isExtra?: boolean) => boolean;
  requestNewWords: () => Promise<void>;
  hasExtraSession: boolean;
  refreshProgress: () => Promise<void>;
  deleteWordDuringStudy: (wordId: number, isExtra: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dailyWords, setDailyWords] = useState<Word[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: "",
    englishToMongolianCompleted: false,
    mongolianToEnglishCompleted: false,
    englishToMongolianProgress: [],
    mongolianToEnglishProgress: [],
  });
  const [extraSession, setExtraSession] = useState<ExtraWordsSession | null>(null);
  const [themePreference, setThemePref] = useState<"light" | "dark" | "system">("system");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [progress, extra, theme] = await Promise.all([
        getDailyProgress(),
        getExtraWordsSession(),
        getThemePreference(),
      ]);
      
      const words = getDailyWords(new Date(), 5);
      setDailyWords(words);
      setDailyProgress(progress);
      setExtraSession(extra);
      setThemePref(theme);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshProgress = useCallback(async () => {
    const [progress, extra] = await Promise.all([
      getDailyProgress(),
      getExtraWordsSession(),
    ]);
    setDailyProgress(progress);
    setExtraSession(extra);
  }, []);

  const setThemePreference = useCallback(async (theme: "light" | "dark" | "system") => {
    setThemePref(theme);
    await saveThemePreference(theme);
  }, []);

  const markCardCompleted = useCallback(async (mode: PracticeMode, wordId: number, isExtra = false) => {
    const progressKey = mode === "englishToMongolian" ? "englishToMongolianProgress" : "mongolianToEnglishProgress";
    
    if (isExtra) {
      setExtraSession(prev => {
        if (!prev) return prev;
        const currentProgress = prev[progressKey];
        if (currentProgress.includes(wordId)) return prev;
        
        const updatedSession = {
          ...prev,
          [progressKey]: [...currentProgress, wordId],
        };
        saveExtraWordsSession(updatedSession);
        return updatedSession;
      });
    } else {
      setDailyProgress(prev => {
        const currentProgress = prev[progressKey];
        if (currentProgress.includes(wordId)) return prev;
        
        const updatedProgress = {
          ...prev,
          [progressKey]: [...currentProgress, wordId],
        };
        saveDailyProgress(updatedProgress);
        return updatedProgress;
      });
    }
  }, []);

  const markModeCompleted = useCallback(async (mode: PracticeMode, isExtra = false) => {
    if (isExtra && extraSession) {
      const completedKey = mode === "englishToMongolian" ? "englishToMongolianCompleted" : "mongolianToEnglishCompleted";
      const updatedSession = {
        ...extraSession,
        [completedKey]: true,
      };
      setExtraSession(updatedSession);
      await saveExtraWordsSession(updatedSession);
    } else {
      const completedKey = mode === "englishToMongolian" ? "englishToMongolianCompleted" : "mongolianToEnglishCompleted";
      const updatedProgress = {
        ...dailyProgress,
        [completedKey]: true,
      };
      setDailyProgress(updatedProgress);
      await saveDailyProgress(updatedProgress);
    }
  }, [dailyProgress, extraSession]);

  const getWordsForMode = useCallback((mode: PracticeMode, isExtra = false): Word[] => {
    const words = isExtra && extraSession ? extraSession.words : dailyWords;
    const seed = mode === "englishToMongolian" ? 12345 : 67890;
    return shuffleArray(words, seed + (isExtra ? 11111 : 0));
  }, [dailyWords, extraSession]);

  const getProgressForMode = useCallback((mode: PracticeMode, isExtra = false): number[] => {
    if (isExtra && extraSession) {
      return mode === "englishToMongolian" 
        ? extraSession.englishToMongolianProgress 
        : extraSession.mongolianToEnglishProgress;
    }
    return mode === "englishToMongolian" 
      ? dailyProgress.englishToMongolianProgress 
      : dailyProgress.mongolianToEnglishProgress;
  }, [dailyProgress, extraSession]);

  const isModeCompleted = useCallback((mode: PracticeMode, isExtra = false): boolean => {
    if (isExtra && extraSession) {
      return mode === "englishToMongolian" 
        ? extraSession.englishToMongolianCompleted 
        : extraSession.mongolianToEnglishCompleted;
    }
    return mode === "englishToMongolian" 
      ? dailyProgress.englishToMongolianCompleted 
      : dailyProgress.mongolianToEnglishCompleted;
  }, [dailyProgress, extraSession]);

  const isBothModesCompleted = useCallback((isExtra = false): boolean => {
    if (isExtra && extraSession) {
      return extraSession.englishToMongolianCompleted && extraSession.mongolianToEnglishCompleted;
    }
    return dailyProgress.englishToMongolianCompleted && dailyProgress.mongolianToEnglishCompleted;
  }, [dailyProgress, extraSession]);

  const requestNewWords = useCallback(async () => {
    await clearExtraWordsSession();
    
    const existingIds = new Set(dailyWords.map(w => w.id));
    const availableWords = dictionary.filter(w => !existingIds.has(w.id));
    const newWords = shuffleArray(availableWords, Date.now()).slice(0, 5);
    
    const newSession: ExtraWordsSession = {
      sessionId: Date.now().toString(),
      words: newWords,
      englishToMongolianCompleted: false,
      mongolianToEnglishCompleted: false,
      englishToMongolianProgress: [],
      mongolianToEnglishProgress: [],
    };
    
    setExtraSession(newSession);
    await saveExtraWordsSession(newSession);
  }, [dailyWords]);

  const deleteWordDuringStudy = useCallback(async (wordId: number, isExtra: boolean) => {
    await deleteWord(wordId);
    
    const [deletedIds, userDict] = await Promise.all([
      getDeletedWordIds(),
      getUserDictionary(),
    ]);
    
    if (isExtra && extraSession) {
      const remainingWords = extraSession.words.filter(w => w.id !== wordId);
      const existingIds = new Set([...dailyWords.map(w => w.id), ...remainingWords.map(w => w.id)]);
      
      const availableWords = dictionary
        .filter(w => !existingIds.has(w.id) && !deletedIds.includes(w.id))
        .concat(userDict.words.filter(w => !existingIds.has(w.id)));
      
      const replacementWord = shuffleArray(availableWords, Date.now()).slice(0, 1);
      const updatedWords = [...remainingWords, ...replacementWord];
      
      const updatedSession: ExtraWordsSession = {
        ...extraSession,
        words: updatedWords,
      };
      
      setExtraSession(updatedSession);
      await saveExtraWordsSession(updatedSession);
    } else {
      const remainingDailyWords = dailyWords.filter(w => w.id !== wordId);
      const existingIds = new Set(remainingDailyWords.map(w => w.id));
      
      const availableWords = dictionary
        .filter(w => !existingIds.has(w.id) && !deletedIds.includes(w.id))
        .concat(userDict.words.filter(w => !existingIds.has(w.id)));
      
      const replacementWord = shuffleArray(availableWords, Date.now()).slice(0, 1);
      const updatedDailyWords = [...remainingDailyWords, ...replacementWord];
      
      setDailyWords(updatedDailyWords);
      
    }
  }, [dailyWords, dailyProgress, extraSession]);

  const value: AppContextType = {
    dailyWords,
    dailyProgress,
    extraSession,
    themePreference,
    isLoading,
    setThemePreference,
    markCardCompleted,
    markModeCompleted,
    getWordsForMode,
    getProgressForMode,
    isModeCompleted,
    isBothModesCompleted,
    requestNewWords,
    hasExtraSession: extraSession !== null,
    refreshProgress,
    deleteWordDuringStudy,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
