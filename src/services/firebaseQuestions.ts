import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Question, QuestionSet, CloudQuestionsPayload } from '../types/game';

const COLLECTION_NAME = 'games';

/**
 * Generate a collision-free 4-digit numeric code (1000–9999)
 */
export async function generateUniqueGameCode(): Promise<string> {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = String(Math.floor(1000 + Math.random() * 9000));

    if (!db || !isFirebaseConfigured) {
      return code;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, code);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        return code;
      }
    } catch (err) {
      console.warn('Firebase error checking code collision, using generated code:', err);
      return code;
    }
  }

  // Fallback if max attempts reached
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Save QuestionSet (Team A + Team B) to games/{code}
 */
export async function saveQuestionSet(
  teamAQuestions: Question[],
  teamBQuestions: Question[],
  existingCode?: string
): Promise<string> {
  const code = existingCode || (await generateUniqueGameCode());

  const questionSet: QuestionSet = {
    code,
    teamAQuestions,
    teamBQuestions,
    createdAt: Date.now(),
    createdBy: 'Teacher Dashboard',
    totalQuestions: teamAQuestions.length + teamBQuestions.length,
  };

  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, COLLECTION_NAME, code);
      await setDoc(docRef, questionSet);
    } catch (err) {
      console.warn('Failed to save question set to Firestore:', err);
    }
  }

  return code;
}

/**
 * Read QuestionSet from games/{code}
 */
export async function getQuestionSetByCode(code: string): Promise<QuestionSet | null> {
  if (!db || !isFirebaseConfigured || !code) return null;

  try {
    const docRef = doc(db, COLLECTION_NAME, code.trim());
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as QuestionSet;
    }
    return null;
  } catch (err) {
    console.warn(`Failed to fetch game code ${code} from Firebase:`, err);
    return null;
  }
}

/**
 * Real-time Firestore subscription to games/{code}
 */
export function subscribeToQuestionSet(
  code: string,
  callback: (qs: QuestionSet | null) => void
): () => void {
  if (!db || !isFirebaseConfigured || !code) {
    return () => {};
  }

  const docRef = doc(db, COLLECTION_NAME, code.trim());
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as QuestionSet);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn(`Firestore subscription error on code ${code}:`, err);
    }
  );
}

/**
 * Delete QuestionSet from games/{code}
 */
export async function deleteQuestionSet(code: string): Promise<void> {
  if (!db || !isFirebaseConfigured || !code) return;

  try {
    const docRef = doc(db, COLLECTION_NAME, code.trim());
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Failed to delete code ${code} from Firestore:`, err);
  }
}

// -------------------------------------------------------------
// Legacy Single-Set Support (Globe Racers default backward compat)
// -------------------------------------------------------------
const LEGACY_DOC_ID = 'globe-racers';

export function getQuestionsDocRef() {
  if (!db) return null;
  return doc(db, COLLECTION_NAME, LEGACY_DOC_ID);
}

export async function getCloudQuestions(): Promise<Question[] | null> {
  const docRef = getQuestionsDocRef();
  if (!docRef || !isFirebaseConfigured) return null;

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CloudQuestionsPayload;
      return data.questions || [];
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch questions from Firebase Cloud:', error);
    return null;
  }
}

export async function saveCloudQuestions(questions: Question[]): Promise<void> {
  const docRef = getQuestionsDocRef();
  if (!docRef || !isFirebaseConfigured) return;

  const payload: CloudQuestionsPayload = {
    questions,
    totalQuestions: questions.length,
    updatedAt: Date.now(),
    updatedBy: 'Teacher Dashboard',
  };

  await setDoc(docRef, payload);
}

export async function clearCloudQuestions(): Promise<void> {
  const docRef = getQuestionsDocRef();
  if (!docRef || !isFirebaseConfigured) return;

  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Failed to clear cloud questions:', error);
  }
}

export function subscribeToCloudQuestions(
  callback: (questions: Question[] | null) => void
): () => void {
  const docRef = getQuestionsDocRef();
  if (!docRef || !isFirebaseConfigured) {
    return () => {};
  }

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as CloudQuestionsPayload;
        callback(data.questions || []);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Firestore subscription error:', err);
    }
  );
}
