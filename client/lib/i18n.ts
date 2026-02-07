import type { PracticeMode } from "@/context/AppContext";

export type Locale = "en" | "mn";

const TRANSLATIONS = {
  en: {
    common: {
      english: "English",
      mongolian: "Mongolian",
      words: "words",
      day: "Day",
      close: "Close",
      done: "Done",
      confirm: "Confirm",
      cancel: "Cancel",
    },
    navigation: {
      today: "Today",
      dictionary: "Dictionary",
      settings: "Settings",
      appTitle: "Mongolian Vocab",
      dictionaryUpdates: "Dictionary Updates",
      addWord: "Add Word",
      editWord: "Edit Word",
    },
    settings: {
      appearance: "Appearance",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
      mongolMode: "Монгол Mode",
      mongolModeDescription: "Show app labels in Mongolian",
      dictionary: "Dictionary",
      autoDownload: "Auto-download New Packs",
      autoDownloadDescription: "Check for new word packs when online",
      debug: "Debug",
      resetToday: "Reset Today's Progress",
      about: "About",
      version: "Version",
      dictionarySize: "Dictionary Size",
      footerTitle: "Learn 5 new Mongolian words every day",
      footerSubtext: "All data stored locally on your device",
    },
    today: {
      allDoneTitle: "All Done for Today!",
      allDoneSubtitle: "You've completed both practice modes. Great work!",
      todaysWords: "Today's Words",
      extraPractice: "Extra Practice",
      extraPracticeComplete: "Extra practice complete!",
      extraWordsPractice: "Extra words practice",
      getNewWords: "Get 5 New Words",
      newWordsHint: "Practice more than your daily 5 words",
    },
    practice: {
      englishToMongolian: "English → Mongolian",
      mongolianToEnglish: "Mongolian → English",
      subtitleEnglishToMongolian: "See English, guess Mongolian",
      subtitleMongolianToEnglish: "See Mongolian, guess English",
      tapToReveal: "Tap to reveal",
    },
    completion: {
      allDone: "All Done!",
      modeComplete: "Mode Complete!",
      extraDone: "You've finished your extra practice. Amazing dedication!",
      bothDone: "You've completed both modes for today. Outstanding work!",
      finishedMode: "You've finished {mode}. Keep going!",
      streakSaved: "Streak Saved!",
      usedFreeze: "You used your streak freeze",
      startingNew: "Starting a new streak!",
      keepMomentum: "Keep the momentum going!",
      continue: "Continue",
    },
    streak: {
      title: "Streak",
      startMessage: "Start your journey! Practice 5 words today.",
      riskMessage: "Practice today to keep your streak alive!",
      safeMessage: "You're on a roll! Come back tomorrow to continue.",
      longest: "Longest Streak",
      freezeAvailable: "Freeze Available",
      info: "Practice at least 5 words daily to maintain your streak. Miss a day? Practice 10 words the next day to use your streak freeze!",
    },
    dictionary: {
      searchPlaceholder: "Search words...",
      noWords: "No words found",
      tryDifferent: "Try a different search term",
    },
    dictionaryUpdates: {
      added: "Added",
      updateVersion: "Update v{from} → v{to}",
      dismissed: "Dismissed",
      preview: "Preview",
      update: "Update",
      add: "Add",
      newWordsOnly: "New Words Only",
      resetPack: "Reset Pack",
      updatesAvailable: "Updates Available",
      availablePacks: "Available Packs",
      addedToDictionary: "Added to Dictionary",
      dismissedSection: "Dismissed",
      resultAdded: "{packTitle} added ({wordCount})",
      resultUpdated: "{packTitle} updated",
      emptyTitle: "No Dictionary Packs",
      emptySubtitle: "New vocabulary packs will appear here when available",
      versionLabel: "Version {version}",
      addWordsToDictionary: "Add {wordCount} to Dictionary",
    },
    editWord: {
      save: "Save",
      confidenceLevel: "Confidence Level",
      sourceLabel: "Source",
      sourcePack: "Pack • {pack} (v{version})",
      sourceBase: "Base Dictionary",
      sourceCustom: "Custom Word",
      sourceBundle: "Bundled Words",
      sourceUnknown: "Unknown",
      englishLabel: "English",
      mongolianLabel: "Mongolian",
      pronunciationLabel: "Pronunciation",
      categoryLabel: "Category",
      englishPlaceholder: "Enter English word or phrase",
      mongolianPlaceholder: "Enter Mongolian translation",
      pronunciationPlaceholder: "How to pronounce (optional)",
      deleteWord: "Delete Word",
      deleteTitle: "Delete Word",
      deleteMessage: "Are you sure you want to delete \"{word}\"? This action cannot be undone.",
      deleteConfirm: "Delete",
      cancel: "Cancel",
      requiredTitle: "Required Fields",
      requiredMessage: "Please fill in both English and Mongolian fields.",
      ok: "OK",
    },
    confidence: {
      learning: "Learning",
      familiar: "Familiar",
      mastered: "Mastered",
      firstTime: "First Time!",
      question: "How well do you know this?",
      skip: "Skip",
    },
    progress: {
      completed: "{progress}/{total} completed",
    },
    error: {
      title: "Something went wrong",
      message: "Please reload the app to continue.",
      tryAgain: "Try Again",
      details: "Error Details",
      errorLabel: "Error",
      stackTraceLabel: "Stack Trace",
    },
  },
  mn: {
    common: {
      english: "Англи",
      mongolian: "Монгол",
      words: "үг",
      day: "өдөр",
      close: "Хаах",
      done: "Болсон",
      confirm: "Батлах",
      cancel: "Цуцлах",
    },
    navigation: {
      today: "Өнөөдөр",
      dictionary: "Толь бичиг",
      settings: "Тохиргоо",
      appTitle: "Монгол үгс",
      dictionaryUpdates: "Толь бичгийн шинэчлэлт",
      addWord: "Үг нэмэх",
      editWord: "Үг засах",
    },
    settings: {
      appearance: "Харагдац",
      theme: "Сэдэв",
      light: "Гэрэлтэй",
      dark: "Харанхуй",
      system: "Систем",
      mongolMode: "Монгол Mode",
      mongolModeDescription: "Аппын шошгыг монголоор харуулах",
      dictionary: "Толь бичиг",
      autoDownload: "Шинэ багцуудыг автоматаар татах",
      autoDownloadDescription: "Интернэттэй үед шинэ үгийн багц шалгана",
      debug: "Шалгалт",
      resetToday: "Өнөөдрийн ахицийг дахин эхлүүлэх",
      about: "Тухай",
      version: "Хувилбар",
      dictionarySize: "Толь бичгийн хэмжээ",
      footerTitle: "Өдөр бүр 5 шинэ монгол үг сур",
      footerSubtext: "Бүх өгөгдөл таны төхөөрөмж дээр хадгалагдана",
    },
    today: {
      allDoneTitle: "Өнөөдөр дууслаа!",
      allDoneSubtitle: "Та өнөөдрийн хоёр дасгалын горимыг дуусгалаа. Сайн байна!",
      todaysWords: "Өнөөдрийн үгс",
      extraPractice: "Нэмэлт дасгал",
      extraPracticeComplete: "Нэмэлт дасгал дууслаа!",
      extraWordsPractice: "Нэмэлт үгийн дасгал",
      getNewWords: "5 шинэ үг авах",
      newWordsHint: "Өдөр тутмын 5 үгээс илүүг давт",
    },
    practice: {
      englishToMongolian: "Англи → Монгол",
      mongolianToEnglish: "Монгол → Англи",
      subtitleEnglishToMongolian: "Англи үгийг харж, монголоор таа",
      subtitleMongolianToEnglish: "Монгол үгийг харж, англиар таа",
      tapToReveal: "Дарж хариуг харна уу",
    },
    completion: {
      allDone: "Бүгд дууслаа!",
      modeComplete: "Горим дууслаа!",
      extraDone: "Нэмэлт дасгалаа дуусгалаа. Гайхалтай!",
      bothDone: "Өнөөдрийн хоёр горимыг дуусгалаа. Маш сайн!",
      finishedMode: "Та {mode}-ыг дуусгалаа. Үргэлжлүүлээрэй!",
      streakSaved: "Цувралыг аварлаа!",
      usedFreeze: "Та цувралын хамгаалалтаа ашиглалаа",
      startingNew: "Шинэ цуврал эхэллээ!",
      keepMomentum: "Эрчээ бүү алдаарай!",
      continue: "Үргэлжлүүлэх",
    },
    streak: {
      title: "Цуврал",
      startMessage: "Аяллаа эхлүүлээрэй! Өнөөдөр 5 үг давтаарай.",
      riskMessage: "Цувралаа хадгалахын тулд өнөөдөр давтаарай!",
      safeMessage: "Та маш сайн явж байна! Маргааш эргэж ирээрэй.",
      longest: "Хамгийн урт цуврал",
      freezeAvailable: "Хамгаалалт бэлэн",
      info: "Цувралаа хадгалахын тулд өдөр бүр дор хаяж 5 үг давтаарай. Нэг өдөр алгассан уу? Дараагийн өдөр 10 үг давтаж, хамгаалалтаа ашиглаарай!",
    },
    dictionary: {
      searchPlaceholder: "Үг хайх...",
      noWords: "Үг олдсонгүй",
      tryDifferent: "Өөр хайлтын үг ашиглаарай",
    },
    dictionaryUpdates: {
      added: "Нэмэгдсэн",
      updateVersion: "Шинэчлэх v{from} → v{to}",
      dismissed: "Татгалзсан",
      preview: "Урьдчилж харах",
      update: "Шинэчлэх",
      add: "Нэмэх",
      newWordsOnly: "Зөвхөн шинэ үгс",
      resetPack: "Багцыг сэргээх",
      updatesAvailable: "Шинэчлэлтүүд бэлэн",
      availablePacks: "Боломжтой багцууд",
      addedToDictionary: "Толь бичигт нэмсэн",
      dismissedSection: "Татгалзсан",
      resultAdded: "{packTitle} нэмэгдлээ ({wordCount})",
      resultUpdated: "{packTitle} шинэчлэгдлээ",
      emptyTitle: "Толь бичгийн багц алга",
      emptySubtitle: "Шинэ үгийн багцууд боломжтой болоход энд гарна",
      versionLabel: "Хувилбар {version}",
      addWordsToDictionary: "Толь бичигт {wordCount} нэмэх",
    },
    editWord: {
      save: "Хадгалах",
      confidenceLevel: "Итгэлцлийн түвшин",
      sourceLabel: "Эх сурвалж",
      sourcePack: "Багц • {pack} (v{version})",
      sourceBase: "Үндсэн толь бичиг",
      sourceCustom: "Өөрийн нэмсэн үг",
      sourceBundle: "Багц үгс",
      sourceUnknown: "Тодорхойгүй",
      englishLabel: "Англи",
      mongolianLabel: "Монгол",
      pronunciationLabel: "Дуудлага",
      categoryLabel: "Ангилал",
      englishPlaceholder: "Англи үг эсвэл хэллэг оруулна уу",
      mongolianPlaceholder: "Монгол орчуулга оруулна уу",
      pronunciationPlaceholder: "Дуудаж унших нь (заавал биш)",
      deleteWord: "Үг устгах",
      deleteTitle: "Үг устгах",
      deleteMessage: "\"{word}\" үгийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.",
      deleteConfirm: "Устгах",
      cancel: "Цуцлах",
      requiredTitle: "Заавал бөглөх талбарууд",
      requiredMessage: "Англи болон Монгол талбаруудыг бөглөнө үү.",
      ok: "За",
    },
    confidence: {
      learning: "Суралцаж байна",
      familiar: "Танил",
      mastered: "Сурчихсан",
      firstTime: "Анх удаа!",
      question: "Та үүнийг хэр сайн мэдэх вэ?",
      skip: "Алгасах",
    },
    progress: {
      completed: "{progress}/{total} дууссан",
    },
    error: {
      title: "Алдаа гарлаа",
      message: "Үргэлжлүүлэхийн тулд аппыг дахин ачаална уу.",
      tryAgain: "Дахин оролдох",
      details: "Алдааны дэлгэрэнгүй",
      errorLabel: "Алдаа",
      stackTraceLabel: "Стек мөр",
    },
  },
} as const;

const CATEGORY_LABELS: Record<Locale, Record<string, string>> = {
  en: {
    greetings: "Greetings",
    phrases: "Phrases",
    numbers: "Numbers",
    family: "Family",
    nature: "Nature",
    animals: "Animals",
    food: "Food",
    colors: "Colors",
    time: "Time",
    weather: "Weather",
    body: "Body",
    objects: "Objects",
    verbs: "Verbs",
    adjectives: "Adjectives",
    places: "Places",
    travel: "Travel",
    custom: "Custom",
  },
  mn: {
    greetings: "Мэндчилгээ",
    phrases: "Хэллэгүүд",
    numbers: "Тоонууд",
    family: "Гэр бүл",
    nature: "Байгаль",
    animals: "Амьтад",
    food: "Хоол хүнс",
    colors: "Өнгө",
    time: "Цаг хугацаа",
    weather: "Цаг агаар",
    body: "Бие",
    objects: "Эд зүйлс",
    verbs: "Үйл үг",
    adjectives: "Тэмдэг нэр",
    places: "Газрууд",
    travel: "Аялал",
    custom: "Өөрийн",
  },
};

const DAY_LABELS: Record<Locale, string[]> = {
  en: ["S", "M", "T", "W", "T", "F", "S"],
  mn: ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"],
};

export function getLocaleFromMongolMode(isMongolMode: boolean): Locale {
  return isMongolMode ? "mn" : "en";
}

export function getDateLocale(locale: Locale): string {
  return locale === "mn" ? "mn-MN" : "en-US";
}

function getTranslation(locale: Locale, key: string): string | undefined {
  const sections = key.split(".");
  let value: any = TRANSLATIONS[locale];
  for (const section of sections) {
    if (value && typeof value === "object" && section in value) {
      value = value[section];
    } else {
      return undefined;
    }
  }
  return typeof value === "string" ? value : undefined;
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const template = getTranslation(locale, key) ?? getTranslation("en", key) ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, token) => {
    const value = vars[token];
    return value === undefined ? `{${token}}` : String(value);
  });
}

export function formatWordCount(locale: Locale, count: number): string {
  if (locale === "mn") {
    return `${count} ${translate(locale, "common.words")}`;
  }
  const label = count === 1 ? "word" : translate(locale, "common.words");
  return `${count} ${label}`;
}

export function formatCompleted(locale: Locale, progress: number, total: number): string {
  return translate(locale, "progress.completed", { progress, total });
}

export function formatDayStreak(locale: Locale, count: number): string {
  if (locale === "mn") {
    return `${count} өдрийн цуврал!`;
  }
  const dayLabel = count === 1 ? translate(locale, "common.day") : `${translate(locale, "common.day")}s`;
  return `${count} ${dayLabel} Streak!`;
}

export function getModeLabel(locale: Locale, mode: PracticeMode): string {
  return translate(locale, mode === "englishToMongolian" ? "practice.englishToMongolian" : "practice.mongolianToEnglish");
}

export function getModeSubtitle(locale: Locale, mode: PracticeMode): string {
  return translate(locale, mode === "englishToMongolian" ? "practice.subtitleEnglishToMongolian" : "practice.subtitleMongolianToEnglish");
}

export function getCategoryLabel(locale: Locale, category: string): string {
  return CATEGORY_LABELS[locale][category] ?? category;
}

export function getDayLabels(locale: Locale): string[] {
  return DAY_LABELS[locale];
}
