declare module 'natural' {
  export interface WordNetDefinition {
    synsetOffset: number;
    pos: string;
    lemma: string;
    synonyms: string[];
    gloss: string;
    exp?: string[];
  }

  export class WordNet {
    lookup(word: string, callback: (results: WordNetDefinition[]) => void): void;
  }
}