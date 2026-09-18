import { Question, QuestionSet } from '../types/game';
import { QUESTION_BANK } from '../data/questions';
import {
  saveQuestionSet,
  getQuestionSetByCode,
  subscribeToQuestionSet,
  deleteQuestionSet,
  getCloudQuestions,
  saveCloudQuestions,
  clearCloudQuestions,
  subscribeToCloudQuestions,
} from '../services/firebaseQuestions';

const ACTIVE_CODE_KEY = 'ocean-racers-active-code';
const TEACHER_CODES_KEY = 'ocean-racers-teacher-codes';
const QS_CACHE_PREFIX = 'ocean-racers-qs-';
const LOCAL_STORAGE_KEY = 'globe-racers-custom-questions';

export interface TeacherCodeEntry {
  code: string;
  createdAt: number;
  teamACount: number;
  teamBCount: number;
}

// -------------------------------------------------------------
// 1. Active Game Code Coordination
// -------------------------------------------------------------
export function saveActiveGameCode(code: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_CODE_KEY, code.trim());
  } catch (err) {
    console.warn('Failed to save active game code to localStorage:', err);
  }
}

export function loadActiveGameCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const code = localStorage.getItem(ACTIVE_CODE_KEY);
    return code && code.trim().length > 0 ? code.trim() : null;
  } catch (err) {
    console.warn('Failed to load active game code from localStorage:', err);
    return null;
  }
}

export function clearActiveGameCode(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_CODE_KEY);
  } catch (err) {
    console.warn('Failed to clear active game code:', err);
  }
}

// -------------------------------------------------------------
// 2. Teacher's Code History ("My Question Sets")
// -------------------------------------------------------------
export function loadTeacherCodes(): TeacherCodeEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEACHER_CODES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load teacher codes from localStorage:', err);
    return [];
  }
}

export function saveTeacherCode(entry: TeacherCodeEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadTeacherCodes().filter((item) => item.code !== entry.code);
    const updated = [entry, ...existing].slice(0, 20); // Keep latest 20 codes
    localStorage.setItem(TEACHER_CODES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save teacher code entry:', err);
  }
}

export function removeTeacherCode(code: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadTeacherCodes().filter((item) => item.code !== code);
    localStorage.setItem(TEACHER_CODES_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('Failed to remove teacher code:', err);
  }
}

// -------------------------------------------------------------
// 3. Per-Code Offline Cache & Multi-Tier QuestionSet Coordinator
// -------------------------------------------------------------
export function cacheQuestionSetLocally(qs: QuestionSet): void {
  if (typeof window === 'undefined' || !qs?.code) return;
  try {
    localStorage.setItem(`${QS_CACHE_PREFIX}${qs.code}`, JSON.stringify(qs));
  } catch (err) {
    console.warn('Failed to cache question set locally:', err);
  }
}

export function loadQuestionSetFromLocalCache(code: string): QuestionSet | null {
  if (typeof window === 'undefined' || !code) return null;
  try {
    const raw = localStorage.getItem(`${QS_CACHE_PREFIX}${code.trim()}`);
    if (!raw) return null;
    return JSON.parse(raw) as QuestionSet;
  } catch (err) {
    console.warn(`Failed to read local cache for code ${code}:`, err);
    return null;
  }
}

export function removeQuestionSetFromLocalCache(code: string): void {
  if (typeof window === 'undefined' || !code) return;
  try {
    localStorage.removeItem(`${QS_CACHE_PREFIX}${code.trim()}`);
  } catch (err) {
    console.warn(`Failed to remove local cache for code ${code}:`, err);
  }
}

/**
 * Load QuestionSet by 4-digit code:
 * Fetches from Firestore, caches locally; falls back to local cache if offline.
 */
export async function loadQuestionSetByCode(code: string): Promise<QuestionSet | null> {
  const cleanCode = code.trim();
  if (!cleanCode) return null;

  try {
    const cloudQS = await getQuestionSetByCode(cleanCode);
    if (cloudQS && cloudQS.teamAQuestions && cloudQS.teamBQuestions) {
      cacheQuestionSetLocally(cloudQS);
      return cloudQS;
    }
  } catch (err) {
    console.warn(`Could not fetch code ${cleanCode} from cloud, checking offline cache:`, err);
  }

  // Offline Fallback
  return loadQuestionSetFromLocalCache(cleanCode);
}

/**
 * Save Dual-Team questions to Firestore, Local Cache, and Teacher History
 */
export async function saveDualTeamQuestions(
  teamAQuestions: Question[],
  teamBQuestions: Question[],
  existingCode?: string
): Promise<{ code: string; questionSet: QuestionSet }> {
  const code = await saveQuestionSet(teamAQuestions, teamBQuestions, existingCode);

  const questionSet: QuestionSet = {
    code,
    teamAQuestions,
    teamBQuestions,
    createdAt: Date.now(),
    createdBy: 'Teacher Dashboard',
    totalQuestions: teamAQuestions.length + teamBQuestions.length,
  };

  // Cache locally
  cacheQuestionSetLocally(questionSet);

  // Save to Teacher History
  saveTeacherCode({
    code,
    createdAt: questionSet.createdAt,
    teamACount: teamAQuestions.length,
    teamBCount: teamBQuestions.length,
  });

  // Set as active code
  saveActiveGameCode(code);

  return { code, questionSet };
}

/**
 * Delete QuestionSet from Firestore, local history, and local cache
 */
export async function deleteQuestionSetByCode(code: string): Promise<void> {
  const cleanCode = code.trim();
  await deleteQuestionSet(cleanCode);
  removeQuestionSetFromLocalCache(cleanCode);
  removeTeacherCode(cleanCode);

  const active = loadActiveGameCode();
  if (active === cleanCode) {
    clearActiveGameCode();
  }
}

// -------------------------------------------------------------
// Legacy Single-Set Support (Globe Racers default backward compat)
// -------------------------------------------------------------
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
  return loadCustomQuestions();
}

export async function saveCustomQuestionsToCloud(questions: Question[]): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(questions));
  }
  try {
    await saveCloudQuestions(questions);
  } catch (err) {
    console.warn('Failed to save to cloud database, local storage preserved:', err);
  }
}

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

export function exportQuestionsToJson(
  payloadOrQuestions: unknown,
  filename: string = 'question_set.json'
): void {
  const blob = new Blob([JSON.stringify(payloadOrQuestions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { subscribeToCloudQuestions, subscribeToQuestionSet };
