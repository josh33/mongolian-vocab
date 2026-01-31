import type { Word } from "../dictionary";

export type WordBundle = {
  bundleId: string;
  title: string;
  description?: string;
  words: Word[];
};
