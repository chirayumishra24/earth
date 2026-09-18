export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = string;
export type QuestionType = 'multiple-choice' | 'true-false';

export type TeamId = 'northStar' | 'earthExplorers';

export interface TeamInfo {
  id: TeamId;
  name: string;
  tagline: string;
  badge: string;
  color: 'blue' | 'orange';
  characterName: string;
  characterImage: string;
  vehicleImage: string;
  accentHex: string;
  bgHex: string;
}

export type QuestionTopic =
  | 'Maps & Globes'
  | 'Latitudes'
  | 'Longitudes'
  | 'Directions'
  | 'Hemispheres'
  | 'Coordinates Grid'
  | string;

export type VisualType =
  | 'none'
  | 'coordinate_grid'
  | 'compass'
  | 'equator_globe'
  | 'prime_meridian'
  | 'hemisphere_split'
  | 'tropics_diagram';

export interface Question {
  id: string;
  question: string;
  options: string[];            // 2 to 4 options
  correctAnswer?: number;       // 0-indexed (0 = A, 1 = B, 2 = C, 3 = D)
  correctIndex?: number;        // Backward-compatible alias
  difficulty: Difficulty;       // easy | medium | hard
  category?: Category;          // topic/subject
  topic?: QuestionTopic;        // Backward-compatible alias
  explanation: string;          // learning hint/explanation
  type?: QuestionType;          // multiple-choice | true-false
  visualType?: VisualType;
  gridTarget?: { col: string; row: number };
}

export type GameStatus =
  | 'start'
  | 'team_select'
  | 'how_to_play'
  | 'racing'
  | 'round_result'
  | 'tie_breaker'
  | 'winner'
  | 'summary';

export type RoundType = 'standard' | 'double_checkpoint' | 'lightning';

export interface TeamProgress {
  score: number;
  position: number; // 0 to TOTAL_CHECKPOINTS
  quarterLaps: number; // integer count of 1/4 laps (1 quarter = 1 correct answer = 90 deg)
  laps: number; // quarterLaps / 4 (e.g. 0, 0.25, 0.5, 0.75, 1.0...)
  correctAnswersCount: number;
  totalAnswersCount: number;
  selectedOption: number | null;
  hasSubmitted: boolean;
  isCorrect: boolean | null;
  isBoosting: boolean; // triggers rocket acceleration / thruster flame
  isWobbling: boolean; // triggers wrong-answer shake
  streak: number;
}

export interface GameState {
  currentRound: number;
  maxRounds: number;
  totalCheckpoints: number;
  status: GameStatus;
  roundType: RoundType;
  timerSeconds: number;
  isTimerRunning: boolean;
  selectedPlayerTeam: TeamId | 'spectator';
  northStar: TeamProgress;
  earthExplorers: TeamProgress;
  currentNorthQuestion: Question | null;
  currentEarthQuestion: Question | null;
  winner: TeamId | 'tie' | null;
  soundEnabled: boolean;
  showGlobeModal: boolean;
}

export interface CloudQuestionsPayload {
  questions: Question[];
  updatedAt: number;
  totalQuestions: number;
  updatedBy?: string;
}

export interface QuestionSet {
  code: string;                 // 4-digit unique code (e.g. "4829")
  teamAQuestions: Question[];   // Questions for Team A (North Star / Red)
  teamBQuestions: Question[];   // Questions for Team B (Earth Explorers / Blue)
  createdAt: number;            // Timestamp
  createdBy?: string;           // "Teacher Dashboard"
  totalQuestions: number;       // teamAQuestions.length + teamBQuestions.length
}

