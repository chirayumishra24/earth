import { Question } from '../types/game';
import { QUESTION_BANK } from '../data/questions';

class QuestionPoolManager {
  private activeQuestions: Question[] = [...QUESTION_BANK];
  private usedQuestionIds: Set<string> = new Set();

  /**
   * Set new active question pool (e.g. from Excel/JSON or Cloud Sync)
   */
  setQuestions(newQuestions: Question[]): void {
    if (newQuestions && newQuestions.length > 0) {
      this.activeQuestions = [...newQuestions];
      this.resetSessionTracking();
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
   * Clear used questions memory
   */
  resetSessionTracking(): void {
    this.usedQuestionIds.clear();
  }

  /**
   * Select two distinct questions without immediate repetition
   */
  getTwoQuestions(): [Question, Question] {
    let available = this.activeQuestions.filter((q) => !this.usedQuestionIds.has(q.id));

    // If available questions are fewer than 2, reset tracking
    if (available.length < 2) {
      this.usedQuestionIds.clear();
      available = [...this.activeQuestions];
    }

    // Pick Q1
    const idx1 = Math.floor(Math.random() * available.length);
    const q1 = available[idx1];
    this.usedQuestionIds.add(q1.id);

    // Pick Q2 distinct from Q1
    const remaining = available.filter((q) => q.id !== q1.id);
    const pool2 = remaining.length > 0 ? remaining : this.activeQuestions.filter((q) => q.id !== q1.id);
    const idx2 = Math.floor(Math.random() * pool2.length);
    const q2 = pool2[idx2] || q1;
    this.usedQuestionIds.add(q2.id);

    return [q1, q2];
  }

  /**
   * Select a single distinct question for independent team queue
   */
  getNextQuestion(): Question {
    let available = this.activeQuestions.filter((q) => !this.usedQuestionIds.has(q.id));
    if (available.length === 0) {
      this.usedQuestionIds.clear();
      available = [...this.activeQuestions];
    }
    const idx = Math.floor(Math.random() * available.length);
    const q = available[idx] || this.activeQuestions[0];
    this.usedQuestionIds.add(q.id);
    return q;
  }
}

export const questionManager = new QuestionPoolManager();
