import type { Word } from "@/data/dictionary";
import { animals_v1 } from "./animals.v1";

export type { DictionaryPackMeta, PackId } from "./manifest";
export { PACKS } from "./manifest";

export function getPackWords(packId: string, version: number): Word[] {
  if (packId === "animals" && version === 1) return animals_v1;
  return [];
}
