import type { Word } from "@/data/dictionary";
import { getAcceptedPacks } from "@/lib/storage";
import { getPackWords } from "@/data/packs";

export async function getAcceptedPackWords(): Promise<Word[]> {
  const accepted = await getAcceptedPacks();
  const all: Word[] = [];
  for (const p of accepted) {
    all.push(...getPackWords(p.id, p.version));
  }
  return all;
}
