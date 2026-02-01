import type { Word } from "@/data/dictionary";
import { animals_v1 } from "./animals.v1";
import { animals_v2 } from "./animals.v2";
import { missionary_starter_v1 } from "./missionary_starter.v1";

export type { DictionaryPackMeta, PackId } from "./manifest";
export { PACKS } from "./manifest";

export function getPackWords(packId: string, version: number): Word[] {
  if (packId === "animals") {
    if (version === 2) return animals_v2;
    if (version === 1) return animals_v1;
  }
  if (packId === "missionary_starter") {
    if (version === 1) return missionary_starter_v1;
  }
  return [];
}
