export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  targetWords: string[]; // 클릭할 단어 (+10)
  avoidWords: string[];  // 클릭하면 안 되는 단어 (-10)
  difficulty: Difficulty;
  gameDuration: number;  // 게임 제한 시간 (초, 기본 30)
}

export interface MoleState {
  id: number;
  isActive: boolean;     // 두더지가 튀어나왔는지 여부
  word: string;          // 그 두더지가 아고 있는 단어
  isTarget: boolean;     // 클릭 대상 단어인지 여부
  isHit: boolean;        // 뿅망치에 맞았는지 여부
  hitStatus: 'correct' | 'incorrect' | null; // 올바른 타격인지 여부
}

export interface HitLog {
  id: string;
  word: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface GameScoreHistory {
  date: number;
  score: number;
  correctHits: number;
  incorrectHits: number;
  accuracy: number;
}
