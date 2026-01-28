export interface Word {
  id: number;
  english: string;
  mongolian: string;
  pronunciation: string;
  category: string;
}

export const dictionary: Word[] = [
  // Greetings
  { id: 1, english: "Hello", mongolian: "Сайн байна уу", pronunciation: "Sain baina uu", category: "greetings" },
  { id: 2, english: "Good morning", mongolian: "Өглөөний мэнд", pronunciation: "Öglöönii mend", category: "greetings" },
  { id: 3, english: "Good evening", mongolian: "Оройн мэнд", pronunciation: "Oroin mend", category: "greetings" },
  { id: 4, english: "Goodbye", mongolian: "Баяртай", pronunciation: "Bayartai", category: "greetings" },
  { id: 5, english: "Thank you", mongolian: "Баярлалаа", pronunciation: "Bayarlalaa", category: "greetings" },
  { id: 6, english: "Please", mongolian: "Гуйя", pronunciation: "Guiya", category: "greetings" },
  { id: 7, english: "Yes", mongolian: "Тийм", pronunciation: "Tiim", category: "greetings" },
  { id: 8, english: "No", mongolian: "Үгүй", pronunciation: "Ügüi", category: "greetings" },
  { id: 9, english: "Excuse me", mongolian: "Уучлаарай", pronunciation: "Uuchlaarai", category: "greetings" },
  { id: 10, english: "How are you?", mongolian: "Сайн байна уу?", pronunciation: "Sain baina uu?", category: "greetings" },

  // Numbers 1-10
  { id: 11, english: "One", mongolian: "Нэг", pronunciation: "Neg", category: "numbers" },
  { id: 12, english: "Two", mongolian: "Хоёр", pronunciation: "Khoyor", category: "numbers" },
  { id: 13, english: "Three", mongolian: "Гурав", pronunciation: "Gurav", category: "numbers" },
  { id: 14, english: "Four", mongolian: "Дөрөв", pronunciation: "Döröv", category: "numbers" },
  { id: 15, english: "Five", mongolian: "Тав", pronunciation: "Tav", category: "numbers" },
  { id: 16, english: "Six", mongolian: "Зургаа", pronunciation: "Zurgaa", category: "numbers" },
  { id: 17, english: "Seven", mongolian: "Долоо", pronunciation: "Doloo", category: "numbers" },
  { id: 18, english: "Eight", mongolian: "Найм", pronunciation: "Naim", category: "numbers" },
  { id: 19, english: "Nine", mongolian: "Ес", pronunciation: "Yes", category: "numbers" },
  { id: 20, english: "Ten", mongolian: "Арав", pronunciation: "Arav", category: "numbers" },

  // Family terms
  { id: 21, english: "Mother", mongolian: "Ээж", pronunciation: "Eej", category: "family" },
  { id: 22, english: "Father", mongolian: "Аав", pronunciation: "Aav", category: "family" },
  { id: 23, english: "Sister", mongolian: "Эгч", pronunciation: "Egch", category: "family" },
  { id: 24, english: "Brother", mongolian: "Ах", pronunciation: "Akh", category: "family" },
  { id: 25, english: "Grandmother", mongolian: "Эмээ", pronunciation: "Emee", category: "family" },
  { id: 26, english: "Grandfather", mongolian: "Өвөө", pronunciation: "Övöö", category: "family" },
  { id: 27, english: "Child", mongolian: "Хүүхэд", pronunciation: "Khüükhed", category: "family" },
  { id: 28, english: "Son", mongolian: "Хүү", pronunciation: "Khüü", category: "family" },
  { id: 29, english: "Daughter", mongolian: "Охин", pronunciation: "Okhin", category: "family" },
  { id: 30, english: "Family", mongolian: "Гэр бүл", pronunciation: "Ger bül", category: "family" },

  // Nature
  { id: 31, english: "Sun", mongolian: "Нар", pronunciation: "Nar", category: "nature" },
  { id: 32, english: "Moon", mongolian: "Сар", pronunciation: "Sar", category: "nature" },
  { id: 33, english: "Star", mongolian: "Од", pronunciation: "Od", category: "nature" },
  { id: 34, english: "Sky", mongolian: "Тэнгэр", pronunciation: "Tenger", category: "nature" },
  { id: 35, english: "Mountain", mongolian: "Уул", pronunciation: "Uul", category: "nature" },
  { id: 36, english: "River", mongolian: "Гол", pronunciation: "Gol", category: "nature" },
  { id: 37, english: "Lake", mongolian: "Нуур", pronunciation: "Nuur", category: "nature" },
  { id: 38, english: "Tree", mongolian: "Мод", pronunciation: "Mod", category: "nature" },
  { id: 39, english: "Flower", mongolian: "Цэцэг", pronunciation: "Tsetseg", category: "nature" },
  { id: 40, english: "Grass", mongolian: "Өвс", pronunciation: "Övs", category: "nature" },

  // Animals
  { id: 41, english: "Horse", mongolian: "Морь", pronunciation: "Mor'", category: "animals" },
  { id: 42, english: "Sheep", mongolian: "Хонь", pronunciation: "Khon'", category: "animals" },
  { id: 43, english: "Goat", mongolian: "Ямаа", pronunciation: "Yamaa", category: "animals" },
  { id: 44, english: "Cow", mongolian: "Үнээ", pronunciation: "Ünee", category: "animals" },
  { id: 45, english: "Camel", mongolian: "Тэмээ", pronunciation: "Temee", category: "animals" },
  { id: 46, english: "Dog", mongolian: "Нохой", pronunciation: "Nokhoi", category: "animals" },
  { id: 47, english: "Cat", mongolian: "Муур", pronunciation: "Muur", category: "animals" },
  { id: 48, english: "Bird", mongolian: "Шувуу", pronunciation: "Shuvuu", category: "animals" },
  { id: 49, english: "Fish", mongolian: "Загас", pronunciation: "Zagas", category: "animals" },
  { id: 50, english: "Wolf", mongolian: "Чоно", pronunciation: "Chono", category: "animals" },

  // Food
  { id: 51, english: "Water", mongolian: "Ус", pronunciation: "Us", category: "food" },
  { id: 52, english: "Bread", mongolian: "Талх", pronunciation: "Talkh", category: "food" },
  { id: 53, english: "Meat", mongolian: "Мах", pronunciation: "Makh", category: "food" },
  { id: 54, english: "Milk", mongolian: "Сүү", pronunciation: "Süü", category: "food" },
  { id: 55, english: "Tea", mongolian: "Цай", pronunciation: "Tsai", category: "food" },
  { id: 56, english: "Salt", mongolian: "Давс", pronunciation: "Davs", category: "food" },
  { id: 57, english: "Sugar", mongolian: "Чихэр", pronunciation: "Chikher", category: "food" },
  { id: 58, english: "Butter", mongolian: "Масло", pronunciation: "Maslo", category: "food" },
  { id: 59, english: "Cheese", mongolian: "Бяслаг", pronunciation: "Byaslag", category: "food" },
  { id: 60, english: "Rice", mongolian: "Будаа", pronunciation: "Budaa", category: "food" },

  // Colors
  { id: 61, english: "White", mongolian: "Цагаан", pronunciation: "Tsagaan", category: "colors" },
  { id: 62, english: "Black", mongolian: "Хар", pronunciation: "Khar", category: "colors" },
  { id: 63, english: "Red", mongolian: "Улаан", pronunciation: "Ulaan", category: "colors" },
  { id: 64, english: "Blue", mongolian: "Цэнхэр", pronunciation: "Tsenkher", category: "colors" },
  { id: 65, english: "Green", mongolian: "Ногоон", pronunciation: "Nogoon", category: "colors" },
  { id: 66, english: "Yellow", mongolian: "Шар", pronunciation: "Shar", category: "colors" },
  { id: 67, english: "Gold", mongolian: "Алтан", pronunciation: "Altan", category: "colors" },
  { id: 68, english: "Silver", mongolian: "Мөнгөн", pronunciation: "Möngön", category: "colors" },
  { id: 69, english: "Brown", mongolian: "Бор", pronunciation: "Bor", category: "colors" },
  { id: 70, english: "Orange", mongolian: "Улбар шар", pronunciation: "Ulbar shar", category: "colors" },

  // Body parts
  { id: 71, english: "Head", mongolian: "Толгой", pronunciation: "Tolgoi", category: "body" },
  { id: 72, english: "Eye", mongolian: "Нүд", pronunciation: "Nüd", category: "body" },
  { id: 73, english: "Ear", mongolian: "Чих", pronunciation: "Chikh", category: "body" },
  { id: 74, english: "Nose", mongolian: "Хамар", pronunciation: "Khamar", category: "body" },
  { id: 75, english: "Mouth", mongolian: "Ам", pronunciation: "Am", category: "body" },
  { id: 76, english: "Hand", mongolian: "Гар", pronunciation: "Gar", category: "body" },
  { id: 77, english: "Foot", mongolian: "Хөл", pronunciation: "Khöl", category: "body" },
  { id: 78, english: "Heart", mongolian: "Зүрх", pronunciation: "Zürkh", category: "body" },
  { id: 79, english: "Tooth", mongolian: "Шүд", pronunciation: "Shüd", category: "body" },
  { id: 80, english: "Hair", mongolian: "Үс", pronunciation: "Üs", category: "body" },

  // Common verbs
  { id: 81, english: "To go", mongolian: "Явах", pronunciation: "Yavakh", category: "verbs" },
  { id: 82, english: "To come", mongolian: "Ирэх", pronunciation: "Irekh", category: "verbs" },
  { id: 83, english: "To eat", mongolian: "Идэх", pronunciation: "Idekh", category: "verbs" },
  { id: 84, english: "To drink", mongolian: "Уух", pronunciation: "Uukh", category: "verbs" },
  { id: 85, english: "To sleep", mongolian: "Унтах", pronunciation: "Untakh", category: "verbs" },
  { id: 86, english: "To see", mongolian: "Харах", pronunciation: "Kharakh", category: "verbs" },
  { id: 87, english: "To speak", mongolian: "Ярих", pronunciation: "Yarikh", category: "verbs" },
  { id: 88, english: "To listen", mongolian: "Сонсох", pronunciation: "Sonsokh", category: "verbs" },
  { id: 89, english: "To read", mongolian: "Унших", pronunciation: "Unshikh", category: "verbs" },
  { id: 90, english: "To write", mongolian: "Бичих", pronunciation: "Bichikh", category: "verbs" },

  // Places
  { id: 91, english: "House", mongolian: "Байшин", pronunciation: "Baishin", category: "places" },
  { id: 92, english: "Yurt", mongolian: "Гэр", pronunciation: "Ger", category: "places" },
  { id: 93, english: "City", mongolian: "Хот", pronunciation: "Khot", category: "places" },
  { id: 94, english: "Village", mongolian: "Тосгон", pronunciation: "Tosgon", category: "places" },
  { id: 95, english: "School", mongolian: "Сургууль", pronunciation: "Surguul'", category: "places" },
  { id: 96, english: "Hospital", mongolian: "Эмнэлэг", pronunciation: "Emneleg", category: "places" },
  { id: 97, english: "Market", mongolian: "Зах", pronunciation: "Zakh", category: "places" },
  { id: 98, english: "Road", mongolian: "Зам", pronunciation: "Zam", category: "places" },
  { id: 99, english: "Country", mongolian: "Улс", pronunciation: "Uls", category: "places" },
  { id: 100, english: "Mongolia", mongolian: "Монгол", pronunciation: "Mongol", category: "places" },

  // Time expressions
  { id: 101, english: "Today", mongolian: "Өнөөдөр", pronunciation: "Önöödör", category: "time" },
  { id: 102, english: "Tomorrow", mongolian: "Маргааш", pronunciation: "Margaash", category: "time" },
  { id: 103, english: "Yesterday", mongolian: "Өчигдөр", pronunciation: "Öchigdör", category: "time" },
  { id: 104, english: "Morning", mongolian: "Өглөө", pronunciation: "Öglöö", category: "time" },
  { id: 105, english: "Evening", mongolian: "Орой", pronunciation: "Oroi", category: "time" },
  { id: 106, english: "Night", mongolian: "Шөнө", pronunciation: "Shönö", category: "time" },
  { id: 107, english: "Day", mongolian: "Өдөр", pronunciation: "Ödör", category: "time" },
  { id: 108, english: "Week", mongolian: "Долоо хоног", pronunciation: "Doloo khonog", category: "time" },
  { id: 109, english: "Month", mongolian: "Сар", pronunciation: "Sar", category: "time" },
  { id: 110, english: "Year", mongolian: "Жил", pronunciation: "Jil", category: "time" },

  // Adjectives
  { id: 111, english: "Big", mongolian: "Том", pronunciation: "Tom", category: "adjectives" },
  { id: 112, english: "Small", mongolian: "Жижиг", pronunciation: "Jijig", category: "adjectives" },
  { id: 113, english: "Good", mongolian: "Сайн", pronunciation: "Sain", category: "adjectives" },
  { id: 114, english: "Bad", mongolian: "Муу", pronunciation: "Muu", category: "adjectives" },
  { id: 115, english: "Beautiful", mongolian: "Гоё", pronunciation: "Goyo", category: "adjectives" },
  { id: 116, english: "Hot", mongolian: "Халуун", pronunciation: "Khaluun", category: "adjectives" },
  { id: 117, english: "Cold", mongolian: "Хүйтэн", pronunciation: "Khüiten", category: "adjectives" },
  { id: 118, english: "New", mongolian: "Шинэ", pronunciation: "Shine", category: "adjectives" },
  { id: 119, english: "Old", mongolian: "Хуучин", pronunciation: "Khuuchin", category: "adjectives" },
  { id: 120, english: "Fast", mongolian: "Хурдан", pronunciation: "Khurdan", category: "adjectives" },

  // Additional words
  { id: 121, english: "Love", mongolian: "Хайр", pronunciation: "Khair", category: "feelings" },
  { id: 122, english: "Friend", mongolian: "Найз", pronunciation: "Naiz", category: "people" },
  { id: 123, english: "Person", mongolian: "Хүн", pronunciation: "Khün", category: "people" },
  { id: 124, english: "Man", mongolian: "Эрэгтэй", pronunciation: "Eregtei", category: "people" },
  { id: 125, english: "Woman", mongolian: "Эмэгтэй", pronunciation: "Emegtei", category: "people" },
  { id: 126, english: "Name", mongolian: "Нэр", pronunciation: "Ner", category: "basic" },
  { id: 127, english: "Book", mongolian: "Ном", pronunciation: "Nom", category: "objects" },
  { id: 128, english: "Money", mongolian: "Мөнгө", pronunciation: "Möngö", category: "objects" },
  { id: 129, english: "Work", mongolian: "Ажил", pronunciation: "Ajil", category: "basic" },
  { id: 130, english: "Life", mongolian: "Амьдрал", pronunciation: "Amidral", category: "basic" },

  // Weather
  { id: 131, english: "Rain", mongolian: "Бороо", pronunciation: "Boroo", category: "weather" },
  { id: 132, english: "Snow", mongolian: "Цас", pronunciation: "Tsas", category: "weather" },
  { id: 133, english: "Wind", mongolian: "Салхи", pronunciation: "Salkhi", category: "weather" },
  { id: 134, english: "Cloud", mongolian: "Үүл", pronunciation: "Üül", category: "weather" },
  { id: 135, english: "Weather", mongolian: "Цаг агаар", pronunciation: "Tsag agaar", category: "weather" },

  // More verbs
  { id: 136, english: "To love", mongolian: "Хайрлах", pronunciation: "Khairlakh", category: "verbs" },
  { id: 137, english: "To know", mongolian: "Мэдэх", pronunciation: "Medekh", category: "verbs" },
  { id: 138, english: "To want", mongolian: "Хүсэх", pronunciation: "Khüsekh", category: "verbs" },
  { id: 139, english: "To give", mongolian: "Өгөх", pronunciation: "Ögökh", category: "verbs" },
  { id: 140, english: "To take", mongolian: "Авах", pronunciation: "Avakh", category: "verbs" },

  // Directions
  { id: 141, english: "North", mongolian: "Хойд", pronunciation: "Khoid", category: "directions" },
  { id: 142, english: "South", mongolian: "Өмнөд", pronunciation: "Ömnöd", category: "directions" },
  { id: 143, english: "East", mongolian: "Дорнод", pronunciation: "Dornod", category: "directions" },
  { id: 144, english: "West", mongolian: "Баруун", pronunciation: "Baruun", category: "directions" },
  { id: 145, english: "Left", mongolian: "Зүүн", pronunciation: "Züün", category: "directions" },
  { id: 146, english: "Right", mongolian: "Баруун", pronunciation: "Baruun", category: "directions" },

  // Question words
  { id: 147, english: "What", mongolian: "Юу", pronunciation: "Yuu", category: "questions" },
  { id: 148, english: "Who", mongolian: "Хэн", pronunciation: "Khen", category: "questions" },
  { id: 149, english: "Where", mongolian: "Хаана", pronunciation: "Khaana", category: "questions" },
  { id: 150, english: "When", mongolian: "Хэзээ", pronunciation: "Khezee", category: "questions" },
];

export function getDailyWords(date: Date, count: number = 5): Word[] {
  const dateString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
    seed = seed & seed;
  }
  
  const seededRandom = (max: number) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % max;
  };

  const shuffled = [...dictionary];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = seededRandom(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

export function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed ?? Date.now();
  
  const seededRandom = () => {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    return currentSeed / 0x7fffffff;
  };

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
