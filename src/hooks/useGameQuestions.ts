import { useState, useEffect, useCallback } from 'react';
import { Question } from '../types/game';
import { QUESTION_BANK } from '../data/questions';
import {
  syncQuestionsFromCloud,
  subscribeToCloudQuestions,
  loadCustomQuestions,
} from '../utils/questionStorage';
import { questionManager } from '../utils/questionManager';

export function useGameQuestions() {
  const [questions, setQuestionsState] = useState<Question[]>(() => {
    // Initial tier 2 local storage check
    const local = loadCustomQuestions();
    return local && local.length > 0 ? local : QUESTION_BANK;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply new questions to state & pool manager
  const updateQuestions = useCallback((newQuestions: Question[]) => {
    setQuestionsState(newQuestions);
    questionManager.setQuestions(newQuestions);
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial Cloud Sync (Tier 1)
    syncQuestionsFromCloud().then((cloudQ) => {
      if (isMounted && cloudQ && cloudQ.length > 0) {
        updateQuestions(cloudQ);
      }
      if (isMounted) setIsLoading(false);
    });

    // 2. Real-time Subscription to Firestore Cloud
    const unsubscribe = subscribeToCloudQuestions((liveQuestions) => {
      if (!isMounted) return;
      if (liveQuestions && liveQuestions.length > 0) {
        updateQuestions(liveQuestions);
      } else {
        // Revert to local or default if cloud cleared
        const local = loadCustomQuestions();
        updateQuestions(local && local.length > 0 ? local : QUESTION_BANK);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [updateQuestions]);

  return {
    questions,
    isLoading,
    updateQuestions,
    getTwoQuestions: () => questionManager.getTwoQuestions(),
    getNextQuestion: (excludeIds?: string[]) => questionManager.getNextQuestion(excludeIds),
    resetSessionTracking: () => questionManager.resetSessionTracking(),
  };
}
