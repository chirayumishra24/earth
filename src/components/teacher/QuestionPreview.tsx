'use client';

import React, { useState } from 'react';
import { Question, Difficulty } from '../../types/game';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Layers,
  Edit2,
  Trash2,
  Plus,
  Save,
  X,
  Scale,
  Sparkles,
} from 'lucide-react';

interface QuestionPreviewProps {
  questions: Question[];
  teamAQuestions?: Question[];
  teamBQuestions?: Question[];
  hasTeamSheets?: boolean;
  errors: string[];
  warnings: string[];
  onUpdateQuestion?: (id: string, updated: Question) => void;
  onDeleteQuestion?: (id: string) => void;
  onAddQuestion?: (newQ: Question, targetTeam: 'teamA' | 'teamB' | 'both') => void;
}

export default function QuestionPreview({
  questions,
  teamAQuestions = [],
  teamBQuestions = [],
  hasTeamSheets = false,
  errors,
  warnings,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion,
}: QuestionPreviewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'teamA' | 'teamB'>('all');
  const letters = ['A', 'B', 'C', 'D'];

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: Difficulty;
    category: string;
    explanation: string;
  } | null>(null);

  // Add Question state
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState<{
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: Difficulty;
    category: string;
    explanation: string;
    targetTeam: 'teamA' | 'teamB' | 'both';
  }>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'easy',
    category: 'General',
    explanation: '',
    targetTeam: 'both',
  });

  const displayedQuestions =
    activeTab === 'teamA'
      ? teamAQuestions.length > 0 ? teamAQuestions : questions
      : activeTab === 'teamB'
      ? teamBQuestions.length > 0 ? teamBQuestions : questions
      : questions;

  const easyCount = displayedQuestions.filter((q) => q.difficulty === 'easy').length;
  const medCount = displayedQuestions.filter((q) => q.difficulty === 'medium').length;
  const hardCount = displayedQuestions.filter((q) => q.difficulty === 'hard').length;

  const teamDiff = Math.abs((teamAQuestions.length || 0) - (teamBQuestions.length || 0));
  const isImbalanced = hasTeamSheets && teamDiff > 2;

  // Start editing a question
  const startEditing = (q: Question) => {
    setEditingId(q.id);
    const correctIdx = q.correctAnswer ?? q.correctIndex ?? 0;
    const filledOptions = [...q.options];
    while (filledOptions.length < 4) {
      filledOptions.push('');
    }
    setEditForm({
      question: q.question,
      options: filledOptions,
      correctAnswer: correctIdx,
      difficulty: q.difficulty || 'medium',
      category: q.category || q.topic || 'Geography',
      explanation: q.explanation || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEditing = (id: string) => {
    if (!editForm || !onUpdateQuestion) return;
    const cleanOptions = editForm.options.map((o) => o.trim()).filter(Boolean);
    if (!editForm.question.trim() || cleanOptions.length < 2) {
      alert('Question must have a prompt and at least 2 non-empty options.');
      return;
    }

    const updated: Question = {
      id,
      question: editForm.question.trim(),
      options: cleanOptions,
      correctAnswer: Math.min(editForm.correctAnswer, cleanOptions.length - 1),
      difficulty: editForm.difficulty,
      category: editForm.category.trim() || 'Geography',
      explanation: editForm.explanation.trim(),
      type: 'multiple-choice',
    };

    onUpdateQuestion(id, updated);
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveNewQuestion = () => {
    if (!onAddQuestion) return;
    const cleanOptions = newQuestionForm.options.map((o) => o.trim()).filter(Boolean);
    if (!newQuestionForm.question.trim() || cleanOptions.length < 2) {
      alert('Please provide a question and at least 2 options.');
      return;
    }

    const newQ: Question = {
      id: `q-${Date.now()}`,
      question: newQuestionForm.question.trim(),
      options: cleanOptions,
      correctAnswer: Math.min(newQuestionForm.correctAnswer, cleanOptions.length - 1),
      difficulty: newQuestionForm.difficulty,
      category: newQuestionForm.category.trim() || 'Geography',
      explanation: newQuestionForm.explanation.trim(),
      type: 'multiple-choice',
    };

    onAddQuestion(newQ, newQuestionForm.targetTeam);
    setIsAdding(false);
    setNewQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'easy',
      category: 'General',
      explanation: '',
      targetTeam: 'both',
    });
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Imbalance Warning Notification */}
      {isImbalanced && (
        <div className="clay-card p-3.5 bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl flex items-center gap-3 shadow-sm">
          <Scale className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-black">Team Question Imbalance: </span>
            <span>
              Team Red has {teamAQuestions.length} questions, while Team Blue has {teamBQuestions.length}. We recommend balancing both question sets so students receive an equal challenge.
            </span>
          </div>
        </div>
      )}

      {/* Errors Notification Box */}
      {errors.length > 0 && (
        <div className="clay-card p-4 bg-rose-50 border-2 border-rose-300 text-rose-800 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 font-black text-sm text-rose-900 mb-1.5">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Parsing Errors Found ({errors.length}):</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 font-semibold pl-1">
            {errors.map((err, i) => (
              <li key={i} className="leading-snug">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings Notification Box */}
      {warnings.length > 0 && (
        <div className="clay-card p-3.5 bg-amber-50 border-2 border-amber-300 text-amber-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Parsing Warnings ({warnings.length}):</span>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-0.5 font-semibold pl-1">
            {warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Questions Preview Table */}
      {questions.length > 0 && (
        <div className="w-full clay-card bg-white/95 rounded-2xl border border-sky-200 overflow-hidden shadow-xl">
          {/* Header & Tabs */}
          <div className="px-4 py-3 bg-gradient-to-r from-sky-100/90 to-blue-50/90 border-b border-sky-200 flex flex-wrap items-center justify-between gap-2">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'clay-blue text-white shadow'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-sky-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Questions ({questions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('teamA')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'teamA'
                    ? 'bg-rose-500 text-white shadow-[0_4px_10px_rgba(244,63,94,0.3)]'
                    : 'bg-white/80 hover:bg-white text-rose-700 border border-rose-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Team A / Red ({teamAQuestions.length > 0 ? teamAQuestions.length : questions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('teamB')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'teamB'
                    ? 'clay-blue text-white shadow'
                    : 'bg-white/80 hover:bg-white text-sky-700 border border-sky-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Team B / Blue ({teamBQuestions.length > 0 ? teamBQuestions.length : questions.length})</span>
              </button>
            </div>

            {/* Quick Actions & Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {onAddQuestion && (
                <button
                  type="button"
                  onClick={() => setIsAdding(!isAdding)}
                  className="px-3 py-1 rounded-xl clay-green text-white text-xs font-black flex items-center gap-1 shadow-sm hover:scale-105 transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              )}

              {/* Difficulty Breakdown Badges */}
              <div className="flex items-center gap-1 text-[10px] font-black">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Easy: {easyCount}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Med: {medCount}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  Hard: {hardCount}
                </span>
              </div>
            </div>
          </div>

          {/* Add Question Inline Card */}
          {isAdding && (
            <div className="p-4 bg-emerald-50/70 border-b-2 border-emerald-200 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-emerald-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Create New Question
                </span>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Question Prompt</label>
                  <input
                    type="text"
                    value={newQuestionForm.question}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                    placeholder="e.g. Which ocean borders the eastern coast of Africa?"
                    className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {newQuestionForm.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewQuestionForm({ ...newQuestionForm, correctAnswer: optIdx })}
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border transition-all ${
                          newQuestionForm.correctAnswer === optIdx
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                        title="Click to set as correct answer"
                      >
                        {letters[optIdx]}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...newQuestionForm.options];
                          nextOpts[optIdx] = e.target.value;
                          setNewQuestionForm({ ...newQuestionForm, options: nextOpts });
                        }}
                        placeholder={`Option ${letters[optIdx]}`}
                        className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Team</label>
                    <select
                      value={newQuestionForm.targetTeam}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, targetTeam: e.target.value as any })}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="both">Both Teams (Shared)</option>
                      <option value="teamA">Team Red Only</option>
                      <option value="teamB">Team Blue Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Difficulty</label>
                    <select
                      value={newQuestionForm.difficulty}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value as Difficulty })}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Topic / Category</label>
                    <input
                      type="text"
                      value={newQuestionForm.category}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, category: e.target.value })}
                      placeholder="e.g. Oceans"
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Explanation / Hint</label>
                  <input
                    type="text"
                    value={newQuestionForm.explanation}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                    placeholder="e.g. The Indian Ocean lies between Africa, Asia, and Australia."
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewQuestion}
                    className="px-4 py-1 rounded-xl clay-green text-white font-black text-xs shadow-sm"
                  >
                    Save & Add Question
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-sky-100">
            {displayedQuestions.map((q, idx) => {
              const isEditing = editingId === q.id;
              const diffColor =
                q.difficulty === 'easy'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : q.difficulty === 'hard'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300';

              const isTeamA = q.id.startsWith('teamA-');
              const isTeamB = q.id.startsWith('teamB-');

              if (isEditing && editForm) {
                return (
                  <div key={q.id || idx} className="p-3.5 bg-sky-50/80 border-l-4 border-sky-500 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sky-900">Editing Question #{idx + 1}</span>
                      <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={editForm.question}
                      onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-sky-300 text-xs font-bold"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {editForm.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, correctAnswer: optIdx })}
                            className={`w-5 h-5 rounded text-[10px] font-black shrink-0 ${
                              editForm.correctAnswer === optIdx
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                            title="Set as correct"
                          >
                            {letters[optIdx]}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const nextOpts = [...editForm.options];
                              nextOpts[optIdx] = e.target.value;
                              setEditForm({ ...editForm, options: nextOpts });
                            }}
                            className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={editForm.difficulty}
                        onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value as Difficulty })}
                        className="px-2 py-1 rounded border border-slate-200 text-xs"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>

                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        placeholder="Category"
                        className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs"
                      />
                    </div>

                    <input
                      type="text"
                      value={editForm.explanation}
                      onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                      placeholder="Explanation"
                      className="w-full px-2 py-1 rounded border border-slate-200 text-xs"
                    />

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEditing(q.id)}
                        className="px-3 py-1 rounded-lg clay-blue text-white font-black flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={q.id || idx} className="p-3.5 hover:bg-sky-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-800 font-mono text-[10px] flex items-center justify-center font-black">
                        {idx + 1}
                      </span>
                      <span className="font-black text-sm text-slate-800">{q.question}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isTeamA && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300">
                          Team Red
                        </span>
                      )}
                      {isTeamB && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-300">
                          Team Blue
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                        {q.category || q.topic || 'General'}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${diffColor}`}>
                        {q.difficulty}
                      </span>

                      {/* Edit and Delete Buttons */}
                      {onUpdateQuestion && (
                        <button
                          onClick={() => startEditing(q)}
                          className="p-1 rounded-md hover:bg-sky-100 text-slate-400 hover:text-sky-700 transition-colors ml-1"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteQuestion && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete question: "${q.question}"?`)) {
                              onDeleteQuestion(q.id);
                            }
                          }}
                          className="p-1 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Options Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === (q.correctAnswer ?? q.correctIndex);
                      return (
                        <div
                          key={optIdx}
                          className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-black shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 font-semibold'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {letters[optIdx]}
                          </span>
                          <span className="truncate">{opt}</span>
                          {isCorrect && (
                            <span className="ml-auto text-[10px] text-emerald-700 font-black">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="text-[11px] text-slate-500 italic mt-1.5 font-medium">
                      💡 <span className="font-bold text-slate-700">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
