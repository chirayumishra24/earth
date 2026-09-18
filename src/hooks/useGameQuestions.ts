import { useState, useEffect, useCallback } from 'react';
import { Question, QuestionSet } from '../types/game';
import { QUESTION_BANK } from '../data/questions';
import { QuestionManager } from '../utils/questionManager';
import {
  loadActiveGameCode,
  saveActiveGameCode,
  clearActiveGameCode,
  loadQuestionSetByCode,
  subscribeToQuestionSet,
  syncQuestionsFromCloud,
  loadCustomQuestions,
} from '../utils/questionStorage';

export function useGameQuestions() {
  const [redQM] = useState(() => new QuestionManager());
  const [blueQM] = useState(() => new QuestionManager());

  const [activeGameCode, setActiveGameCodeState] = useState<string | null>(() => loadActiveGameCode());
  const [teamAQuestions, setTeamAQuestions] = useState<Question[]>(QUESTION_BANK);
  const [teamBQuestions, setTeamBQuestions] = useState<Question[]>(QUESTION_BANK);
  const [activeQuestionSet, setActiveQuestionSet] = useState<QuestionSet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply QuestionSet helper
  const applyQuestionSet = useCallback(
    (qs: QuestionSet | null) => {
      if (qs && qs.teamAQuestions && qs.teamBQuestions) {
        setActiveQuestionSet(qs);
        setTeamAQuestions(qs.teamAQuestions);
        setTeamBQuestions(qs.teamBQuestions);
        redQM.setQuestions(qs.teamAQuestions);
        blueQM.setQuestions(qs.teamBQuestions);
      } else {
        setActiveQuestionSet(null);
        setTeamAQuestions(QUESTION_BANK);
        setTeamBQuestions(QUESTION_BANK);
        redQM.setQuestions(QUESTION_BANK);
        blueQM.setQuestions(QUESTION_BANK);
      }
    },
    [redQM, blueQM]
  );

  // Set or clear active game code
  const setGameCode = useCallback(
    async (code: string | null): Promise<boolean> => {
      if (!code || code.trim().length === 0) {
        clearActiveGameCode();
        setActiveGameCodeState(null);
        applyQuestionSet(null);
        return true;
      }

      const cleanCode = code.trim();
      const qs = await loadQuestionSetByCode(cleanCode);
      if (qs && qs.teamAQuestions?.length > 0 && qs.teamBQuestions?.length > 0) {
        saveActiveGameCode(cleanCode);
        setActiveGameCodeState(cleanCode);
        applyQuestionSet(qs);
        return true;
      }

      return false;
    },
    [applyQuestionSet]
  );

  // Initial load on mount
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsLoading(true);
      const savedCode = loadActiveGameCode();
      if (savedCode) {
        const qs = await loadQuestionSetByCode(savedCode);
        if (isMounted) {
          if (qs) {
            setActiveGameCodeState(qs.code);
            applyQuestionSet(qs);
          } else {
            clearActiveGameCode();
            setActiveGameCodeState(null);
            applyQuestionSet(null);
          }
        }
      } else {
        const local = loadCustomQuestions();
        if (local && local.length > 0) {
          if (isMounted) {
            setTeamAQuestions(local);
            setTeamBQuestions(local);
            redQM.setQuestions(local);
            blueQM.setQuestions(local);
          }
        } else {
          const cloud = await syncQuestionsFromCloud();
          if (isMounted && cloud && cloud.length > 0) {
            setTeamAQuestions(cloud);
            setTeamBQuestions(cloud);
            redQM.setQuestions(cloud);
            blueQM.setQuestions(cloud);
          }
        }
      }
      if (isMounted) setIsLoading(false);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [applyQuestionSet, redQM, blueQM]);

  // Real-time listener for active room code
  useEffect(() => {
    if (!activeGameCode) return;

    const unsubscribe = subscribeToQuestionSet(activeGameCode, (liveQs) => {
      if (liveQs) {
        applyQuestionSet(liveQs);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeGameCode, applyQuestionSet]);

  // Reset session tracking for both teams
  const resetSessionTracking = useCallback(() => {
    redQM.resetSessionTracking();
    blueQM.resetSessionTracking();
  }, [redQM, blueQM]);

  // Update questions directly (e.g. from Teacher Dashboard)
  const updateQuestions = useCallback(
    (newQuestions: Question[]) => {
      setTeamAQuestions(newQuestions);
      setTeamBQuestions(newQuestions);
      redQM.setQuestions(newQuestions);
      blueQM.setQuestions(newQuestions);
    },
    [redQM, blueQM]
  );

  return {
    activeGameCode,
    setGameCode,
    teamAQuestions,
    teamBQuestions,
    activeQuestionSet,
    questions: teamAQuestions,
    isLoading,
    updateQuestions,
    getNextQuestionTeamA: (excludeIds?: string[]) => redQM.getNextQuestion(excludeIds),
    getNextQuestionTeamB: (excludeIds?: string[]) => blueQM.getNextQuestion(excludeIds),
    getNextQuestion: (excludeIds?: string[]) => redQM.getNextQuestion(excludeIds),
    resetSessionTracking,
  };
}
