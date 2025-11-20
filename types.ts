
export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
  createdAt: number;
  color?: string; // For UI decoration
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GeneratedFlashcardResponse {
  front: string;
  back: string;
}

export type ViewMode = 'library' | 'player';

export type Grade = 'correct' | 'incorrect';
