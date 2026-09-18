import { Question } from '../types/game';
import { QUESTION_BANK } from '../data/questions';

class QuestionPoolManager {
  private activeQuestions: Question[] = [...QUESTION_BANK];
  private shuffledDeck: Question[] = [];
  private usedQuestionIds: Set<string> = new Set();
  private currentIndex: number = 0;

  constructor() {
    this.initDeck();
  }

  /**
   * Fisher-Yates Shuffle the active questions into a clean non-repeating deck
   */
  private initDeck(): void {
    this.shuffledDeck = [...this.activeQuestions];
    for (let i = this.shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledDeck[i], this.shuffledDeck[j]] = [this.shuffledDeck[j], this.shuffledDeck[i]];
    }
    this.currentIndex = 0;
    this.usedQuestionIds.clear();
  }

  /**
   * Set new active question pool (e.g. from Excel/JSON or Cloud Sync)
   * Only re-initializes if the incoming question set actually changed
   */
  setQuestions(newQuestions: Question[]): void {
    if (newQuestions && newQuestions.length > 0) {
      const currentIds = this.activeQuestions.map((q) => q.id).sort().join(',');
      const incomingIds = newQuestions.map((q) => q.id).sort().join(',');
      if (currentIds !== incomingIds) {
        this.activeQuestions = [...newQuestions];
        this.initDeck();
      }
    }
  }

  /**
   * Get all active questions in current pool
   */
  getActiveQuestions(): Question[] {
    return this.activeQuestions;
  }

  /**
   * Total number of questions in active pool
   */
  getCount(): number {
    return this.activeQuestions.length;
  }

  /**
   * Reset game session tracking and reshuffle a fresh deck
   */
  resetSessionTracking(): void {
    this.initDeck();
  }

  /**
   * Select two distinct questions without repetition
   */
  getTwoQuestions(): [Question, Question] {
    const q1 = this.getNextQuestion();
    const q2 = this.getNextQuestion([q1.id]);
    return [q1, q2];
  }

  /**
   * Select the next strictly non-repeating question from the randomized deck,
   * guaranteeing it has not been used in this session and is not in excludeIds.
   */
  getNextQuestion(excludeIds: string[] = []): Question {
    const excludeSet = new Set(excludeIds);

    let selected: Question | null = null;

    // Scan through the shuffled deck starting from currentIndex
    while (this.currentIndex < this.shuffledDeck.length) {
      const candidate = this.shuffledDeck[this.currentIndex];
      this.currentIndex++;
      if (!this.usedQuestionIds.has(candidate.id) && !excludeSet.has(candidate.id)) {
        selected = candidate;
        break;
      }
    }

    // If reached the end of current index, search any remaining unused questions
    if (!selected) {
      const unused = this.shuffledDeck.filter(
        (q) => !this.usedQuestionIds.has(q.id) && !excludeSet.has(q.id)
      );
      if (unused.length > 0) {
        selected = unused[0];
      } else {
        // All questions in deck have been used; reshuffle non-screen questions as backup
        const available = this.activeQuestions.filter((q) => !excludeSet.has(q.id));
        selected = available[Math.floor(Math.random() * available.length)] || this.activeQuestions[0];
      }
    }

    this.usedQuestionIds.add(selected.id);
    return selected;
  }
}

export const questionManager = new QuestionPoolManager();
