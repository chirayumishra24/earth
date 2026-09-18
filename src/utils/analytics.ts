import { TeamId, TeamProgress, MissedQuestionRecord } from '../types/game';

export interface MatchReportData {
  gameCode?: string | null;
  timestamp: string;
  durationSeconds: number;
  winner: TeamId | 'tie';
  teamNorthStar: {
    name: string;
    laps: number;
    quarterLaps: number;
    score: number;
    correctAnswers: number;
    totalAnswers: number;
    accuracyPercent: number;
    maxStreak: number;
  };
  teamEarthExplorers: {
    name: string;
    laps: number;
    quarterLaps: number;
    score: number;
    correctAnswers: number;
    totalAnswers: number;
    accuracyPercent: number;
    maxStreak: number;
  };
  missedQuestions: MissedQuestionRecord[];
}

export function generateMatchReport(
  winner: TeamId | 'tie',
  northProgress: TeamProgress,
  earthProgress: TeamProgress,
  missedQuestions: MissedQuestionRecord[],
  gameCode?: string | null,
  durationSeconds: number = 300
): MatchReportData {
  const northAccuracy =
    northProgress.totalAnswersCount > 0
      ? Math.round((northProgress.correctAnswersCount / northProgress.totalAnswersCount) * 100)
      : 0;
  const earthAccuracy =
    earthProgress.totalAnswersCount > 0
      ? Math.round((earthProgress.correctAnswersCount / earthProgress.totalAnswersCount) * 100)
      : 0;

  return {
    gameCode: gameCode || 'Standard Bank',
    timestamp: new Date().toLocaleString(),
    durationSeconds,
    winner,
    teamNorthStar: {
      name: 'Team North Star (Red Airplane)',
      laps: northProgress.laps,
      quarterLaps: northProgress.quarterLaps,
      score: northProgress.score,
      correctAnswers: northProgress.correctAnswersCount,
      totalAnswers: northProgress.totalAnswersCount,
      accuracyPercent: northAccuracy,
      maxStreak: northProgress.maxStreak || northProgress.streak,
    },
    teamEarthExplorers: {
      name: 'Team Earth Explorers (Blue Airplane)',
      laps: earthProgress.laps,
      quarterLaps: earthProgress.quarterLaps,
      score: earthProgress.score,
      correctAnswers: earthProgress.correctAnswersCount,
      totalAnswers: earthProgress.totalAnswersCount,
      accuracyPercent: earthAccuracy,
      maxStreak: earthProgress.maxStreak || earthProgress.streak,
    },
    missedQuestions,
  };
}
