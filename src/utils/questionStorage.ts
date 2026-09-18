import { Question } from '../types/game';
import { QUESTION_BANK } from '../data/questions';
import {
  getCloudQuestions,
  saveCloudQuestions,
  clearCloudQuestions,
  subscribeToCloudQuestions,
} from '../services/firebaseQuestions';

const LOCAL_STORAGE_KEY = 'globe-racers-custom-questions';

/**
 * Load custom questions from browser LocalStorage cache (Tier 2)
 */
export function loadCustomQuestions(): Question[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (err) {
    console.warn('Failed to load questions from localStorage:', err);
    return null;
  }
}

/**
 * Sync questions from Firestore Cloud (Tier 1). Updates localStorage on success.
 */
export async function syncQuestionsFromCloud(): Promise<Question[] | null> {
  try {
    const cloudQuestions = await getCloudQuestions();
    if (cloudQuestions && cloudQuestions.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudQuestions));
      }
      return cloudQuestions;
    }
  } catch (err) {
    console.warn('Could not sync from cloud, falling back to local tier:', err);
  }

  // Fallback to local cache
  return loadCustomQuestions();
}

/**
 * Save custom questions to LocalStorage AND Firestore Cloud
 */
export async function saveCustomQuestionsToCloud(questions: Question[]): Promise<void> {
  // 1. Cache to LocalStorage immediately
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(questions));
  }

  // 2. Persist to Firestore Cloud
  try {
    await saveCloudQuestions(questions);
  } catch (err) {
    console.warn('Failed to save to cloud database, local storage preserved:', err);
  }
}

/**
 * Clear custom questions from LocalStorage and Cloud, restoring default bank
 */
export async function clearCustomQuestionsFromCloud(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  try {
    await clearCloudQuestions();
  } catch (err) {
    console.warn('Failed to clear cloud questions:', err);
  }
}

/**
 * 1-Click JSON export of any question set
 */
export function exportQuestionsToJson(
  questions: Question[],
  filename: string = 'globe_racers_questions.json'
): void {
  const payload = {
    game: 'globe-racers',
    totalQuestions: questions.length,
    exportedAt: new Date().toISOString(),
    questions,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { subscribeToCloudQuestions };
