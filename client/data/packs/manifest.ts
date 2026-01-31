export type PackId = string;

export interface DictionaryPackMeta {
  id: PackId;
  version: number;
  title: string;
  description: string;
  wordCount: number;
}

export const PACKS: DictionaryPackMeta[] = [
  {
    id: "animals",
    version: 2,
    title: "Animals Pack",
    description: "Common animal vocabulary with 15 essential words.",
    wordCount: 15,
  },
];
