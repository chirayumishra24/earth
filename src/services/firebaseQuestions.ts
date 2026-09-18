import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Question, CloudQuestionsPayload } from '../types/game';

const GAME_ID = 'globe-racers';
const COLLECTION_NAME = 'games';

export function getQuestionsDocRef() {
  if (!db) return null;
  return doc(db, COLLECTION_NAME, GAME_ID);
}

/**
 * Fetch custom questions from Firestore cloud
 */
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

/**
 * Save custom questions to Firestore cloud
 */
export async function saveCloudQuestions(questions: Question[]): Promise<void> {
  const docRef = getQuestionsDocRef();
  if (!docRef || !isFirebaseConfigured) {
    console.info('Firebase not configured with active credentials. Saved to local storage tier.');
    return;
  }

  const payload: CloudQuestionsPayload = {
    questions,
    totalQuestions: questions.length,
    updatedAt: Date.now(),
    updatedBy: 'Teacher Dashboard',
  };

  await setDoc(docRef, payload);
}

/**
 * Delete questions from cloud to revert to default bank
 */
export async function clearCloudQuestions(): Promise<void> {
  const docRef = getQuestionsDocRef();
  if (!docRef || !isFirebaseConfigured) return;

  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Failed to clear cloud questions:', error);
  }
}

/**
 * Real-time listener for Firestore question updates
 */
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
